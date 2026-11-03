import type { StorageBucket } from "../constants";
import { STORAGE_BUCKETS } from "../constants";
import type { Env } from "../types";

export class SupabaseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "SupabaseError";
  }
}

function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function bucketForFile(file: File): StorageBucket {
  if (file.type.startsWith("video/")) return "videos";
  if (file.type.startsWith("image/")) return "images";
  return "documents";
}

function objectPath(url: string, bucket: string): string {
  const marker = "/storage/v1/object/public/";
  const after = url.split(marker)[1] ?? url;
  const prefix = `${bucket}/`;
  return after.startsWith(prefix) ? after.slice(prefix.length) : after;
}

export async function uploadFile(
  env: Env,
  file: File,
  bucket: string,
  folder: string
): Promise<{ url: string; path: string; bucket: string; originalName: string; resourceType: string }> {
  if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) throw new Error("Invalid bucket");
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
  const safeName = sanitizeName(file.name || "upload");
  const path = `${cleanFolder}/${crypto.randomUUID()}-${safeName}`;

  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_KEY,
      Authorization: `Bearer ${env.SUPABASE_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new SupabaseError(`Upload failed ${res.status}: ${text}`, res.status);
  }

  const resourceType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document";
  return {
    url: `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,
    path,
    bucket,
    originalName: file.name,
    resourceType,
  };
}

export async function deleteFiles(env: Env, urls: string[], bucket: string): Promise<void> {
  if (!urls.length) return;
  const paths = urls.map((u) => objectPath(u, bucket));
  await fetch(`${env.SUPABASE_URL}/storage/v1/object/remove`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_KEY,
      Authorization: `Bearer ${env.SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucket, paths }),
  });
}

export { bucketForFile };
