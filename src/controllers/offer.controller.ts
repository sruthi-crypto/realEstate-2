import { OfferRepository } from "../repositories/offer.repository";
import { validateCreateOffer } from "../dto/offer.dto";
import { success, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const OfferController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await OfferRepository.findAll(env);
    return success(data, "Offers fetched");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateOffer(body);
    if (dto instanceof Response) return dto;
    const result = await OfferRepository.create(env, dto);
    return success(result?.[0] ?? result, "Offer created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await OfferRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Offer updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await OfferRepository.delete(env, id);
    return success(null, "Offer deleted");
  },
};
