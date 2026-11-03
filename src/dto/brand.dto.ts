import { badRequest } from "../utils/response";

export type CreateBrandDto = { name: string; logo?: string; description?: string; is_active?: boolean };
export type UpdateBrandDto = Partial<CreateBrandDto>;

export function validateCreateBrand(body: any): CreateBrandDto | Response {
  if (!body?.name) return badRequest("name is required");
  return body as CreateBrandDto;
}
