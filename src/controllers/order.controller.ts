import { OrderRepository } from "../repositories/order.repository";
import { CouponRepository } from "../repositories/coupon.repository";
import { ProductRepository } from "../repositories/product.repository";
import { validateCreateOrder } from "../dto/order.dto";
import { success, notFound, badRequest, forbidden } from "../utils/response";
import { parseBody } from "../utils/helpers";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from "../constants";
import { requireAdmin, isAuthError } from "../middleware/auth";
import type { Env, JwtPayload } from "../types";

export const OrderController = {
  async getAll(request: Request, env: Env): Promise<Response> {
    const data = await OrderRepository.findAll(env);
    return success(data, "Orders fetched");
  },

  async getMyOrders(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const data = await OrderRepository.findByUser(env, user.id);
    return success(data, "Orders fetched");
  },

  async getById(request: Request, env: Env, id: string, user: JwtPayload): Promise<Response> {
    const result = await OrderRepository.findById(env, id);
    const order = result?.[0];
    if (!order) return notFound("Order not found");
    // Users can only see their own orders; admins see all
    if (user.role !== "admin" && user.role !== "super_admin" && order.user_id !== user.id) {
      return forbidden();
    }
    return success(order, "Order fetched");
  },

  async create(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateOrder(body);
    if (dto instanceof Response) return dto;

    const subtotal = dto.items.reduce((s, i) => s + (i.sale_price ?? i.price) * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

    let discount = 0;
    if (dto.coupon_code) {
      const coupons = await CouponRepository.findByCode(env, dto.coupon_code);
      const coupon = coupons?.[0];
      if (coupon?.is_active) {
        discount =
          coupon.discount_type === "percent"
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : coupon.discount_value;
        await CouponRepository.incrementUsed(env, coupon.id, coupon.used_count ?? 0);
      }
    }

    const orderItems = dto.items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      image: i.image,
      price: i.price,
      sale_price: i.sale_price,
      qty: i.qty,
    }));

    const result = await OrderRepository.create(env, {
      user_id: user.id,
      status: "pending",
      items: orderItems,
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
      coupon_code: dto.coupon_code,
      address_id: dto.address_id,
      payment_method: dto.payment_method ?? "cod",
      payment_status: "pending",
      notes: dto.notes,
    });

    // Decrement stock for each ordered product
    await Promise.allSettled(
      dto.items.map(async (item) => {
        const products = await ProductRepository.findById(env, item.product_id);
        const product = products?.[0];
        if (product && product.stock != null && product.stock > 0) {
          const newStock = Math.max(0, product.stock - item.qty);
          await ProductRepository.update(env, item.product_id, { stock: newStock });
        }
      })
    );

    return success(result?.[0] ?? result, "Order placed", 201);
  },

  async updateStatus(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.status) return badRequest("status is required");
    const result = await OrderRepository.update(env, id, { status: body.status });
    return success(result?.[0] ?? result, "Order status updated");
  },

  async cancel(request: Request, env: Env, id: string, user: JwtPayload): Promise<Response> {
    const result = await OrderRepository.findById(env, id);
    const order = result?.[0];
    if (!order) return notFound("Order not found");
    if (order.user_id !== user.id && user.role !== "admin" && user.role !== "super_admin") return forbidden();
    if (!["pending", "confirmed"].includes(order.status)) return badRequest("Order cannot be cancelled at this stage");

    const updated = await OrderRepository.update(env, id, { status: "cancelled" });
    return success(updated?.[0] ?? updated, "Order cancelled");
  },
};
