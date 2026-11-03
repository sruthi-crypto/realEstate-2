import { CartRepository, WishlistRepository } from "../repositories/cart.repository";
import { success, notFound, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env, JwtPayload } from "../types";

export const CartController = {
  async getCart(_request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const data = await CartRepository.findByUser(env, user.id);
    return success(data, "Cart fetched");
  },

  async upsertItem(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.product_id) return badRequest("product_id is required");
    if (!body?.qty || body.qty < 1) return badRequest("qty must be >= 1");

    const result = await CartRepository.upsert(env, { user_id: user.id, product_id: body.product_id, qty: body.qty });
    return success(result?.[0] ?? result, "Cart updated");
  },

  async removeItem(_request: Request, env: Env, id: string): Promise<Response> {
    await CartRepository.delete(env, id);
    return success(null, "Item removed");
  },

  async clearCart(_request: Request, env: Env, user: JwtPayload): Promise<Response> {
    await CartRepository.clearByUser(env, user.id);
    return success(null, "Cart cleared");
  },
};

export const WishlistController = {
  async getWishlist(_request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const data = await WishlistRepository.findByUser(env, user.id);
    return success(data, "Wishlist fetched");
  },

  async addItem(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body?.product_id) return badRequest("product_id is required");

    const existing = await WishlistRepository.findItem(env, user.id, body.product_id);
    if (existing?.length) return success(existing[0], "Already in wishlist");

    const result = await WishlistRepository.add(env, { user_id: user.id, product_id: body.product_id });
    return success(result?.[0] ?? result, "Added to wishlist", 201);
  },

  async removeItem(_request: Request, env: Env, id: string): Promise<Response> {
    await WishlistRepository.delete(env, id);
    return success(null, "Removed from wishlist");
  },
};
