import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  delivery_address: z.string().trim().min(3).max(500),
  phone: z.string().trim().min(5).max(40),
  notes: z.string().trim().max(1000).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Validate products and compute total server-side
    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pe } = await context.supabase
      .from("products")
      .select("id, price, stock, is_active")
      .in("id", ids);
    if (pe) throw new Error(pe.message);
    if (!products || products.length !== ids.length) throw new Error("Some products not found");

    let total = 0;
    const itemsToInsert: { product_id: string; quantity: number; price: number }[] = [];
    for (const it of data.items) {
      const p = products.find((x) => x.id === it.product_id);
      if (!p || !p.is_active) throw new Error("Product unavailable");
      if (p.stock < it.quantity) throw new Error(`Insufficient stock for product`);
      total += Number(p.price) * it.quantity;
      itemsToInsert.push({ product_id: p.id, quantity: it.quantity, price: Number(p.price) });
    }

    const { data: order, error: oe } = await context.supabase
      .from("orders")
      .insert({
        buyer_id: context.userId,
        delivery_address: data.delivery_address,
        phone: data.phone,
        notes: data.notes ?? null,
        total,
        status: "PENDING",
      })
      .select()
      .single();
    if (oe) throw new Error(oe.message);

    const { error: ie } = await context.supabase
      .from("order_items")
      .insert(itemsToInsert.map((it) => ({ ...it, order_id: order.id })));
    if (ie) {
      await context.supabase.from("orders").delete().eq("id", order.id);
      throw new Error(ie.message);
    }

    return order;
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*, products(name, unit))")
      .eq("buyer_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((o: any) => ({
      ...o,
      items: (o.order_items || []).map((it: any) => ({
        ...it,
        product_name: it.products?.name,
        product_unit: it.products?.unit,
      })),
    }));
  });

export const listSupplierOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Fetch orders that contain at least one of supplier's products
    const { data: myProducts, error: pe } = await context.supabase
      .from("products")
      .select("id, name, unit")
      .eq("supplier_id", context.userId);
    if (pe) throw new Error(pe.message);
    const productIds = (myProducts || []).map((p) => p.id);
    if (productIds.length === 0) return [];

    const { data: items, error: ie } = await context.supabase
      .from("order_items")
      .select("*, orders(*, profiles!orders_buyer_id_fkey(name))")
      .in("product_id", productIds);
    if (ie) throw new Error(ie.message);

    const byOrder = new Map<string, any>();
    for (const it of items || []) {
      const o = (it as any).orders;
      if (!o) continue;
      const pname = myProducts?.find((p) => p.id === it.product_id);
      if (!byOrder.has(o.id)) {
        byOrder.set(o.id, {
          ...o,
          buyer_name: o.profiles?.name ?? null,
          items: [],
        });
      }
      byOrder.get(o.id).items.push({
        ...it,
        product_name: pname?.name,
        product_unit: pname?.unit,
      });
    }
    return Array.from(byOrder.values()).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELED"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*, products(name, unit)), profiles!orders_buyer_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((o: any) => ({
      ...o,
      buyer_name: o.profiles?.name ?? null,
      items: (o.order_items || []).map((it: any) => ({
        ...it,
        product_name: it.products?.name,
        product_unit: it.products?.unit,
      })),
    }));
  });
