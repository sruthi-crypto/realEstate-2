import { BrandController } from "../controllers/brand.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function brandRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/brands" && method === "GET") return BrandController.getAll(request, env);

  if (pathname === "/api/brands" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return BrandController.create(request, env);
  }

  const match = pathname.match(/^\/api\/brands\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return BrandController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return BrandController.delete(request, env, id);
    }
  }

  return null;
}
