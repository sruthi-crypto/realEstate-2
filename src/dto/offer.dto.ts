import { badRequest } from "../utils/response";

export type CreateOfferDto = { label: string; description?: string; discount?: number; image?: string; is_active?: boolean };
export type UpdateOfferDto = Partial<CreateOfferDto>;

export function validateCreateOffer(body: any): CreateOfferDto | Response {
  if (!body?.label) return badRequest("label is required");
  return body as CreateOfferDto;
}
