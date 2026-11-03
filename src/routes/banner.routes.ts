import { BannerController } from "../controllers/banner.controller";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function bannerRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/banners" && method === "GET") return BannerController.getAll(request, env);

  if (pathname === "/api/banners" && method === "POST") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return BannerController.create(request, env);
  }

  const match = pathname.match(/^\/api\/banners\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return BannerController.update(request, env, id);
    }
    if (method === "DELETE") {
      const guard = await requireAdmin(request, env);
      if (isAuthError(guard)) return guard;
      return BannerController.delete(request, env, id);
    }
  }

  return null;
}
