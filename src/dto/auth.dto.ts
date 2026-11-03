import { badRequest } from "../utils/response";

export type RegisterDto = {
  name: string;
  phone: string;
  password: string;
  email?: string;
  role?: string;
};

export type UserLoginDto  = { phone: string; password: string };
export type AdminLoginDto = { email: string; token: string };
export type Setup2faDto   = { email: string };
export type Verify2faDto  = { email: string; token: string };
export type Reset2faDto   = { email: string };

export function validateRegister(body: any): RegisterDto | Response {
  if (!body?.name)     return badRequest("name is required");
  if (!body?.phone)    return badRequest("phone is required");
  if (!body?.password) return badRequest("password is required");
  if (String(body.password).length < 6) return badRequest("password must be at least 6 characters");
  return {
    name:     body.name,
    phone:    body.phone,
    password: body.password,
    email:    body.email || undefined,
    role:     body.role ?? "user",
  };
}

export function validateUserLogin(body: any): UserLoginDto | Response {
  if (!body?.phone)    return badRequest("phone is required");
  if (!body?.password) return badRequest("password is required");
  return { phone: body.phone, password: body.password };
}

export function validateAdminLogin(body: any): AdminLoginDto | Response {
  if (!body?.email || !body?.token) return badRequest("email and token are required");
  return { email: body.email, token: body.token };
}
