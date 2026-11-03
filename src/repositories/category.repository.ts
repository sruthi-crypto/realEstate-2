import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Category } from "../types";

export const CategoryRepository = {
  findAll: (env: Env): Promise<Category[]> =>
    dbGet(env, "/rest/v1/categories?select=*&order=sort_order.asc,name.asc"),

  findBySlug: (env: Env, slug: string): Promise<Category[]> =>
    dbGet(env, `/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=*`),

  findById: (env: Env, id: string): Promise<Category[]> =>
    dbGet(env, `/rest/v1/categories?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Category>): Promise<Category[]> =>
    dbPost(env, "/rest/v1/categories", data),

  update: (env: Env, id: string, data: Partial<Category>): Promise<Category[]> =>
    dbPatch(env, `/rest/v1/categories?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/categories?id=eq.${id}`),
};
