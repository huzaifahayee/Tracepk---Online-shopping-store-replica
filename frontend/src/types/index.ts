// ── API Response Types ──
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ── User & Auth ──
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  registration_date?: string;
}

export interface Admin {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface AdminAuthData {
  token: string;
  admin: Admin;
}

// ── Product (from API) ──
export interface ApiProduct {
  product_id: number;
  product_name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  size: string | null;
  color: string | null;
  image_url: string | null;
  date_added: string;
  category_id: number;
  category_name: string;
}

// ── Product (mock/display) ──
export interface Product {
  id: number;
  name: string;
  subtitle: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  badge: 'NEW' | 'SALE' | 'SOLD OUT' | null;
  slug: string;
  inStock: boolean;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  material: string;
  fit: string;
}

// ── Category (mock/display) ──
export interface Category {
  name: string;
  slug: string;
  badge: string | null;
  image: string;
}

// ── API Category ──
export interface ApiCategory {
  category_id: number;
  category_name: string;
  description?: string;
  image_url?: string;
}

// ── Cart ──
export interface CartItem {
  id: string; // local unique key
  productId: number;
  name: string;
  subtitle: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  cartId?: number; // server-side cart_id if synced
}

export interface ApiCartItem {
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
  size: string | null;
  color: string | null;
  image_url: string | null;
  subtotal: number;
}

// ── Order ──
export interface Order {
  order_id: number;
  order_date: string;
  order_status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_method: string;
  delivery_address: string;
  total_amount: number;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// ── Misc ──
export interface HeroImages {
  hero: string;
  banner1: string;
  banner2: string;
  banner3: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'most_popular';
