import { SiteContentRepository } from "../repositories/site-content.repository";
import { success, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const SiteContentController = {
  async get(_request: Request, env: Env): Promise<Response> {
    const result = await SiteContentRepository.find(env);
    return success(result?.[0] ?? {}, "Site content fetched");
  },

  async upsert(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await SiteContentRepository.upsert(env, body);
    return success(result?.[0] ?? result, "Site content saved");
  },

  async update(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await SiteContentRepository.update(env, body);
    return success(result?.[0] ?? result, "Site content updated");
  },
};
