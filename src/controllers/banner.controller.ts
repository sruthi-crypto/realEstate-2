import { BannerRepository } from "../repositories/banner.repository";
import { validateCreateBanner } from "../dto/banner.dto";
import { success, notFound, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const BannerController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await BannerRepository.findAll(env);
    return success(data, "Banners fetched");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateBanner(body);
    if (dto instanceof Response) return dto;
    const result = await BannerRepository.create(env, dto);
    return success(result?.[0] ?? result, "Banner created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await BannerRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Banner updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await BannerRepository.delete(env, id);
    return success(null, "Banner deleted");
  },
};
