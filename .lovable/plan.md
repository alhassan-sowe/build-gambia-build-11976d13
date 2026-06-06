# Envora Marketplace — Build Plan

## Overview
A mobile-first, premium marketplace where buyers order construction materials, suppliers manage listings/orders, and admins approve suppliers and oversee the platform. Built on TanStack Start + Lovable Cloud (Supabase).

## Phase 1: Foundation & Database

### 1.1 Enable Lovable Cloud
- Provision Supabase project with auth, database, and storage.

### 1.2 Database Schema (Migrations)
Create the following tables with RLS policies and GRANTs:

- **profiles**
  - `id` (uuid, PK, FK → auth.users)
  - `email`, `name`, `phone`, `location`
  - `role` (enum: BUYER, SUPPLIER, ADMIN)
  - `is_active` (boolean, for supplier approval)
  - `created_at`

- **categories**
  - `id` (uuid, PK)
  - `name` (unique), `description`
  - `created_at`

- **products**
  - `id` (uuid, PK)
  - `name`, `description`
  - `price` (numeric), `unit` (text), `stock` (int)
  - `image_url`, `location`, `is_active`
  - `supplier_id` (FK → profiles.id)
  - `category_id` (FK → categories.id)
  - `created_at`, `updated_at`

- **orders**
  - `id` (uuid, PK)
  - `buyer_id` (FK → profiles.id)
  - `total` (numeric), `delivery_address`, `phone`, `notes`
  - `status` (enum: PENDING, CONFIRMED, DELIVERING, DELIVERED, CANCELED)
  - `created_at`, `updated_at`

- **order_items**
  - `id` (uuid, PK)
  - `order_id` (FK → orders.id)
  - `product_id` (FK → products.id)
  - `quantity` (int), `price` (numeric)

### 1.3 Seed Data
- Insert default categories: Cement, Sand, Blocks, Gravel, Iron Rods, Tiles, Transport.
- Create a default admin user (via service role, to be configured by user later if needed).

### 1.4 Auth Setup
- Configure email/password + Google OAuth auth.
- Create profile on signup via database trigger.
- Default role is BUYER; SUPPLIER requires admin approval (`is_active` = false by default).

## Phase 2: Design System & Shared Components

### 2.1 Color Tokens (styles.css)
Update to Construction Amber + Navy:
- Primary navy: `#0B2545`
- Accent amber: `#F59E0B`
- Surface dark: `#1E293B`
- Background: `#F8FAFC`

### 2.2 Shared Components
- **Navbar**: logo, nav links, auth state (login / user name + role dropdown), cart icon with count.
- **Footer**: contact info, WhatsApp link, email, FAQ accordion.
- **Layout shells**: public layout, authenticated layout (ssr: false), admin layout.
- **ProductCard**: image, name, price/unit, stock badge, supplier name, location, "Order" button.
- **OrderStatusBadge**: colored badges for each status.
- **EmptyState**: icon + message for empty lists.

## Phase 3: Public Routes & Buyer Flow

### 3.1 Landing Page (`/`)
- Hero: "Envora — Order construction materials directly in The Gambia."
- Subhead with material types.
- CTAs: "Order Now" → catalog, "Become a Supplier" → register with role=supplier.
- Category preview grid.

### 3.2 Auth Page (`/auth`)
- Tabs: Login / Register.
- Fields: email, password, name, phone, location.
- Role selector: Buyer or Supplier.
- Google sign-in option.

### 3.3 Materials Catalog (`/materials`)
- Search bar.
- Category filter chips.
- Product card grid.
- "Order" button on each card (redirects to login if unauthenticated).

### 3.4 Product Details (`/materials/$productId`)
- Product image, name, description, price, unit, stock.
- Supplier info and phone.
- "Add to Cart" and "Order Now" buttons.

### 3.5 Cart / Checkout (`/checkout`)
- Cart items list with quantity adjusters.
- Delivery address form, phone, delivery date picker, notes.
- "Place Order" button → creates order + order_items, sets status PENDING.
- Success toast + redirect to buyer dashboard.

### 3.6 Buyer Dashboard (`/_authenticated/dashboard`)
- Past and current orders list.
- Order details modal/drawer.
- Status tracking (PENDING → CONFIRMED → DELIVERING → DELIVERED).
- "Reorder" button (pre-fills cart with same items).

## Phase 4: Supplier Flow

### 4.1 Supplier Dashboard (`/_authenticated/supplier`)
- **Overview**: stats cards (products count, pending orders, total sales).
- **Products tab**: add, edit, delete products. Form with name, description, price, unit, stock, category, image upload, location.
- **Orders tab**: incoming orders list. Actions: accept (CONFIRMED), reject (CANCELED), update status (DELIVERING, DELIVERED).
- **Profile tab**: update contact info and location.

### 4.2 Product Image Upload
- Use Supabase Storage bucket "product-images" (public).
- Upload via server function, return public URL.

## Phase 5: Admin Flow

### 5.1 Admin Dashboard (`/_authenticated/admin`)
- **Suppliers**: list of suppliers with toggle to approve/reject (`is_active`).
- **Categories**: CRUD for categories.
- **Products**: view all products, edit, delete, toggle `is_active`.
- **Orders**: view all orders with filters by status.
- **Users**: view all profiles, manage roles.

## Phase 6: Server Functions

Create server functions for all data operations:
- `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`
- `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- `createOrder`, `getMyOrders`, `getSupplierOrders`, `updateOrderStatus`
- `getProfile`, `updateProfile`, `getAllUsers`, `updateUserRole`, `toggleSupplierApproval`
- `uploadProductImage`

All protected functions use `requireSupabaseAuth` middleware.
Role checks happen inside handlers (BUYER, SUPPLIER, ADMIN).

## Phase 7: Navigation & Access Control

### Route Guards
- `/_authenticated/*`: requires login (integration-managed layout, ssr: false).
- Supplier routes: check role === SUPPLIER + is_active.
- Admin routes: check role === ADMIN.
- Public routes (/, /materials, /materials/$id): no auth required for browsing.

### Navbar Logic
- Unauthenticated: "Log In" button.
- Authenticated: user name + role dropdown with dashboard links (buyer/supplier/admin based on role) + logout.

## Phase 8: UX Polish

- Loading skeletons for catalog and dashboards.
- Empty states for no products, no orders.
- Success toasts: order placed, product added, profile updated.
- Mobile-first responsive design throughout.
- Error boundaries on all routes with loaders.

## File Structure

```
src/
  routes/
    __root.tsx              (root layout, navbar, footer)
    index.tsx               (landing)
    auth.tsx                (login/register)
    materials.tsx           (catalog)
    materials.$productId.tsx (product detail)
    checkout.tsx            (cart/checkout)
    contact.tsx             (support/contact)
    _authenticated/
      route.tsx             (auth guard layout)
      dashboard.tsx         (buyer dashboard)
      supplier.tsx          (supplier dashboard)
      admin.tsx             (admin dashboard)
  lib/
    products.functions.ts
    orders.functions.ts
    categories.functions.ts
    profiles.functions.ts
    storage.functions.ts
  components/
    ui/                     (shadcn components)
    product-card.tsx
    order-status-badge.tsx
    navbar.tsx
    footer.tsx
    empty-state.tsx
  integrations/
    supabase/               (client, auth-middleware, client.server, auth-attacher)
```

## Deployment Checklist
- Lovable Cloud enabled.
- All migrations applied.
- Seed categories inserted.
- Google OAuth configured (if user provides client ID).
- Storage bucket created.
- Build passes with strict TypeScript.

## Open Questions (none blocking)
1. Should product listings also require admin approval, or only supplier accounts? → Plan assumes only supplier accounts require approval; approved suppliers can list immediately.
2. Product images: start with generated/uploaded placeholders; suppliers can upload real images via dashboard.

Once you approve this plan, I will begin implementation starting with enabling Lovable Cloud and creating the database schema.