# X Clone

A minimal X (Twitter) clone built with **Vite + React + TypeScript** and **Supabase** as the backend. Designed to deploy as a static site to **GitHub Pages**.

## Features

- Email/password sign up & sign in (no 2FA)
- Post tweets (max 280 chars) with realtime timeline updates
- Delete your own posts
- Auto-creates a `profiles` row on signup via DB trigger
- X-style dark UI

## Tech stack

- Frontend: Vite + React 18 + TypeScript
- Backend: Supabase (Postgres + Auth + Realtime)
- Deploy: GitHub Pages via GitHub Actions

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from the template and fill in your Supabase values:

   ```bash
   cp .env.example .env.local
   ```

   Get the values from your Supabase dashboard → **Project Settings → API**:
   - `VITE_SUPABASE_URL` — Project URL
   - `VITE_SUPABASE_ANON_KEY` — `anon` (public) or `publishable` key

   > ⚠️ **Never** put the `service_role` key in this file. The browser only ever needs the public key.

3. Run the dev server:

   ```bash
   npm run dev
   ```

### Email confirmation (Supabase default)

Supabase enables **email confirmation** out of the box. After signing up, you'll receive a confirmation email and must click the link before you can sign in.

If you want a smoother local-testing experience without email confirmation:

- Open **Supabase Dashboard → Authentication → Providers → Email**
- Turn **Confirm email** off
- Save

Re-enable it in production for security.

## Database schema

The schema is already applied to the connected Supabase project. If you need to recreate it, see [`supabase/schema.sql`](./supabase/schema.sql). Both `profiles` and `posts` tables are protected with **Row Level Security (RLS)**:

- `profiles`: anyone can read; only the owner can insert/update their own row.
- `posts`: anyone can read; only authenticated users can insert as themselves; only the author can delete.

A trigger on `auth.users` auto-creates a matching `profiles` row when a user signs up.

## Deploy to GitHub Pages

1. Push this project to a new GitHub repository.

2. In **Settings → Pages → Build and deployment**, set the source to **GitHub Actions**.

3. In **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Push to `main`. The workflow at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) will build and deploy.

   The site will be available at `https://<user>.github.io/<repo>/`. The build uses `VITE_BASE=/<repo>/` so asset paths resolve correctly.

## Security notes

- `.env`, `.env.local`, `.env.*.local` are all in `.gitignore` — secrets stay local.
- Build-time secrets in CI come from **GitHub Actions secrets**, not the repo.
- The `anon` / `publishable` Supabase key is safe to ship in the bundle — it only grants what RLS allows. Database access is gated by RLS policies on every table.
- The `service_role` key must **never** appear in this repo or in the browser bundle.
