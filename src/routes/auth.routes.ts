import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { requireAdmin, requireAuth, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function authRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  // Normal user auth (phone + password)
  if (pathname === "/api/users/register"    && method === "POST") return AuthController.register(request, env);
  if (pathname === "/api/users/login"       && method === "POST") return AuthController.login(request, env);

  // Admin auth (email + Google Authenticator OTP)
  if (pathname === "/api/users/admin-login" && method === "POST") return AuthController.adminLogin(request, env);

  // 2FA management (admin accounts only)
  if (pathname === "/api/users/2fa/setup"        && method === "POST") return AuthController.setup2fa(request, env);
  if (pathname === "/api/users/2fa/verify-setup" && method === "POST") return AuthController.verify2fa(request, env);
  if (pathname === "/api/users/2fa/reset"        && method === "POST") return AuthController.reset2fa(request, env);

  // Admin-only: list all users
  if (pathname === "/api/users" && method === "GET") {
    const guard = await requireAdmin(request, env);
    if (isAuthError(guard)) return guard;
    return UserController.getAll(request, env);
  }

  // User profile — get / update by id
  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch) {
    const id = userMatch[1];
    if (method === "GET") {
      const guard = await requireAuth(request, env);
      if (isAuthError(guard)) return guard;
      return UserController.getById(request, env, id);
    }
    if (method === "PATCH") {
      const guard = await requireAuth(request, env);
      if (isAuthError(guard)) return guard;
      return UserController.update(request, env, id);
    }
  }

  return null;
}
