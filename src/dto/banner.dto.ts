import { badRequest } from "../utils/response";

export type CreateBannerDto = {
  title: string;
  subtitle?: string;
  image: string;
  cta?: string;
  href?: string;
  bg?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateBannerDto = Partial<CreateBannerDto>;

export function validateCreateBanner(body: any): CreateBannerDto | Response {
  if (!body?.title) return badRequest("title is required");
  if (!body?.image) return badRequest("image is required");
  return body as CreateBannerDto;
}
