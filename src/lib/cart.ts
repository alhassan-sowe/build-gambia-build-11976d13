import { useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string | null;
  supplier_id: string;
  stock: number;
}

const KEY = "envora-cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("envora-cart-change"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("envora-cart-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("envora-cart-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: CartItem) => {
    const cur = read();
    const idx = cur.findIndex((i) => i.productId === item.productId);
    if (idx >= 0) {
      cur[idx].quantity = Math.min(cur[idx].quantity + item.quantity, item.stock);
    } else {
      cur.push(item);
    }
    write(cur);
  }, []);

  const remove = useCallback((productId: string) => {
    write(read().filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const cur = read();
    const idx = cur.findIndex((i) => i.productId === productId);
    if (idx >= 0) {
      cur[idx].quantity = Math.max(1, Math.min(qty, cur[idx].stock));
      write(cur);
    }
  }, []);

  const clear = useCallback(() => write([]), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, add, remove, setQty, clear, total, count };
}

export const formatGMD = (n: number) =>
  new Intl.NumberFormat("en-GM", { style: "currency", currency: "GMD", maximumFractionDigits: 0 }).format(n);
