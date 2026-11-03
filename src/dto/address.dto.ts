import { badRequest } from "../utils/response";

export type CreateAddressDto = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
};

export function validateCreateAddress(body: any): CreateAddressDto | Response {
  if (!body?.name) return badRequest("name is required");
  if (!body?.phone) return badRequest("phone is required");
  if (!body?.line1) return badRequest("line1 is required");
  if (!body?.city) return badRequest("city is required");
  if (!body?.state) return badRequest("state is required");
  if (!body?.pincode) return badRequest("pincode is required");
  return body as CreateAddressDto;
}
