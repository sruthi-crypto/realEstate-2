import { authenticator } from "otplib";
import { signToken } from "../utils/jwt";
import { UserRepository } from "../repositories/user.repository";
import { validateRegister, validateUserLogin, validateAdminLogin } from "../dto/auth.dto";
import { success, badRequest, notFound, error, serverError } from "../utils/response";
import { parseBody } from "../utils/helpers";
import { requireAdmin } from "../middleware/auth";
import type { Env } from "../types";

// SHA-256 hash using WebCrypto (available in Cloudflare Workers)
async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const AuthController = {
  // ── Normal user register: name + phone + password ──────────
  async register(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateRegister(body);
    if (dto instanceof Response) return dto;

    const existing = await UserRepository.findByPhone(env, dto.phone);
    if (existing?.length) return badRequest("Phone number already registered");

    const password_hash = await hashPassword(dto.password);
    const payload: Record<string, any> = {
      name:  dto.name,
      phone: dto.phone,
      password_hash,
      role:  "user",
    };
    if (dto.email) payload.email = dto.email;
    const result = await UserRepository.create(env, payload);
    const user = result?.[0] ?? result;
    const { password_hash: _, twofactorsecret, ...safeUser } = user as any;
    return success(safeUser, "Account created successfully", 201);
  },

  // ── Normal user login: phone + password ────────────────────
  async login(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateUserLogin(body);
    if (dto instanceof Response) return dto;

    const users = await UserRepository.findByPhone(env, dto.phone);
    if (!users?.length) return notFound("No account found with this phone number");

    const user = users[0];
    if (!user.password_hash) return badRequest("Account not set up for password login");

    const hash = await hashPassword(dto.password);
    if (hash !== user.password_hash) return error("Incorrect password", 401);

    const token = await signToken({ id: user.id, role: user.role ?? "user" }, env);
    const { password_hash, twofactorsecret, ...safeUser } = user as any;
    return success({ user: safeUser, token }, "Login successful");
  },

  // ── Admin login: email + Google Authenticator OTP ──────────
  async adminLogin(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateAdminLogin(body);
    if (dto instanceof Response) return dto;

    const users = await UserRepository.findByEmail(env, dto.email);
    if (!users?.length) return notFound("User not found");

    const user = users[0];
    if (user.role !== "admin" && user.role !== "super_admin")
      return error("Not an admin account", 403);
    if (!user.twofactorsecret)
      return badRequest("2FA not set up for this admin account");

    const verified = authenticator.check(String(dto.token), user.twofactorsecret);
    if (!verified) return error("Invalid OTP code", 401);

    const token = await signToken({ id: user.id, role: user.role }, env);
    const { twofactorsecret, password_hash, ...safeUser } = user as any;
    return success({ user: safeUser, token }, "Admin login successful");
  },

  // ── 2FA setup (admin only) ─────────────────────────────────
  async setup2fa(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.email) return badRequest("email is required");

    const users = await UserRepository.findByEmail(env, body.email);
    if (!users?.length) return notFound("User not found");

    const user = users[0];
    if (user.twofactorenabled) return badRequest("2FA already enabled");

    const secret = authenticator.generateSecret();
    const otpauth_url = authenticator.keyuri(user.email!, "Mamaearth Admin", secret);

    const updated = await UserRepository.update(env, user.id, { twofactorsecret: secret });
    if (!updated?.length) return serverError("Failed to save 2FA secret");

    return success({ secret, otpauth_url }, "Scan QR in Google Authenticator");
  },

  // ── 2FA verify-setup (admin only) ─────────────────────────
  async verify2fa(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.email || !body?.token) return badRequest("email and token are required");

    const users = await UserRepository.findByEmail(env, body.email);
    if (!users?.length) return notFound("User not found");

    const user = users[0];
    if (!user.twofactorsecret) return badRequest("2FA not started");

    const verified = authenticator.check(String(body.token), user.twofactorsecret);
    if (!verified) return error("Invalid code", 400);

    await UserRepository.update(env, user.id, { twofactorenabled: true });
    const token = await signToken({ id: user.id, role: user.role ?? "user" }, env);
    return success({ token }, "2FA enabled and verified");
  },

  // ── 2FA reset (super admin only) ──────────────────────────
  async reset2fa(request: Request, env: Env): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard instanceof Response) return guard;

    const body = await parseBody(request);
    if (!body?.email) return badRequest("email is required");

    const users = await UserRepository.findByEmail(env, body.email);
    if (!users?.length) return notFound("User not found");

    const user = users[0];
    const secret = authenticator.generateSecret();
    const otpauth_url = authenticator.keyuri(user.email!, "Mamaearth Admin", secret);

    await UserRepository.update(env, user.id, { twofactorsecret: secret, twofactorenabled: false });
    return success({ email: user.email, secret, otpauth_url }, "2FA reset successfully");
  },
};
