import { CategoryController } from "../controllers/category.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function categoryRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/categories" && method === "GET") return CategoryController.getAll(request, env);
  if (pathname === "/api/categories/az" && method === "GET") return CategoryController.getAZ(request, env);

  if (pathname === "/api/categories" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return CategoryController.create(request, env);
  }

  const match = pathname.match(/^\/api\/categories\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") return CategoryController.getBySlug(request, env, id);
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return CategoryController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return CategoryController.delete(request, env, id);
    }
  }

  return null;
}
