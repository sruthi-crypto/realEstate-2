import { AddressController } from "../controllers/address.controller";
import { requireAuth, isAuthError } from "../middleware/auth";
import type { Env } from "../types";

export async function addressRoutes(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const { method } = request;

  if (pathname === "/api/addresses" && method === "GET") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return AddressController.getMyAddresses(request, env, guard);
  }

  if (pathname === "/api/addresses" && method === "POST") {
    const guard = await requireAuth(request, env);
    if (isAuthError(guard)) return guard;
    return AddressController.create(request, env, guard);
  }

  const match = pathname.match(/^\/api\/addresses\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const guard = await requireAuth(request, env);
      if (isAuthError(guard)) return guard;
      return AddressController.update(request, env, id, guard);
    }
    if (method === "DELETE") {
      const guard = await requireAuth(request, env);
      if (isAuthError(guard)) return guard;
      return AddressController.delete(request, env, id, guard);
    }
  }

  return null;
}
