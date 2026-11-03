import { ProductRepository } from "../repositories/product.repository";
import { validateCreateProduct } from "../dto/product.dto";
import { success, notFound, badRequest, serverError } from "../utils/response";
import { parseBody } from "../utils/helpers";
import { deleteFiles } from "../utils/upload";
import type { Env } from "../types";

export const ProductController = {
  async getAll(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? undefined;
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const featured = url.searchParams.get("featured") === "true" ? true : undefined;

    let data = await ProductRepository.findAll(env, { category, featured });

    if (q && Array.isArray(data)) {
      data = data.filter(
        (p: any) =>
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return success(data, "Products fetched");
  },

  async getById(_request: Request, env: Env, id: string): Promise<Response> {
    const result = await ProductRepository.findById(env, id);
    const product = result?.[0];
    if (!product) return notFound("Product not found");
    return success(product, "Product fetched");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateProduct(body);
    if (dto instanceof Response) return dto;

    const result = await ProductRepository.create(env, dto);
    return success(result?.[0] ?? result, "Product created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");

    const payload = { ...body, images: Array.isArray(body.images) ? body.images : [] };
    const result = await ProductRepository.update(env, id, payload);
    const product = result?.[0];
    if (!product) return notFound("Product not found");
    return success(product, "Product updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    const existing = await ProductRepository.findById(env, id);
    const product = existing?.[0];
    if (!product) return notFound("Product not found");

    await ProductRepository.delete(env, id);
    if (product.images?.length) await deleteFiles(env, product.images, "images");
    return success(null, "Product deleted");
  },
};
