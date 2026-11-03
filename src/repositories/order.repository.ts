import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Order } from "../types";

export const OrderRepository = {
  findAll: (env: Env): Promise<Order[]> =>
    dbGet(env, "/rest/v1/orders?select=*&order=created_at.desc"),

  findByUser: (env: Env, userId: string): Promise<Order[]> =>
    dbGet(env, `/rest/v1/orders?user_id=eq.${userId}&select=*&order=created_at.desc`),

  findById: (env: Env, id: string): Promise<Order[]> =>
    dbGet(env, `/rest/v1/orders?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Order>): Promise<Order[]> =>
    dbPost(env, "/rest/v1/orders", data),

  update: (env: Env, id: string, data: Partial<Order>): Promise<Order[]> =>
    dbPatch(env, `/rest/v1/orders?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/orders?id=eq.${id}`),
};
