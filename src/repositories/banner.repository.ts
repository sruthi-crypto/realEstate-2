import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Banner } from "../types";

export const BannerRepository = {
  findAll: (env: Env): Promise<Banner[]> =>
    dbGet(env, "/rest/v1/banners?select=*&order=sort_order.asc"),

  findById: (env: Env, id: string): Promise<Banner[]> =>
    dbGet(env, `/rest/v1/banners?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Banner>): Promise<Banner[]> =>
    dbPost(env, "/rest/v1/banners", data),

  update: (env: Env, id: string, data: Partial<Banner>): Promise<Banner[]> =>
    dbPatch(env, `/rest/v1/banners?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/banners?id=eq.${id}`),
};
