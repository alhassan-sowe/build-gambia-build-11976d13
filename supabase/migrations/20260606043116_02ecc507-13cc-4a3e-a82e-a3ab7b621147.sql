
-- Enums
CREATE TYPE public.app_role AS ENUM ('BUYER', 'SUPPLIER', 'ADMIN');
CREATE TYPE public.order_status AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERING', 'DELIVERED', 'CANCELED');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  location TEXT,
  role public.app_role NOT NULL DEFAULT 'BUYER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles (security source of truth)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  status public.order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- order_items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper: does this user supply any product in this order?
CREATE OR REPLACE FUNCTION public.order_belongs_to_supplier(_order_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = _order_id AND p.supplier_id = _user_id
  )
$$;

-- RLS: profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS: user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS: categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'ADMIN')) WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- RLS: products
CREATE POLICY "Active products viewable by everyone" ON public.products FOR SELECT USING (is_active = true OR auth.uid() = supplier_id OR public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Suppliers insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = supplier_id AND public.has_role(auth.uid(), 'SUPPLIER'));
CREATE POLICY "Suppliers update own products" ON public.products FOR UPDATE USING (auth.uid() = supplier_id);
CREATE POLICY "Suppliers delete own products" ON public.products FOR DELETE USING (auth.uid() = supplier_id);
CREATE POLICY "Admins manage all products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'ADMIN')) WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- RLS: orders
CREATE POLICY "Buyers view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Suppliers view orders containing their products" ON public.orders FOR SELECT USING (public.order_belongs_to_supplier(id, auth.uid()));
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Buyers create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Suppliers update orders for their products" ON public.orders FOR UPDATE USING (public.order_belongs_to_supplier(id, auth.uid()));
CREATE POLICY "Admins update any order" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS: order_items
CREATE POLICY "Buyers view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
);
CREATE POLICY "Suppliers view order items for their products" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.supplier_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Buyers create order items for own orders" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
);

-- Signup trigger: create profile + user_roles row from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_active BOOLEAN;
BEGIN
  v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'BUYER');
  -- Suppliers start inactive (require admin approval); buyers/admins active
  v_active := CASE WHEN v_role = 'SUPPLIER' THEN false ELSE true END;

  INSERT INTO public.profiles (id, email, name, phone, location, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    v_role,
    v_active
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed categories
INSERT INTO public.categories (name, description) VALUES
  ('Cement', 'Bags of cement for construction'),
  ('Sand', 'Building sand by the ton'),
  ('Blocks', 'Concrete and cement blocks'),
  ('Gravel', 'Aggregate gravel and stone'),
  ('Iron Rods', 'Steel reinforcement bars'),
  ('Tiles', 'Floor and wall tiles'),
  ('Transport', 'Delivery and transport services');
