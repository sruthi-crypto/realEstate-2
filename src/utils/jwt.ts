import { SignJWT, jwtVerify } from "jose";
import type { Env, JwtPayload } from "../types";
import { JWT_EXPIRY } from "../constants";

export async function signToken(payload: { id: string; role: string }, env: Env): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string, env: Env): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}
