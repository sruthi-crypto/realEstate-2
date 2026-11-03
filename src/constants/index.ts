export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

export const FREE_SHIPPING_THRESHOLD = 299;
export const DEFAULT_SHIPPING_FEE = 40;
export const JWT_EXPIRY = "7d";
export const APP_NAME = "BeautyBoutique";

export const STORAGE_BUCKETS = ["images", "videos", "documents"] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
