import { badRequest } from "../utils/response";

export type CreateProductDto = {
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  sale_price?: number;
  sku?: string;
  stock?: number;
  rating?: number;
  featured?: boolean;
  images?: string[];
  tags?: string[];
};

export type UpdateProductDto = Partial<CreateProductDto>;

export function validateCreateProduct(body: any): CreateProductDto | Response {
  if (!body?.name) return badRequest("name is required");
  return {
    ...body,
    images: Array.isArray(body.imageMeta)
      ? body.imageMeta.map((i: any) => i.url)
      : Array.isArray(body.images)
      ? body.images
      : [],
  };
}
