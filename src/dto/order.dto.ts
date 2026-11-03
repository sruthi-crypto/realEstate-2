import { badRequest } from "../utils/response";

export type CreateOrderDto = {
  items: { product_id: string; qty: number; price: number; sale_price?: number; name: string; image?: string }[];
  address_id?: string;
  coupon_code?: string;
  payment_method?: string;
  notes?: string;
};

export type UpdateOrderStatusDto = { status: string };

export function validateCreateOrder(body: any): CreateOrderDto | Response {
  if (!Array.isArray(body?.items) || body.items.length === 0) return badRequest("items are required");
  return body as CreateOrderDto;
}
