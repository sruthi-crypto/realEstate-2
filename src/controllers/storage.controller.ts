import { uploadFile, bucketForFile } from "../utils/upload";
import { success, badRequest } from "../utils/response";
import type { Env } from "../types";

export const StorageController = {
  async upload(request: Request, env: Env): Promise<Response> {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return badRequest("file is required");

    const requestedBucket = String(formData.get("bucket") || "");
    const bucket = requestedBucket || bucketForFile(file);
    const folder = String(formData.get("folder") || "uploads");

    const result = await uploadFile(env, file, bucket, folder);
    return success(result, "File uploaded");
  },
};
