import { OrderController } from "../controllers/order.controller";
import { requireAuth, requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function orderRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  // Admin: all orders
  if (pathname === "/api/orders" && method === "GET") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return OrderController.getAll(request, env);
  }

  // User: my orders
  if (pathname === "/api/orders/my" && method === "GET") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return OrderController.getMyOrders(request, env, guard);
  }

  // User: place order
  if (pathname === "/api/orders" && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return OrderController.create(request, env, guard);
  }

  const match = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (match) {
    const id = match[1];

    if (method === "GET") {
      const guard = await requireAuth(request, env);
      if (isAuthError(guard)) return guard;
      return OrderController.getById(request, env, id, guard);
    }

    // Admin: update status
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return OrderController.updateStatus(request, env, id);
    }
  }

  // User: cancel own order
  const cancelMatch = pathname.match(/^\/api\/orders\/([^/]+)\/cancel$/);
  if (cancelMatch && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return OrderController.cancel(request, env, cancelMatch[1], guard);
  }

  return null;
}
