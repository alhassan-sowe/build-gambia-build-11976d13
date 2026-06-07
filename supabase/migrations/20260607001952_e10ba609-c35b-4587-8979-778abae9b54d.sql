
-- 1) Fix profiles privacy: restrict SELECT to owner + admin; expose a public view with safe columns

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Owners and admins view full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'ADMIN'::public.app_role));

-- Safe public view (no email/phone)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, name, role, location, is_active, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2) Inquiries table

CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  product_id uuid,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers create their inquiries"
  ON public.inquiries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers view own inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Suppliers view their inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers update their inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (auth.uid() = supplier_id);

CREATE POLICY "Admins view all inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'ADMIN'::public.app_role));

CREATE POLICY "Admins manage all inquiries"
  ON public.inquiries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'ADMIN'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'ADMIN'::public.app_role));

CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
