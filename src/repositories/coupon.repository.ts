import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Coupon } from "../types";

export const CouponRepository = {
  findAll: (env: Env): Promise<Coupon[]> =>
    dbGet(env, "/rest/v1/coupons?select=*&order=created_at.desc"),

  findByCode: (env: Env, code: string): Promise<Coupon[]> =>
    dbGet(env, `/rest/v1/coupons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=*`),

  findById: (env: Env, id: string): Promise<Coupon[]> =>
    dbGet(env, `/rest/v1/coupons?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Coupon>): Promise<Coupon[]> =>
    dbPost(env, "/rest/v1/coupons", data),

  update: (env: Env, id: string, data: Partial<Coupon>): Promise<Coupon[]> =>
    dbPatch(env, `/rest/v1/coupons?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/coupons?id=eq.${id}`),

  incrementUsed: (env: Env, id: string, currentCount: number): Promise<Coupon[]> =>
    dbPatch(env, `/rest/v1/coupons?id=eq.${id}`, { used_count: currentCount + 1 }),
};
