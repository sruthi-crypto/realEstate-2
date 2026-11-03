import { OfferController } from "../controllers/offer.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function offerRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/offers" && method === "GET") return OfferController.getAll(request, env);

  if (pathname === "/api/offers" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return OfferController.create(request, env);
  }

  const match = pathname.match(/^\/api\/offers\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return OfferController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return OfferController.delete(request, env, id);
    }
  }

  return null;
}
