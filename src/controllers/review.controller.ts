import { ReviewRepository } from "../repositories/review.repository";
import { validateCreateReview } from "../dto/review.dto";
import { success, notFound, badRequest, forbidden } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env, JwtPayload } from "../types";

export const ReviewController = {
  async getByProduct(_request: Request, env: Env, productId: string): Promise<Response> {
    const data = await ReviewRepository.findByProduct(env, productId);
    return success(data, "Reviews fetched");
  },

  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await ReviewRepository.findAll(env);
    return success(data, "Reviews fetched");
  },

  async create(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateReview(body);
    if (dto instanceof Response) return dto;

    const result = await ReviewRepository.create(env, { ...dto, user_id: user.id, is_approved: false });
    return success(result?.[0] ?? result, "Review submitted, pending approval", 201);
  },

  async approve(_request: Request, env: Env, id: string): Promise<Response> {
    const result = await ReviewRepository.update(env, id, { is_approved: true });
    return success(result?.[0] ?? result, "Review approved");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await ReviewRepository.delete(env, id);
    return success(null, "Review deleted");
  },
};
