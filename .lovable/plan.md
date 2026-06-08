# Switch Envora to your Supabase project

You confirmed the schema is applied on your project, so this is purely a credentials + types swap.

## What I'll do

1. **Update `.env`** with your project values:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL` → `https://myrhqvedhjmfdtzmkmet.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` → your `sb_publishable_...` key
   - Remove `*_PROJECT_ID` (no longer applicable to your project).
2. **Store `SUPABASE_SERVICE_ROLE_KEY`** (your `sb_secret_...`) via the secrets tool so server functions can use `supabaseAdmin`.
3. **Regenerate `src/integrations/supabase/types.ts`** to match your project's schema so all server fns/components stay type-safe.
4. **Restart dev server** so Vite picks up the new env values.

## Heads-up (read before approving)

- **Data does not migrate.** Existing users, products, categories, orders on Lovable Cloud stay on Lovable Cloud. Your app will start empty (whatever is in your project).
- **Re-register at `/auth`.** The first account on your project starts as BUYER. To promote yourself to ADMIN, run this in your Supabase SQL editor after signing up:
  ```sql
  update public.profiles set role='ADMIN' where email='you@example.com';
  insert into public.user_roles(user_id, role)
    select id, 'ADMIN' from auth.users where email='you@example.com'
    on conflict do nothing;
  ```
- **Google sign-in** currently uses the Lovable broker. On your own project it will fail until you configure Google in Supabase → Authentication → Providers (Client ID/Secret + add `https://myrhqvedhjmfdtzmkmet.supabase.co/auth/v1/callback` to Google Console). Email/password keeps working immediately.
- **Lovable Cloud tools stop applying** to this app: the in-app DB migration tool, security scanner, and backend UI all point to the Cloud project, not yours. Future schema changes you'll run yourself in the Supabase SQL editor.
- **Storage:** the `product-images` bucket existed on Cloud. Make sure you created the equivalent bucket on your project (private, with the same policies) or product image uploads will fail.

## If anything is missing in your schema

Tell me which of these you have on your project and I'll send back exact SQL for the gaps:
- enum `app_role` (`BUYER`,`SUPPLIER`,`ADMIN`) and enum `order_status`
- tables: `profiles`, `user_roles`, `categories`, `products`, `orders`, `order_items`, `inquiries`
- functions: `has_role`, `handle_new_user`, `order_belongs_to_supplier`, `set_updated_at`
- trigger on `auth.users` calling `handle_new_user`
- RLS enabled + policies on every table above
- storage bucket `product-images`

Approve and I'll swap the credentials.
