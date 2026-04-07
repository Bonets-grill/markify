# CODEBASE_MAP.md — Markify

> Auto-generated on 2026-04-07 by `scripts/generate-codemap.js`
> Total files: 96

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
| .ts | 43 |
| .tsx | 32 |
| .svg | 5 |
| .md | 4 |
| .json | 3 |
| .mjs | 2 |
| .js | 1 |
| .ico | 1 |
| .css | 1 |
| .sql | 1 |
| .example | 1 |
| (no ext) | 1 |
| .tsbuildinfo | 1 |

## Pages (17)

| Route | File |
|-------|------|
| `/api-keys` | `src/app/(app)/api-keys/page.tsx` |
| `/billing` | `src/app/(app)/billing/page.tsx` |
| `/certificates` | `src/app/(app)/certificates/page.tsx` |
| `/content` | `src/app/(app)/content/page.tsx` |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` |
| `/detection` | `src/app/(app)/detection/page.tsx` |
| `/docs` | `src/app/(app)/docs/page.tsx` |
| `/settings` | `src/app/(app)/settings/page.tsx` |
| `/usage` | `src/app/(app)/usage/page.tsx` |
| `/webhooks` | `src/app/(app)/webhooks/page.tsx` |
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/register` | `src/app/(auth)/register/page.tsx` |
| `/verify` | `src/app/(auth)/verify/page.tsx` |
| `/certificate/[id]` | `src/app/(public)/certificate/[id]/page.tsx` |
| `/detect` | `src/app/(public)/detect/page.tsx` |
| `/verify/[id]` | `src/app/(public)/verify/[id]/page.tsx` |
| `/` | `src/app/page.tsx` |

## API Routes (15)

| Endpoint | File |
|----------|------|
| `/api/stripe/checkout` | `src/app/api/stripe/checkout/route.ts` |
| `/api/stripe/portal` | `src/app/api/stripe/portal/route.ts` |
| `/api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` |
| `/api/v1/auth/callback` | `src/app/api/v1/auth/callback/route.ts` |
| `/api/v1/certificates/[id]` | `src/app/api/v1/certificates/[id]/route.ts` |
| `/api/v1/certificates` | `src/app/api/v1/certificates/route.ts` |
| `/api/v1/detect/audio` | `src/app/api/v1/detect/audio/route.ts` |
| `/api/v1/detect/image` | `src/app/api/v1/detect/image/route.ts` |
| `/api/v1/detect/text` | `src/app/api/v1/detect/text/route.ts` |
| `/api/v1/usage` | `src/app/api/v1/usage/route.ts` |
| `/api/v1/verify` | `src/app/api/v1/verify/route.ts` |
| `/api/v1/watermark/audio` | `src/app/api/v1/watermark/audio/route.ts` |
| `/api/v1/watermark/image` | `src/app/api/v1/watermark/image/route.ts` |
| `/api/v1/watermark/text` | `src/app/api/v1/watermark/text/route.ts` |
| `/api/webhooks` | `src/app/api/webhooks/route.ts` |

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

## Libraries (13)

- `src/lib/ai/detection.ts`
- `src/lib/api/auth.ts`
- `src/lib/c2pa/manifest.ts`
- `src/lib/crypto/signatures.ts`
- `src/lib/i18n/translations.ts`
- `src/lib/queue/processor.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/watermark/audio.ts`
- `src/lib/watermark/common.ts`
- `src/lib/watermark/image.ts`
- `src/lib/watermark/text.ts`

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
      📁 billing
        📄 page.tsx
      📁 certificates
        📄 page.tsx
      📁 content
        📄 page.tsx
      📁 dashboard
        📄 page.tsx
      📁 detection
        📄 page.tsx
      📁 docs
        📄 page.tsx
      📁 settings
        📄 page.tsx
      📁 usage
        📄 page.tsx
      📁 webhooks
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
    📁 (public)
      📁 certificate
        📁 [id]
          📄 page.tsx
      📁 detect
        📄 page.tsx
      📁 verify
        📁 [id]
          📄 page.tsx
      📄 layout.tsx
    📁 api
      📁 stripe
        📁 checkout
          📄 route.ts
        📁 portal
          📄 route.ts
        📁 webhook
          📄 route.ts
      📁 v1
        📁 auth
          📁 callback
            📄 route.ts
        📁 certificates
          📁 [id]
            📄 route.ts
          📄 route.ts
        📁 detect
          📁 audio
            📄 route.ts
          📁 image
            📄 route.ts
          📁 text
            📄 route.ts
        📁 usage
          📄 route.ts
        📁 verify
          📄 route.ts
        📁 watermark
          📁 audio
            📄 route.ts
          📁 image
            📄 route.ts
          📁 text
            📄 route.ts
      📁 webhooks
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
    📁 ai
      📄 detection.ts
    📁 api
      📄 auth.ts
    📁 c2pa
      📄 manifest.ts
    📁 crypto
      📄 signatures.ts
    📁 i18n
      📄 translations.ts
    📁 queue
      📄 processor.ts
    📁 supabase
      📄 client.ts
      📄 middleware.ts
      📄 server.ts
    📁 utils
    📁 watermark
      📄 audio.ts
      📄 common.ts
      📄 image.ts
      📄 text.ts
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
    📄 master-smoke.test.ts
    📄 module-01-foundation.test.ts
    📄 module-02-image-watermark.test.ts
    📄 module-03-text-watermark.test.ts
    📄 module-04-audio-watermark.test.ts
    📄 module-05-verification.test.ts
    📄 module-06-certificates.test.ts
    📄 module-07-api-dx.test.ts
    📄 module-08-billing.test.ts
📄 .env.local.example
📄 .gitignore
📄 AGENTS.md
📄 CLAUDE.md
📄 CODEBASE_MAP.md
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
