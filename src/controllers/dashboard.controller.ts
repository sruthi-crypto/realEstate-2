import { dbGet } from "../config/supabase";
import { success } from "../utils/response";
import type { Env } from "../types";

export const DashboardController = {
  async get(_request: Request, env: Env): Promise<Response> {
    const [products, categories, banners, brands, offers, orders, users, coupons] = await Promise.all([
      dbGet(env, "/rest/v1/products?select=id"),
      dbGet(env, "/rest/v1/categories?select=id"),
      dbGet(env, "/rest/v1/banners?select=id"),
      dbGet(env, "/rest/v1/brands?select=id"),
      dbGet(env, "/rest/v1/offers?select=id"),
      dbGet(env, "/rest/v1/orders?select=id,status,total"),
      dbGet(env, "/rest/v1/users?select=id"),
      dbGet(env, "/rest/v1/coupons?select=id"),
    ]);

    const orderList = Array.isArray(orders) ? orders : [];
    const revenue = orderList
      .filter((o: any) => o.status === "delivered")
      .reduce((s: number, o: any) => s + (o.total ?? 0), 0);

    return success({
      total_products: Array.isArray(products) ? products.length : 0,
      total_categories: Array.isArray(categories) ? categories.length : 0,
      total_banners: Array.isArray(banners) ? banners.length : 0,
      total_brands: Array.isArray(brands) ? brands.length : 0,
      total_offers: Array.isArray(offers) ? offers.length : 0,
      total_orders: orderList.length,
      total_users: Array.isArray(users) ? users.length : 0,
      total_coupons: Array.isArray(coupons) ? coupons.length : 0,
      total_revenue: revenue,
    }, "Dashboard fetched");
  },
};
