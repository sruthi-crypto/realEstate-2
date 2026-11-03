import { ProductController } from "../controllers/product.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function productRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/products" && method === "GET") return ProductController.getAll(request, env);

  if (pathname === "/api/products" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return ProductController.create(request, env);
  }

  const match = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") return ProductController.getById(request, env, id);
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return ProductController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return ProductController.delete(request, env, id);
    }
  }

  return null;
}
