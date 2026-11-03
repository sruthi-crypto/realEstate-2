import { SiteContentController } from "../controllers/site-content.controller";
import { DashboardController } from "../controllers/dashboard.controller";
import { StorageController } from "../controllers/storage.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function adminRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/dashboard" && method === "GET") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return DashboardController.get(request, env);
  }

  if (pathname === "/api/site-content") {
    if (method === "GET") return SiteContentController.get(request, env);
    if (method === "POST") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return SiteContentController.upsert(request, env);
    }
    if (method === "PATCH" || method === "PUT") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return SiteContentController.update(request, env);
    }
  }

  if (pathname === "/api/storage/upload" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return StorageController.upload(request, env);
  }

  return null;
}
