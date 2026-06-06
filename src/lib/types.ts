export type AppRole = "BUYER" | "SUPPLIER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELED";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  location: string | null;
  role: AppRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url: string | null;
  location: string | null;
  is_active: boolean;
  supplier_id: string;
  category_id: string | null;
  supplier_name?: string | null;
  supplier_phone?: string | null;
  category_name?: string | null;
}

export interface Order {
  id: string;
  buyer_id: string;
  total: number;
  delivery_address: string;
  phone: string;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  buyer_name?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  product_unit?: string;
}
