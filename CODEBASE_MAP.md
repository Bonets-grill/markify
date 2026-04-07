# CODEBASE_MAP.md — Markify

> Auto-generated on 2026-04-07 by `scripts/generate-codemap.js`
> Total files: 53

## Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **UI**: React 19 + Tailwind CSS 4
- **Auth + DB**: Supabase (Auth, PostgreSQL, RLS, Storage)
- **State**: Zustand
- **Language**: TypeScript (strict)
- **i18n**: EN, ES, FR, DE, IT

## File Types

| Extension | Count |
|-----------|-------|
| .tsx | 21 |
| .ts | 12 |
| .svg | 5 |
| .md | 3 |
| .json | 3 |
| .mjs | 2 |
| .js | 1 |
| .ico | 1 |
| .css | 1 |
| .sql | 1 |
| .example | 1 |
| (no ext) | 1 |
| .tsbuildinfo | 1 |

## Pages (7)

| Route | File |
|-------|------|
| `/api-keys` | `src/app/(app)/api-keys/page.tsx` |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` |
| `/settings` | `src/app/(app)/settings/page.tsx` |
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/register` | `src/app/(auth)/register/page.tsx` |
| `/verify` | `src/app/(auth)/verify/page.tsx` |
| `/` | `src/app/page.tsx` |

## API Routes (1)

| Endpoint | File |
|----------|------|
| `/api/v1/auth/callback` | `src/app/api/v1/auth/callback/route.ts` |

## Components (10)

- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/toast.tsx`

## Stores (1)

- `src/stores/app-store.ts`

## Libraries (4)

- `src/lib/i18n/translations.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`

## Database Schema

See `supabase/migrations/001_markify_foundation.sql`

Tables: tenants, profiles, api_keys, content_items, certificates, detection_results, usage_logs, webhook_subscriptions, audit_logs

All tables have RLS enabled with tenant_id scoping.

## Directory Tree

```
📁 public
  📄 file.svg
  📄 globe.svg
  📄 next.svg
  📄 vercel.svg
  📄 window.svg
📁 scripts
  📄 generate-codemap.js
📁 src
  📁 app
    📁 (app)
      📁 api-keys
        📄 page.tsx
      📁 dashboard
        📄 page.tsx
      📁 settings
        📄 page.tsx
      📄 layout.tsx
    📁 (auth)
      📁 login
        📄 page.tsx
      📁 register
        📄 page.tsx
      📁 verify
        📄 page.tsx
      📄 layout.tsx
    📁 (marketing)
      📄 layout.tsx
    📁 api
      📁 v1
        📁 auth
          📁 callback
            📄 route.ts
    📄 favicon.ico
    📄 globals.css
    📄 layout.tsx
    📄 page.tsx
  📁 components
    📁 layout
      📄 header.tsx
      📄 sidebar.tsx
    📁 ui
      📄 badge.tsx
      📄 button.tsx
      📄 card.tsx
      📄 checkbox.tsx
      📄 dialog.tsx
      📄 input.tsx
      📄 select.tsx
      📄 toast.tsx
  📁 lib
    📁 crypto
    📁 i18n
      📄 translations.ts
    📁 supabase
      📄 client.ts
      📄 middleware.ts
      📄 server.ts
    📁 utils
  📁 stores
    📄 app-store.ts
  📁 types
    📄 database.ts
  📄 middleware.ts
📁 supabase
  📁 migrations
    📄 001_markify_foundation.sql
📁 tests
  📁 fixtures
  📁 smoke
    📄 module-01-foundation.test.ts
📄 .env.local.example
📄 .gitignore
📄 AGENTS.md
📄 CLAUDE.md
📄 eslint.config.mjs
📄 next-env.d.ts
📄 next.config.ts
📄 package-lock.json
📄 package.json
📄 postcss.config.mjs
📄 README.md
📄 tsconfig.json
📄 tsconfig.tsbuildinfo
📄 vitest.config.ts
```
