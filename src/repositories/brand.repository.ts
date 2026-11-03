import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Brand } from "../types";

export const BrandRepository = {
  findAll: (env: Env): Promise<Brand[]> =>
    dbGet(env, "/rest/v1/brands?select=*&order=name.asc"),

  findById: (env: Env, id: string): Promise<Brand[]> =>
    dbGet(env, `/rest/v1/brands?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Brand>): Promise<Brand[]> =>
    dbPost(env, "/rest/v1/brands", data),

  update: (env: Env, id: string, data: Partial<Brand>): Promise<Brand[]> =>
    dbPatch(env, `/rest/v1/brands?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/brands?id=eq.${id}`),
};
