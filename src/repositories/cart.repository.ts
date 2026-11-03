import { dbGet, dbPost, dbPatch, dbDelete, db } from "../config/supabase";
import type { Env, CartItem, WishlistItem } from "../types";

export const CartRepository = {
  findByUser: (env: Env, userId: string): Promise<CartItem[]> =>
    dbGet(env, `/rest/v1/cart_items?user_id=eq.${userId}&select=*,product:products(*)`),

  findItem: (env: Env, userId: string, productId: string): Promise<CartItem[]> =>
    dbGet(env, `/rest/v1/cart_items?user_id=eq.${userId}&product_id=eq.${productId}&select=*`),

  upsert: (env: Env, data: Partial<CartItem>): Promise<CartItem[]> =>
    db(env, "/rest/v1/cart_items", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    }),

  update: (env: Env, id: string, data: Partial<CartItem>): Promise<CartItem[]> =>
    dbPatch(env, `/rest/v1/cart_items?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/cart_items?id=eq.${id}`),

  clearByUser: (env: Env, userId: string): Promise<null> =>
    dbDelete(env, `/rest/v1/cart_items?user_id=eq.${userId}`),
};

export const WishlistRepository = {
  findByUser: (env: Env, userId: string): Promise<WishlistItem[]> =>
    dbGet(env, `/rest/v1/wishlist_items?user_id=eq.${userId}&select=*,product:products(*)`),

  findItem: (env: Env, userId: string, productId: string): Promise<WishlistItem[]> =>
    dbGet(env, `/rest/v1/wishlist_items?user_id=eq.${userId}&product_id=eq.${productId}&select=*`),

  add: (env: Env, data: Partial<WishlistItem>): Promise<WishlistItem[]> =>
    dbPost(env, "/rest/v1/wishlist_items", data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/wishlist_items?id=eq.${id}`),
};
