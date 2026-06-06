
# Envora Redesign — Mobile-First Marketplace

A full visual + structural overhaul. Keeps all existing routes, server functions, schema, and auth. Only frontend (routes, components, styles) changes.

## Design language

- **Palette (locked)**: Orange `#FF6A00` primary CTA, Charcoal `#111827` surface/header, Amber `#F97316` accents, Cream `#FFF7ED` background tint. Tokens written into `src/styles.css` as oklch.
- **Type**: Inter (already loaded). Bigger display weights, tighter tracking, generous line-height for cards.
- **Density**: Amazon-like info density on listings; Uber-like calm on action screens (checkout, order detail); Alibaba-like supplier/category surfacing on home.
- **Components**: rounded-2xl cards, soft shadows, sticky bottom CTAs on mobile, thumb-reach navigation.

## Information architecture (no new routes, richer screens)

```text
Home (/)              Hero search + categories rail + flash deals + top suppliers + trust strip
Materials (/materials) Sticky filter bar, chips, sort, grid/list toggle, infinite-feel grid
Product (/materials/$) Gallery, sticky "Add to cart" bar, supplier card, specs, related
Checkout (/checkout)   Cart edit → delivery → review (stepper), sticky total bar
Auth (/auth)           Cleaner split layout, social first
Dashboards             Card-stat header, tabbed content, mobile bottom tab nav inside dash
```

## Screen-by-screen changes

### 1. Global shell
- Sticky top header: logo + big search (Amazon-style) + cart + account. Search collapses to icon on small screens with expandable overlay.
- **Mobile bottom tab bar** (Uber/Alibaba apps): Home · Browse · Cart · Orders · Account. Hidden on desktop.
- Footer simplified, trust badges row above it.

### 2. Home `/`
- **Hero**: location pill ("Deliver to: Banjul ▾"), oversized search with category dropdown, 2 quick chips ("Cement", "Iron rods").
- **Category rail**: horizontal scroll, 7 round icon tiles (Alibaba-style).
- **Flash deals / Featured products**: horizontal scroll card row.
- **Top suppliers**: avatar + name + rating + location chips.
- **How it works**: 3 steps with icons.
- **Trust strip**: "Verified suppliers", "Direct from source", "Cash on delivery".

### 3. Materials `/materials`
- Sticky filter bar: search, category chips, sort dropdown, grid/list toggle.
- Left filter drawer on desktop (price, location, in-stock); mobile = bottom sheet filter.
- Product cards: image, name, price/unit, supplier, location, stock badge, quick "+ Add".

### 4. Product detail
- Mobile: full-bleed image gallery, title block, price card, quantity stepper, sticky bottom "Add to cart" + "Buy now".
- Supplier card with avatar, location, response info (placeholder), "View supplier" link.
- Tabs: Description · Specs · Delivery · Reviews (reviews empty-state for now).
- Related products row.

### 5. Cart / Checkout
- Stepper: 1 Cart → 2 Delivery → 3 Review.
- Editable line items with quantity steppers, per-line subtotal, remove.
- Delivery form: name, phone, address, notes, location pill.
- Review: order summary + supplier breakdown + sticky "Place order" bar with total.
- Success screen with order number, "Track order" CTA → buyer dashboard.

### 6. Auth `/auth`
- Two-column on desktop (brand panel + form), single column on mobile.
- Google button first, divider, email/password, role toggle (Buyer/Supplier) with note about admin approval.

### 7. Buyer dashboard `/dashboard`
- Header stat cards: Active orders, Delivered, Total spent.
- Tabs: Orders · Profile.
- Order cards with status pill, items preview, total, "View details" drawer.

### 8. Supplier dashboard `/supplier`
- Approval banner if `is_active=false`.
- Stat cards: Products, Pending orders, Revenue, Out-of-stock.
- Tabs: Products (table on desktop / cards on mobile, add/edit dialog) · Orders (status updater) · Profile.

### 9. Admin `/admin`
- Stat cards: Suppliers pending, Total users, Total orders, Active products.
- Tabs: Suppliers (approve/reject) · Categories (CRUD) · Products · Orders · Users.

## New / updated files

```text
src/styles.css                                update palette tokens
src/components/navbar.tsx                     redesigned with search
src/components/bottom-nav.tsx                 new mobile tab bar
src/components/search-bar.tsx                 new global search
src/components/category-rail.tsx              new
src/components/supplier-card.tsx              new
src/components/product-card.tsx               redesigned (compact + list variant)
src/components/quantity-stepper.tsx           new
src/components/section-header.tsx             new
src/components/filter-sheet.tsx               new mobile filter
src/components/checkout-stepper.tsx           new
src/components/stat-card.tsx                  new for dashboards
src/components/footer.tsx                     redesigned
src/routes/__root.tsx                         mount bottom nav + new shell
src/routes/index.tsx                          full home rebuild
src/routes/materials.tsx                      filter bar + grid/list
src/routes/materials.$productId.tsx           gallery + sticky CTA
src/routes/checkout.tsx                       3-step stepper
src/routes/auth.tsx                           split layout
src/routes/_authenticated/dashboard.tsx       buyer redesign
src/routes/_authenticated/supplier.tsx        supplier redesign
src/routes/_authenticated/admin.tsx           admin redesign
```

No DB migrations, no server function changes, no auth/RLS changes.

## Technical notes

- All colors via tokens in `src/styles.css` (`--primary`, `--accent`, etc.) — no hard-coded hex in components.
- `oklch` values for the new palette:
  - `--primary` orange `#FF6A00` ≈ `oklch(0.68 0.21 45)`
  - `--accent` amber `#F97316` ≈ `oklch(0.72 0.19 50)`
  - `--background` cream `#FFF7ED` ≈ `oklch(0.985 0.02 75)`
  - `--foreground` / sidebar charcoal `#111827` ≈ `oklch(0.21 0.03 260)`
- Dark mode kept (charcoal surface + orange CTA).
- Bottom nav rendered only on mobile (`md:hidden`) and only when not on auth route; route detection via `useRouterState`.
- Keep all `createServerFn` calls and TanStack Query usage as-is.
- Cart logic in `src/lib/cart.ts` unchanged; UI rewritten.
- Use existing shadcn `sheet`, `tabs`, `dialog`, `dropdown-menu`, `drawer` for new patterns.

## Out of scope (this pass)

- Product reviews data model
- Real-time order tracking
- Image upload pipeline (still placeholder + URL field)
- Payments
