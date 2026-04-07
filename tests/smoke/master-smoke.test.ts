import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

describe('Master Smoke Test — Full System Verification', () => {
  // 1. All modules present
  describe('1. Complete module structure', () => {
    const allPages = [
      // Auth
      'src/app/(auth)/login/page.tsx',
      'src/app/(auth)/register/page.tsx',
      'src/app/(auth)/verify/page.tsx',
      // App
      'src/app/(app)/dashboard/page.tsx',
      'src/app/(app)/api-keys/page.tsx',
      'src/app/(app)/settings/page.tsx',
      'src/app/(app)/content/page.tsx',
      'src/app/(app)/certificates/page.tsx',
      'src/app/(app)/detection/page.tsx',
      'src/app/(app)/docs/page.tsx',
      'src/app/(app)/usage/page.tsx',
      'src/app/(app)/billing/page.tsx',
      'src/app/(app)/webhooks/page.tsx',
      // Public
      'src/app/(public)/verify/[id]/page.tsx',
      'src/app/(public)/certificate/[id]/page.tsx',
      'src/app/(public)/detect/page.tsx',
      // Landing
      'src/app/page.tsx',
    ]

    for (const page of allPages) {
      it(`page exists: ${page}`, () => {
        expect(fs.existsSync(path.join(root, page)), `Missing: ${page}`).toBe(true)
      })
    }
  })

  // 2. All API routes present
  describe('2. Complete API routes', () => {
    const allRoutes = [
      'src/app/api/v1/watermark/image/route.ts',
      'src/app/api/v1/watermark/text/route.ts',
      'src/app/api/v1/watermark/audio/route.ts',
      'src/app/api/v1/detect/text/route.ts',
      'src/app/api/v1/detect/image/route.ts',
      'src/app/api/v1/detect/audio/route.ts',
      'src/app/api/v1/verify/route.ts',
      'src/app/api/v1/certificates/route.ts',
      'src/app/api/v1/usage/route.ts',
      'src/app/api/v1/auth/callback/route.ts',
      'src/app/api/webhooks/route.ts',
      'src/app/api/stripe/checkout/route.ts',
      'src/app/api/stripe/webhook/route.ts',
      'src/app/api/stripe/portal/route.ts',
    ]

    for (const route of allRoutes) {
      it(`route exists: ${route}`, () => {
        expect(fs.existsSync(path.join(root, route)), `Missing: ${route}`).toBe(true)
      })
    }
  })

  // 3. All core libraries present
  describe('3. Core libraries', () => {
    const allLibs = [
      'src/lib/watermark/common.ts',
      'src/lib/watermark/image.ts',
      'src/lib/watermark/text.ts',
      'src/lib/watermark/audio.ts',
      'src/lib/crypto/signatures.ts',
      'src/lib/ai/detection.ts',
      'src/lib/c2pa/manifest.ts',
      'src/lib/queue/processor.ts',
      'src/lib/api/auth.ts',
      'src/lib/supabase/client.ts',
      'src/lib/supabase/server.ts',
      'src/lib/supabase/middleware.ts',
      'src/lib/i18n/translations.ts',
    ]

    for (const lib of allLibs) {
      it(`library exists: ${lib}`, () => {
        expect(fs.existsSync(path.join(root, lib)), `Missing: ${lib}`).toBe(true)
      })
    }
  })

  // 4. Image watermark flow
  describe('4. Image watermark flow', () => {
    it('watermark encode/decode roundtrip', async () => {
      const { encodeWatermarkData, decodeWatermarkData, generateWatermarkId } = await import('@/lib/watermark/common')
      const payload = {
        watermarkId: generateWatermarkId(),
        tenantId: 'master-test-tenant',
        timestamp: Date.now(),
        provider: 'dall-e',
        model: '3',
        contentHash: 'sha256-master-test',
      }
      const encoded = encodeWatermarkData(payload)
      const decoded = decodeWatermarkData(encoded)
      expect(decoded).not.toBeNull()
      expect(decoded!.watermarkId).toBe(payload.watermarkId)
    })
  })

  // 5. Text watermark flow
  describe('5. Text watermark flow', () => {
    it('full text watermark lifecycle', async () => {
      const { embedTextWatermark, extractTextWatermark, stripTextWatermark, isTextWatermarked } = await import('@/lib/watermark/text')
      const { generateWatermarkId } = await import('@/lib/watermark/common')

      const original = 'The quick brown fox jumps over the lazy dog. This text will be watermarked.'
      const payload = {
        watermarkId: generateWatermarkId(),
        tenantId: 'master-tenant',
        timestamp: Date.now(),
        contentHash: 'hash-master',
      }

      // Embed
      const watermarked = embedTextWatermark(original, payload)
      expect(watermarked).not.toBe(original)
      expect(isTextWatermarked(watermarked)).toBe(true)

      // Extract
      const extracted = extractTextWatermark(watermarked)
      expect(extracted).not.toBeNull()
      expect(extracted!.watermarkId).toBe(payload.watermarkId)

      // Strip
      const stripped = stripTextWatermark(watermarked)
      expect(stripped).toBe(original)
      expect(isTextWatermarked(stripped)).toBe(false)
    })
  })

  // 6. Certificate flow
  describe('6. Certificate flow', () => {
    it('generate and verify digital signature', async () => {
      const { generateKeyPair, signData, verifySignature, hashContent } = await import('@/lib/crypto/signatures')

      const keys = await generateKeyPair()
      const contentHash = hashContent('AI-generated image content bytes')
      const certData = JSON.stringify({
        type: 'generation',
        issuer: 'Markify',
        contentHash,
        watermarkId: 'wm_master123',
        date: new Date().toISOString(),
      })

      const signature = await signData(certData, keys.privateKey)
      expect(await verifySignature(certData, signature, keys.publicKey)).toBe(true)
      expect(await verifySignature('tampered', signature, keys.publicKey)).toBe(false)
    })
  })

  // 7. C2PA manifest
  describe('7. C2PA manifest generation', () => {
    it('generates valid manifest structure', async () => {
      const { generateC2PAManifest } = await import('@/lib/c2pa/manifest')
      const manifest = generateC2PAManifest({
        contentHash: 'sha256-test',
        provider: 'stable-diffusion',
        model: 'xl-1.0',
        generationDate: '2026-04-07T00:00:00Z',
        watermarkId: 'wm_c2pa_test',
        issuer: 'Markify',
      })

      expect(manifest.claim_generator).toContain('Markify')
      expect(manifest.assertions.length).toBeGreaterThan(0)
      const hashAssertion = manifest.assertions.find((a: { label: string }) => a.label === 'c2pa.hash.data')
      expect(hashAssertion).toBeDefined()
    })
  })

  // 8. Job queue
  describe('8. Job queue processing', () => {
    it('enqueue and track job', async () => {
      const { JobQueue } = await import('@/lib/queue/processor')
      const queue = new JobQueue()

      const id = queue.enqueue({ type: 'watermark', payload: { file: 'test.png' } })
      expect(id).toBeTruthy()

      const status = queue.getStatus(id)
      expect(status).toBeDefined()
    })
  })

  // 9. i18n completeness
  describe('9. i18n — all 5 languages', () => {
    it('all languages have all keys', async () => {
      const { T, SUPPORTED_LANGS } = await import('@/lib/i18n/translations')
      const enKeys = Object.keys(T.en)

      for (const lang of SUPPORTED_LANGS) {
        const langKeys = Object.keys(T[lang])
        expect(langKeys.length).toBe(enKeys.length)
        for (const key of enKeys) {
          expect(T[lang][key as keyof typeof T.en], `Missing ${lang}.${key}`).toBeTruthy()
        }
      }
    })
  })

  // 10. UI components present
  describe('10. UI components', () => {
    const components = [
      'src/components/ui/button.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/badge.tsx',
      'src/components/ui/dialog.tsx',
      'src/components/ui/checkbox.tsx',
      'src/components/ui/select.tsx',
      'src/components/ui/toast.tsx',
      'src/components/layout/sidebar.tsx',
      'src/components/layout/header.tsx',
    ]

    for (const comp of components) {
      it(`component exists: ${comp}`, () => {
        expect(fs.existsSync(path.join(root, comp))).toBe(true)
      })
    }
  })

  // 11. Layouts present
  describe('11. Layouts', () => {
    const layouts = [
      'src/app/layout.tsx',
      'src/app/(auth)/layout.tsx',
      'src/app/(app)/layout.tsx',
    ]

    for (const layout of layouts) {
      it(`layout exists: ${layout}`, () => {
        expect(fs.existsSync(path.join(root, layout))).toBe(true)
      })
    }
  })

  // 12. Database migration
  describe('12. Database migration complete', () => {
    it('migration file has all 9 tables', () => {
      const content = fs.readFileSync(path.join(root, 'supabase/migrations/001_markify_foundation.sql'), 'utf-8')
      const tables = ['tenants', 'profiles', 'api_keys', 'content_items', 'certificates', 'detection_results', 'usage_logs', 'webhook_subscriptions', 'audit_logs']
      for (const table of tables) {
        expect(content).toContain(`CREATE TABLE ${table}`)
        expect(content).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
      }
    })
  })

  // 13. Rate limiting
  describe('13. Rate limiting', () => {
    it('rate limiter allows initial requests', async () => {
      const { rateLimitCheck } = await import('@/lib/api/auth')
      const result = rateLimitCheck('master-test-tenant', 'master-test')
      expect(result.allowed).toBe(true)
    })
  })

  // 14. CODEBASE_MAP.md exists
  describe('14. CODEBASE_MAP.md', () => {
    it('exists and has content', () => {
      const mapPath = path.join(root, 'CODEBASE_MAP.md')
      expect(fs.existsSync(mapPath)).toBe(true)
      const content = fs.readFileSync(mapPath, 'utf-8')
      expect(content.length).toBeGreaterThan(100)
      expect(content).toContain('Markify')
    })
  })
})
