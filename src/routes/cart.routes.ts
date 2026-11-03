import { CartController, WishlistController } from "../controllers/cart.controller";
import { requireAuth, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function cartRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  // ── Cart ──────────────────────────────────────────────────────────────────
  if (pathname === "/api/cart" && method === "GET") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return CartController.getCart(request, env, guard);
  }

  if (pathname === "/api/cart" && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return CartController.upsertItem(request, env, guard);
  }

  if (pathname === "/api/cart" && method === "DELETE") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return CartController.clearCart(request, env, guard);
  }

  const cartItemMatch = pathname.match(/^\/api\/cart\/([^/]+)$/);
  if (cartItemMatch && method === "DELETE") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return CartController.removeItem(request, env, cartItemMatch[1]);
  }

  // ── Wishlist ──────────────────────────────────────────────────────────────
  if (pathname === "/api/wishlist" && method === "GET") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return WishlistController.getWishlist(request, env, guard);
  }

  if (pathname === "/api/wishlist" && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return WishlistController.addItem(request, env, guard);
  }

  const wishItemMatch = pathname.match(/^\/api\/wishlist\/([^/]+)$/);
  if (wishItemMatch && method === "DELETE") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return WishlistController.removeItem(request, env, wishItemMatch[1]);
  }

  return null;
}
