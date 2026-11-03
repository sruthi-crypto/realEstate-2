import type { Env, JwtPayload } from "../types";
import { verifyToken, extractBearerToken } from "../utils/jwt";
import { unauthorized, forbidden } from "../utils/response";

export async function authenticate(request: Request, env: Env): Promise<JwtPayload | Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();
  const payload = await verifyToken(token, env);
  if (!payload) return unauthorized("Invalid or expired token");
  return payload;
}

export async function requireAdmin(request: Request, env: Env): Promise<JwtPayload | Response> {
  const result = await authenticate(request, env);
  if (result instanceof Response) return result;
  if (result.role !== "admin" && result.role !== "super_admin") return forbidden("Admin access required");
  return result;
}

export async function requireAuth(request: Request, env: Env): Promise<JwtPayload | Response> {
  return authenticate(request, env);
}

export function isAuthError(v: unknown): v is Response {
  return v instanceof Response;
}
