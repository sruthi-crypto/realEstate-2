import { authRoutes } from "./routes/auth.routes";
import { productRoutes } from "./routes/product.routes";
import { categoryRoutes } from "./routes/category.routes";
import { bannerRoutes } from "./routes/banner.routes";
import { brandRoutes } from "./routes/brand.routes";
import { offerRoutes } from "./routes/offer.routes";
import { couponRoutes } from "./routes/coupon.routes";
import { cartRoutes } from "./routes/cart.routes";
import { orderRoutes } from "./routes/order.routes";
import { reviewRoutes } from "./routes/review.routes";
import { addressRoutes } from "./routes/address.routes";
import { adminRoutes } from "./routes/admin.routes";
import { optionsResponse, success, error } from "./utils/response";
import { SupabaseError } from "./utils/upload";
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") return optionsResponse();

      const url = new URL(request.url);
      const pathname = url.pathname;

      if (pathname === "/" && request.method === "GET") {
        return success({ version: "2.0.0", status: "running" }, "Beauty Boutique API 🚀");
      }

      // Route dispatch — first match wins
      const routers = [
        authRoutes,
        productRoutes,
        categoryRoutes,
        bannerRoutes,
        brandRoutes,
        offerRoutes,
        couponRoutes,
        cartRoutes,
        orderRoutes,
        reviewRoutes,
        addressRoutes,
        adminRoutes,
      ];

      for (const router of routers) {
        const res = await router(request, env, pathname);
        if (res !== null) return res;
      }

      return error("Not Found", 404);
    } catch (err: any) {
      console.error("Unhandled error:", err);
      if (err instanceof SupabaseError) return error(err.message, err.status);
      return error("Internal server error: " + (err?.message ?? "unknown"), 500);
    }
  },
};
