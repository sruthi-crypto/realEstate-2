import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Product } from "../types";

export const ProductRepository = {
  findAll: (env: Env, filters?: { category?: string; q?: string; featured?: boolean }): Promise<Product[]> => {
    let path = "/rest/v1/products?select=*";
    if (filters?.category) path += `&category=eq.${encodeURIComponent(filters.category)}`;
    if (filters?.featured) path += `&featured=eq.true`;
    return dbGet(env, path);
  },

  findById: (env: Env, id: string): Promise<Product[]> =>
    dbGet(env, `/rest/v1/products?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Product>): Promise<Product[]> =>
    dbPost(env, "/rest/v1/products", data),

  update: (env: Env, id: string, data: Partial<Product>): Promise<Product[]> =>
    dbPatch(env, `/rest/v1/products?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/products?id=eq.${id}`),
};
