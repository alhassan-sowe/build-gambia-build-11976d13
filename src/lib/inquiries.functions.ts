import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listAllInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roles || []).some((r: any) => r.role === "ADMIN");
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  });

export const createInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        supplier_id: z.string().uuid(),
        product_id: z.string().uuid().optional().nullable(),
        subject: z.string().trim().min(1).max(200),
        message: z.string().trim().min(1).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("inquiries").insert({
      ...data,
      buyer_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["OPEN", "ANSWERED", "CLOSED"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("inquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
