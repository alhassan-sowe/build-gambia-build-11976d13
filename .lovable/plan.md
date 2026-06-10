
# Move Envora to your Supabase project

You confirmed the schema is fully applied on `myrhqvedhjmfdtzmkmet`, so this is a credentials + types swap, not a data migration.

## What I'll do

1. **Update `.env`** to point at your project:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL` → `https://myrhqvedhjmfdtzmkmet.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` → `sb_publishable_NnCU6JbG-3dIZ64FVAZcdw_99MLnbaM`
   - Remove `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_ID` (Lovable Cloud–specific).

2. **Prompt you for the service role key** via the secure secrets tool and store it as `SUPABASE_SERVICE_ROLE_KEY` (used by `client.server.ts` for public product listing, admin actions, and server-side writes). I will NOT ask you to paste it into chat.

3. **Regenerate `src/integrations/supabase/types.ts`** against your project so all server functions and the `Database` generic stay type-safe.

4. **Keep the Google sign-in button.** Heads-up: it currently goes through the Lovable broker. On your project it will fail until you:
   - In your Supabase Dashboard → Authentication → Providers → enable Google with your Google Cloud OAuth Client ID + Secret.
   - In Google Cloud Console → add `https://myrhqvedhjmfdtzmkmet.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - I'll also swap the sign-in call from `lovable.auth.signInWithOAuth("google", ...)` to `supabase.auth.signInWithOAuth({ provider: "google", ... })` so it goes direct to your project instead of the broker.
   Email/password keeps working immediately after the swap.

5. **Restart the dev server** so Vite picks up the new env values.

## Verification (after the swap)

- Read `import.meta.env.VITE_SUPABASE_URL` in the running preview — must equal `https://myrhqvedhjmfdtzmkmet.supabase.co`.
- Invoke `listCategories` / `listProducts` server functions and confirm responses come from your project.
- Ask you to sign up a fresh test account at `/auth`, then query your Supabase SQL editor for the new row in `public.profiles` to confirm the write landed on your DB.

## Things to know

- **No data migrates.** Anything on the Lovable Cloud project (users, products, orders, inquiries, images) stays there. Your app starts with whatever is already in your project.
- **You start as BUYER.** The `handle_new_user` trigger defaults new signups to BUYER. To promote yourself to ADMIN, run in your Supabase SQL editor after signing up:
  ```sql
  update public.profiles set role='ADMIN' where email='you@example.com';
  insert into public.user_roles(user_id, role)
    select id, 'ADMIN' from auth.users where email='you@example.com'
    on conflict do nothing;
  ```
- **Storage:** confirm a private `product-images` bucket exists on your project with the right RLS policies, otherwise product image uploads will 403.
- **Lovable Cloud tooling stops applying.** The in-app migration tool, security scanner, and "View Backend" button all point at the Lovable Cloud project. Future schema changes you run yourself in your Supabase SQL editor.
- The `_authenticated/` gate, auth-attacher, and RLS keep working unchanged — they don't care which Supabase project the env points at.

## Technical details

- Files touched: `.env` (credentials), `src/integrations/supabase/types.ts` (regenerated), `src/routes/auth.tsx` (swap Google call from `lovable` broker to `supabase.auth.signInWithOAuth`). Nothing else needs code changes — `client.ts`, `client.server.ts`, and `auth-middleware.ts` already read from env.
- Server-runtime secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- I will NOT delete the existing Lovable Cloud secrets — harmless once env points elsewhere, and keeping them makes a rollback trivial.

Approve and I'll do the swap, prompt you for the service role key, regenerate types, and run the verification.
