import { UserRepository } from "../repositories/user.repository";
import { success, notFound, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const UserController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const users = await UserRepository.findAll(env);
    return success(users, "Users fetched");
  },

  async getById(request: Request, env: Env, id: string): Promise<Response> {
    const result = await UserRepository.findById(env, id);
    const user = result?.[0];
    if (!user) return notFound("User not found");
    const { twofactorsecret, ...safe } = user as any;
    return success(safe, "User fetched");
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    // Never allow updating sensitive fields via this endpoint
    const { twofactorsecret, twofactorenabled, role, ...safeBody } = body;
    const result = await UserRepository.update(env, id, safeBody);
    return success(result?.[0] ?? result, "User updated");
  },
};
