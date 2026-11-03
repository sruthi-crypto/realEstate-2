import { badRequest } from "../utils/response";

export type CreateReviewDto = { product_id: string; rating: number; title?: string; body?: string };
export type UpdateReviewDto = Partial<CreateReviewDto> & { is_approved?: boolean };

export function validateCreateReview(body: any): CreateReviewDto | Response {
  if (!body?.product_id) return badRequest("product_id is required");
  if (!body?.rating || body.rating < 1 || body.rating > 5) return badRequest("rating must be 1-5");
  return body as CreateReviewDto;
}
