import { AddressRepository } from "../repositories/address.repository";
import { validateCreateAddress } from "../dto/address.dto";
import { success, notFound, badRequest, forbidden } from "../utils/response";
import { parseBody } from "../utils/helpers";
import type { Env, JwtPayload } from "../types";

export const AddressController = {
  async getMyAddresses(_request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const data = await AddressRepository.findByUser(env, user.id);
    return success(data, "Addresses fetched");
  },

  async create(request: Request, env: Env, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");
    const dto = validateCreateAddress(body);
    if (dto instanceof Response) return dto;

    if (dto.is_default) await AddressRepository.clearDefault(env, user.id);
    const result = await AddressRepository.create(env, { ...dto, user_id: user.id });
    return success(result?.[0] ?? result, "Address added", 201);
  },

  async update(request: Request, env: Env, id: string, user: JwtPayload): Promise<Response> {
    const body = await parseBody(request);
    if (!body) return badRequest("Invalid JSON body");

    const existing = await AddressRepository.findById(env, id);
    const addr = existing?.[0];
    if (!addr) return notFound("Address not found");
    if (addr.user_id !== user.id) return forbidden();

    if (body.is_default) await AddressRepository.clearDefault(env, user.id);
    const result = await AddressRepository.update(env, id, body);
    return success(result?.[0] ?? result, "Address updated");
  },

  async delete(_request: Request, env: Env, id: string, user: JwtPayload): Promise<Response> {
    const existing = await AddressRepository.findById(env, id);
    const addr = existing?.[0];
    if (!addr) return notFound("Address not found");
    if (addr.user_id !== user.id) return forbidden();

    await AddressRepository.delete(env, id);
    return success(null, "Address deleted");
  },
};
