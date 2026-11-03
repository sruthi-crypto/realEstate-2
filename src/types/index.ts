export type Env = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  JWT_SECRET: string;
};

export type JwtPayload = {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
};

// ─── Domain types (mirror Supabase tables) ───────────────────────────────────

export type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  password_hash?: string;
  role?: string;
  twofactorenabled?: boolean;
  twofactorsecret?: string;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  sale_price?: number;
  sku?: string;
  stock?: number;
  rating?: number;
  featured?: boolean;
  images: string[];
  tags?: string[];
  created_at?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  cta?: string;
  href?: string;
  bg?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
};

export type Brand = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
};

export type Offer = {
  id: string;
  label: string;
  description?: string;
  discount?: number;
  image?: string;
  is_active?: boolean;
  created_at?: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  used_count?: number;
  is_active?: boolean;
  expires_at?: string;
  created_at?: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  is_approved?: boolean;
  created_at?: string;
};

export type Address = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
  created_at?: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  qty: number;
  created_at?: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code?: string;
  address_id?: string;
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  notes?: string;
  created_at?: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  image?: string;
  price: number;
  sale_price?: number;
  qty: number;
};

export type SiteContent = {
  id?: string;
  key: string;
  organizationName?: string;
  tagline?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  hero?: Record<string, any>;
  about?: Record<string, any>;
  footer?: Record<string, any>;
  socials?: Record<string, any>;
  announcement_bar?: string[];
  goodness_strip?: { icon: string; label: string }[];
  why_us?: { icon: string; title: string; desc: string }[];
  promo_cards?: { bg: string; emoji: string; title: string; sub: string; to: string }[];
  free_shipping_threshold?: number;
  updated_at?: string;
};
