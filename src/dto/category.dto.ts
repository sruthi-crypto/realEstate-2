import { badRequest } from "../utils/response";

export type CreateCategoryDto = {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export function validateCreateCategory(body: any): CreateCategoryDto | Response {
  if (!body?.name) return badRequest("name is required");
  if (!body?.slug) return badRequest("slug is required");
  return body as CreateCategoryDto;
}
