import { badRequest } from "../utils/response";

export type CreateCouponDto = {
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  is_active?: boolean;
  expires_at?: string;
};

export type UpdateCouponDto = Partial<CreateCouponDto>;
export type ValidateCouponDto = { code: string; subtotal: number };

export function validateCreateCoupon(body: any): CreateCouponDto | Response {
  if (!body?.code) return badRequest("code is required");
  if (!body?.discount_type) return badRequest("discount_type is required");
  if (body.discount_value == null) return badRequest("discount_value is required");
  return body as CreateCouponDto;
}
