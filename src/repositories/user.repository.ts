import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, User } from "../types";

export const UserRepository = {
  findByPhone: (env: Env, phone: string): Promise<User[]> =>
    dbGet(env, `/rest/v1/users?phone=eq.${encodeURIComponent(phone)}&select=*`),

  findByEmail: (env: Env, email: string): Promise<User[]> =>
    dbGet(env, `/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`),

  findById: (env: Env, id: string): Promise<User[]> =>
    dbGet(env, `/rest/v1/users?id=eq.${id}&select=*`),

  findAll: (env: Env): Promise<User[]> =>
    dbGet(env, "/rest/v1/users?select=id,email,name,phone,role,twofactorenabled,created_at"),

  create: (env: Env, data: Partial<User>): Promise<User[]> =>
    dbPost(env, "/rest/v1/users", data),

  update: (env: Env, id: string, data: Partial<User>): Promise<User[]> =>
    dbPatch(env, `/rest/v1/users?id=eq.${id}`, data),
};
