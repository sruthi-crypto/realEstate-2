import { ReviewController } from "../controllers/review.controller";
import { requireAuth, requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function reviewRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  // Public: get reviews for a product
  const productReviewMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/);
  if (productReviewMatch && method === "GET") {
    return ReviewController.getByProduct(request, env, productReviewMatch[1]);
  }

  // User: submit review
  if (pathname === "/api/reviews" && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return ReviewController.create(request, env, guard);
  }

  // Admin: list all reviews
  if (pathname === "/api/reviews" && method === "GET") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return ReviewController.getAll(request, env);
  }

  const match = pathname.match(/^\/api\/reviews\/([^/]+)$/);
  if (match) {
    const id = match[1];

    // Admin: approve review
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return ReviewController.approve(request, env, id);
    }

    // Admin: delete review
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return ReviewController.delete(request, env, id);
    }
  }

  return null;
}
