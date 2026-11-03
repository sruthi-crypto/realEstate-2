import { BrandRepository } from "../repositories/brand.repository";
import { validateCreateBrand } from "../dto/brand.dto";
import { success, notFound, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const BrandController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await BrandRepository.findAll(env);
    return success(data, "Brands fetched");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateBrand(body);
    if (dto instanceof Response) return dto;
    const result = await BrandRepository.create(env, dto);
    return success(result?.[0] ?? result, "Brand created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await BrandRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Brand updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await BrandRepository.delete(env, id);
    return success(null, "Brand deleted");
  },
};
