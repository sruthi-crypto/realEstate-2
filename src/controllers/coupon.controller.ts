import { CouponRepository } from "../repositories/coupon.repository";
import { validateCreateCoupon } from "../dto/coupon.dto";
import { success, notFound, badRequest, error } from "../utils/response";
import { parseBody } from "../utils/helpers";
import { FREE_SHIPPING_THRESHOLD } from "../constants";
import type { Env } from "../types";

export const CouponController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await CouponRepository.findAll(env);
    return success(data, "Coupons fetched");
  },

  async validate(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.code) return badRequest("code is required");
    const subtotal = Number(body.subtotal ?? 0);

    const coupons = await CouponRepository.findByCode(env, body.code);
    const coupon = coupons?.[0];
    if (!coupon) return notFound("Coupon not found");
    if (!coupon.is_active) return error("Coupon is inactive", 400);
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return error("Coupon expired", 400);
    if (coupon.max_uses && (coupon.used_count ?? 0) >= coupon.max_uses) return error("Coupon usage limit reached", 400);
    if (coupon.min_order && subtotal < coupon.min_order) return error(`Minimum order ₹${coupon.min_order} required`, 400);

    const discount =
      coupon.discount_type === "percent"
        ? Math.round((subtotal * coupon.discount_value) / 100)
        : coupon.discount_value;

    return success({ coupon, discount }, "Coupon valid");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateCoupon(body);
    if (dto instanceof Response) return dto;
    const payload = { ...dto, code: dto.code.toUpperCase() };
    const result = await CouponRepository.create(env, payload);
    return success(result?.[0] ?? result, "Coupon created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await CouponRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Coupon updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await CouponRepository.delete(env, id);
    return success(null, "Coupon deleted");
  },
};
