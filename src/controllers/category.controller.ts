import { CategoryRepository } from "../repositories/category.repository";
import { validateCreateCategory } from "../dto/category.dto";
import { success, notFound, badRequest } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env } from "../types";

export const CategoryController = {
  async getAll(_request: Request, env: Env): Promise<Response> {
    const data = await CategoryRepository.findAll(env);
    return success(data, "Categories fetched");
  },

  async getAZ(_request: Request, env: Env): Promise<Response> {
    const data = await CategoryRepository.findAll(env);
    const grouped: Record<string, any[]> = {};
    if (Array.isArray(data)) {
      for (const c of data) {
        const letter = (c.name?.[0] ?? "").toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(c);
      }
    }
    return success(grouped, "Categories grouped A-Z");
  },

  async getBySlug(_request: Request, env: Env, slug: string): Promise<Response> {
    const result = await CategoryRepository.findBySlug(env, slug);
    const category = result?.[0];
    if (!category) return notFound("Category not found");
    return success(category, "Category fetched");
  },

  async create(request: Request, env: Env): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateCategory(body);
    if (dto instanceof Response) return dto;

    const result = await CategoryRepository.create(env, dto);
    return success(result?.[0] ?? result, "Category created", 201);
  },

  async update(request: Request, env: Env, id: string): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const result = await CategoryRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Category updated");
  },

  async delete(_request: Request, env: Env, id: string): Promise<Response> {
    await CategoryRepository.delete(env, id);
    return success(null, "Category deleted");
  },
};
