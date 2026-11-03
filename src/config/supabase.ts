import type { Env } from "../types";
import { SupabaseError } from "../utils/upload";

export async function db(
  env: Env,
  path: string,
  init?: RequestInit
): Promise<any> {
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) throw new Error("Supabase config missing");

  const res = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_KEY,
      Authorization: `Bearer ${env.SUPABASE_KEY}`,
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new SupabaseError(`Supabase ${res.status} ${res.statusText}`, res.status);
    return null;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from Supabase (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.msg ?? JSON.stringify(data);
    throw new SupabaseError(`Supabase ${res.status}: ${msg}`, res.status);
  }

  return data;
}

// Convenience wrappers
export const dbGet = (env: Env, path: string) => db(env, path);

export const dbPost = (env: Env, path: string, body: unknown, prefer = "return=representation") =>
  db(env, path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: prefer },
    body: JSON.stringify(body),
  });

export const dbPatch = (env: Env, path: string, body: unknown) =>
  db(env, path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  });

export const dbDelete = (env: Env, path: string) => db(env, path, { method: "DELETE" });
