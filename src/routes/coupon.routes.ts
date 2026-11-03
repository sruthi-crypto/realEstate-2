import { CouponController } from "../controllers/coupon.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function couponRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  // Public: validate a coupon code
  if (pathname === "/api/coupons/validate" && method === "POST") return CouponController.validate(request, env);

  // Admin only below
  if (pathname === "/api/coupons" && method === "GET") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return CouponController.getAll(request, env);
  }

  if (pathname === "/api/coupons" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return CouponController.create(request, env);
  }

  const match = pathname.match(/^\/api\/coupons\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return CouponController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return CouponController.delete(request, env, id);
    }
  }

  return null;
}
