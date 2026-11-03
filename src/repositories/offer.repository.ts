import { dbGet, dbPost, dbPatch, dbDelete } from "../config/supabase";
import type { Env, Offer } from "../types";

export const OfferRepository = {
  findAll: (env: Env): Promise<Offer[]> =>
    dbGet(env, "/rest/v1/offers?select=*&order=created_at.desc"),

  findById: (env: Env, id: string): Promise<Offer[]> =>
    dbGet(env, `/rest/v1/offers?id=eq.${id}&select=*`),

  create: (env: Env, data: Partial<Offer>): Promise<Offer[]> =>
    dbPost(env, "/rest/v1/offers", data),

  update: (env: Env, id: string, data: Partial<Offer>): Promise<Offer[]> =>
    dbPatch(env, `/rest/v1/offers?id=eq.${id}`, data),

  delete: (env: Env, id: string): Promise<null> =>
    dbDelete(env, `/rest/v1/offers?id=eq.${id}`),
};
