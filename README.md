# Gym Tracker (monorepo)

Cross-platform workout tracker. One backend, shared tested logic, web + mobile.

## Structure
- `packages/core` — shared TS: catalog, types, logic (scheme, lastFor), Supabase client + queries. Framework-agnostic, unit-tested.
- `apps/web` — React + Vite → smooth static web (GitHub Pages).
- `apps/mobile` — React Native + Expo → iOS + Android.
- `supabase/migrations` — DB schema + RLS as code.

## Dev
- `npm install` (root)
- `npm test` — run all tests via Turborepo
- `npm run typecheck`
