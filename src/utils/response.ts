import { CORS_HEADERS } from "../constants";

export function success(data: unknown, message = "Success", status = 200): Response {
  return new Response(JSON.stringify({ success: true, message, data }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export function error(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export const badRequest = (msg: string) => error(msg, 400);
export const unauthorized = (msg = "Unauthorized") => error(msg, 401);
export const forbidden = (msg = "Forbidden") => error(msg, 403);
export const notFound = (msg = "Not found") => error(msg, 404);
export const serverError = (msg = "Internal server error") => error(msg, 500);

export function optionsResponse(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}
