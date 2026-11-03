import { db, dbGet, dbPatch } from "../config/supabase";
import type { Env, SiteContent } from "../types";

export const SiteContentRepository = {
  find: (env: Env): Promise<SiteContent[]> =>
    dbGet(env, "/rest/v1/site_content?key=eq.main&select=*"),

  upsert: (env: Env, data: Partial<SiteContent>): Promise<SiteContent[]> =>
    db(env, "/rest/v1/site_content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ key: "main", ...data, updated_at: new Date().toISOString() }),
    }),

  update: (env: Env, data: Partial<SiteContent>): Promise<SiteContent[]> =>
    dbPatch(env, "/rest/v1/site_content?key=eq.main", { ...data, updated_at: new Date().toISOString() }),
};
