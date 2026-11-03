import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Address } from "../types";

export const AddressRepository = {
  findByUser: (env: Env, userId: string): Promise<Address[]> =>
    dbGet(env, `/rest/v1/addresses?user_id=eq.${userId}&select=*&order=is_default.desc`),

  findById: (env: Env, id: string): Promise<Address[]> =>
    dbGet(env, `/rest/v1/addresses?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Address>): Promise<Address[]> =>
    dbPost(env, "/rest/v1/addresses", data),

  update: (env: Env, id: string, data: Partial<Address>): Promise<Address[]> =>
    dbPatch(env, `/rest/v1/addresses?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/addresses?id=eq.${id}`),

  clearDefault: (env: Env, userId: string): Promise<Address[]> =>
    dbPatch(env, `/rest/v1/addresses?user_id=eq.${userId}`, { is_default: false }),
};
