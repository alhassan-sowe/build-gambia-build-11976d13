import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public: list active products with supplier + category info
export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: { categoryId?: string; search?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("products")
      .select("*, profiles!products_supplier_id_fkey(name, is_active), categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data.categoryId) q = q.eq("category_id", data.categoryId);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows || [])
      .filter((r: any) => r.profiles?.is_active !== false)
      .map((r: any) => ({
        ...r,
        supplier_name: r.profiles?.name ?? null,
        supplier_phone: r.profiles?.phone ?? null,
        category_name: r.categories?.name ?? null,
      }));
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*, profiles!products_supplier_id_fkey(name, location), categories(name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const r = row as any;
    return {
      ...r,
      supplier_name: r.profiles?.name ?? null,
      supplier_phone: r.profiles?.phone ?? null,
      category_name: r.categories?.name ?? null,
    };
  });

// Supplier: list own products
export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("*, categories(name)")
      .eq("supplier_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((r: any) => ({ ...r, category_name: r.categories?.name ?? null }));
  });

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.number().nonnegative(),
  unit: z.string().trim().min(1).max(40),
  stock: z.number().int().nonnegative(),
  image_url: z.string().url().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => productSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Confirm supplier role + active
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", context.userId)
      .single();
    if (!prof || prof.role !== "SUPPLIER") throw new Error("Only suppliers can create products");
    if (!prof.is_active) throw new Error("Your supplier account is awaiting admin approval");
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({ ...data, supplier_id: context.userId, is_active: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid() }).merge(productSchema.partial()).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("products")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleProductActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; is_active: boolean }) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("products")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
