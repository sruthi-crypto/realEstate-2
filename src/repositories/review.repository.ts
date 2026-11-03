import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Review } from "../types";

export const ReviewRepository = {
  findByProduct: (env: Env, productId: string): Promise<Review[]> =>
    dbGet(env, `/rest/v1/reviews?product_id=eq.${productId}&is_approved=eq.true&select=*&order=created_at.desc`),

  findAll: (env: Env): Promise<Review[]> =>
    dbGet(env, "/rest/v1/reviews?select=*&order=created_at.desc"),

  findById: (env: Env, id: string): Promise<Review[]> =>
    dbGet(env, `/rest/v1/reviews?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Review>): Promise<Review[]> =>
    dbPost(env, "/rest/v1/reviews", data),

  update: (env: Env, id: string, data: Partial<Review>): Promise<Review[]> =>
    dbPatch(env, `/rest/v1/reviews?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/reviews?id=eq.${id}`),
};
