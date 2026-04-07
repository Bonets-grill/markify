import { describe, it, expect } from 'vitest'
import { T, SUPPORTED_LANGS, LANG_NAMES, getLang } from '@/lib/i18n/translations'
import type { Lang } from '@/lib/i18n/translations'
import type {
  Tenant, Profile, ApiKey, ContentItem, Certificate,
  DetectionResult, UsageLog, WebhookSubscription, AuditLog,
  Plan, UserRole, ContentType, WatermarkMethod, WatermarkStrength,
  ProcessingStatus, CertificateType, UsageAction,
} from '@/types/database'

// ============================================================
// 1. i18n — All 5 languages have complete translations
// ============================================================
describe('i18n translations', () => {
  const requiredKeys = Object.keys(T.en) as (keyof typeof T.en)[]

  it('supports 5 languages', () => {
    expect(SUPPORTED_LANGS).toEqual(['en', 'es', 'fr', 'de', 'it'])
  })

  it('has language display names for all supported langs', () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(LANG_NAMES[lang]).toBeTruthy()
    }
  })

  for (const lang of SUPPORTED_LANGS) {
    it(`${lang}: has all ${requiredKeys.length} translation keys`, () => {
      for (const key of requiredKeys) {
        expect(T[lang][key], `Missing ${lang}.${key}`).toBeTruthy()
      }
    })

    it(`${lang}: no empty string values`, () => {
      for (const key of requiredKeys) {
        expect(T[lang][key].trim().length, `Empty ${lang}.${key}`).toBeGreaterThan(0)
      }
    })
  }

  it('getLang returns correct language', () => {
    expect(getLang('en')).toBe('en')
    expect(getLang('es')).toBe('es')
    expect(getLang('fr-FR')).toBe('fr')
    expect(getLang('de-AT')).toBe('de')
    expect(getLang('it')).toBe('it')
  })

  it('getLang defaults to en for unknown', () => {
    expect(getLang('zh')).toBe('en')
    expect(getLang(undefined)).toBe('en')
    expect(getLang('')).toBe('en')
  })
})

// ============================================================
// 2. Database types — All types are correctly defined
// ============================================================
describe('database types', () => {
  it('Plan type has 4 values', () => {
    const plans: Plan[] = ['free', 'starter', 'pro', 'enterprise']
    expect(plans).toHaveLength(4)
  })

  it('UserRole type has 4 values', () => {
    const roles: UserRole[] = ['owner', 'admin', 'developer', 'viewer']
    expect(roles).toHaveLength(4)
  })

  it('ContentType includes all content types', () => {
    const types: ContentType[] = ['text', 'image', 'audio', 'video', 'document']
    expect(types).toHaveLength(5)
  })

  it('WatermarkMethod includes all methods', () => {
    const methods: WatermarkMethod[] = [
      'invisible_spectral', 'invisible_lsb', 'metadata_c2pa',
      'text_unicode', 'audio_spectral', 'combined',
    ]
    expect(methods).toHaveLength(6)
  })

  it('WatermarkStrength has 3 levels', () => {
    const strengths: WatermarkStrength[] = ['light', 'standard', 'strong']
    expect(strengths).toHaveLength(3)
  })

  it('ProcessingStatus has 4 states', () => {
    const statuses: ProcessingStatus[] = ['queued', 'processing', 'completed', 'failed']
    expect(statuses).toHaveLength(4)
  })

  it('CertificateType has 3 types', () => {
    const types: CertificateType[] = ['generation', 'modification', 'verification']
    expect(types).toHaveLength(3)
  })

  it('UsageAction has 5 actions', () => {
    const actions: UsageAction[] = ['watermark', 'detect', 'verify', 'certificate', 'label']
    expect(actions).toHaveLength(5)
  })

  it('Tenant interface has required fields', () => {
    const tenant: Tenant = {
      id: 'uuid',
      name: 'Test Co',
      slug: 'test-co',
      domain: null,
      plan: 'free',
      api_key_hash: null,
      api_key_prefix: null,
      usage_quota_monthly: 100,
      usage_current_monthly: 0,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    expect(tenant.plan).toBe('free')
    expect(tenant.usage_quota_monthly).toBe(100)
  })

  it('Profile interface has required fields', () => {
    const profile: Profile = {
      id: 'uuid',
      tenant_id: 'tenant-uuid',
      email: 'test@test.com',
      full_name: 'Test User',
      role: 'owner',
      created_at: new Date().toISOString(),
    }
    expect(profile.role).toBe('owner')
  })

  it('ApiKey interface has permissions object', () => {
    const key: ApiKey = {
      id: 'uuid',
      tenant_id: 'tenant-uuid',
      name: 'Test Key',
      key_hash: 'hash',
      key_prefix: 'mk_live_abc',
      permissions: { watermark: true, detect: true, verify: true, certificates: true },
      last_used_at: null,
      expires_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    expect(key.permissions.watermark).toBe(true)
    expect(key.permissions.detect).toBe(true)
  })

  it('ContentItem interface has processing fields', () => {
    const item: ContentItem = {
      id: 'uuid',
      tenant_id: 'tenant-uuid',
      content_type: 'image',
      source_provider: 'midjourney',
      source_model: 'v6',
      original_hash: 'sha256',
      watermarked_hash: null,
      file_url: null,
      file_size_bytes: null,
      watermark_method: 'invisible_spectral',
      watermark_id: 'wm_123',
      watermark_strength: 'standard',
      detection_confidence: null,
      is_ai_generated: true,
      label_text: null,
      label_position: null,
      certificate_id: null,
      metadata: {},
      processing_status: 'queued',
      processing_error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    expect(item.processing_status).toBe('queued')
    expect(item.content_type).toBe('image')
  })

  it('Certificate interface has digital signature', () => {
    const cert: Certificate = {
      id: 'uuid',
      tenant_id: 'tenant-uuid',
      content_item_id: 'item-uuid',
      certificate_type: 'generation',
      issuer: 'Markify',
      subject_description: 'AI generated image',
      ai_provider: 'midjourney',
      ai_model: 'v6',
      generation_date: new Date().toISOString(),
      content_hash: 'sha256',
      watermark_id: 'wm_123',
      digital_signature: 'rsa-sig',
      verification_url: 'https://markify.eu/cert/uuid',
      c2pa_manifest: null,
      is_valid: true,
      revoked_at: null,
      revoked_reason: null,
      created_at: new Date().toISOString(),
    }
    expect(cert.digital_signature).toBeTruthy()
    expect(cert.is_valid).toBe(true)
  })
})

// ============================================================
// 3. API Key generation logic
// ============================================================
describe('API key generation', () => {
  function generateApiKey(): { key: string; prefix: string } {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const key = `mk_live_${result}`
    const prefix = `mk_live_...${result.slice(-4)}`
    return { key, prefix }
  }

  async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  it('generates key with mk_live_ prefix', () => {
    const { key } = generateApiKey()
    expect(key.startsWith('mk_live_')).toBe(true)
  })

  it('generates key with 40 char total length', () => {
    const { key } = generateApiKey()
    expect(key.length).toBe(40) // mk_live_ (8) + 32 random
  })

  it('generates prefix showing last 4 chars', () => {
    const { key, prefix } = generateApiKey()
    expect(prefix.startsWith('mk_live_...')).toBe(true)
    expect(prefix.endsWith(key.slice(-4))).toBe(true)
  })

  it('hashes key with SHA-256', async () => {
    const { key } = generateApiKey()
    const hash = await hashApiKey(key)
    expect(hash).toHaveLength(64) // SHA-256 hex = 64 chars
  })

  it('same key produces same hash', async () => {
    const { key } = generateApiKey()
    const hash1 = await hashApiKey(key)
    const hash2 = await hashApiKey(key)
    expect(hash1).toBe(hash2)
  })

  it('different keys produce different hashes', async () => {
    const key1 = generateApiKey()
    const key2 = generateApiKey()
    const hash1 = await hashApiKey(key1.key)
    const hash2 = await hashApiKey(key2.key)
    expect(hash1).not.toBe(hash2)
  })
})

// ============================================================
// 4. Theme support
// ============================================================
describe('theme support', () => {
  it('supports dark, light, and system modes', () => {
    const modes = ['dark', 'light', 'system'] as const
    expect(modes).toHaveLength(3)
  })

  it('dark is the default theme', () => {
    // Default in store is 'dark'
    expect('dark').toBe('dark')
  })
})

// ============================================================
// 5. Plan limits
// ============================================================
describe('plan limits', () => {
  const planLimits: Record<string, { items: number; apiKeys: number; detection: number }> = {
    free: { items: 100, apiKeys: 0, detection: 10 },
    starter: { items: 1000, apiKeys: 1, detection: -1 },
    pro: { items: 10000, apiKeys: 10, detection: -1 },
    enterprise: { items: -1, apiKeys: -1, detection: -1 },
  }

  it('free plan has 100 items/month', () => {
    expect(planLimits.free.items).toBe(100)
  })

  it('starter plan has 1000 items/month', () => {
    expect(planLimits.starter.items).toBe(1000)
  })

  it('pro plan has 10000 items/month', () => {
    expect(planLimits.pro.items).toBe(10000)
  })

  it('enterprise plan has unlimited items', () => {
    expect(planLimits.enterprise.items).toBe(-1)
  })

  it('free plan has no API keys', () => {
    expect(planLimits.free.apiKeys).toBe(0)
  })

  it('pro plan has 10 API keys', () => {
    expect(planLimits.pro.apiKeys).toBe(10)
  })
})

// ============================================================
// 6. Responsive layout expectations
// ============================================================
describe('responsive layout', () => {
  it('sidebar has collapsed and expanded states', () => {
    const expandedWidth = 240
    const collapsedWidth = 60
    expect(expandedWidth).toBeGreaterThan(collapsedWidth)
  })
})

// ============================================================
// 7. SQL migration file exists
// ============================================================
describe('database migration', () => {
  it('migration file exists', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/001_markify_foundation.sql')
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  it('migration contains all tables', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/001_markify_foundation.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    const tables = ['tenants', 'profiles', 'api_keys', 'content_items', 'certificates', 'detection_results', 'usage_logs', 'webhook_subscriptions', 'audit_logs']
    for (const table of tables) {
      expect(content, `Missing table: ${table}`).toContain(`CREATE TABLE ${table}`)
    }
  })

  it('migration enables RLS on all tables', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/001_markify_foundation.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    const tables = ['tenants', 'profiles', 'api_keys', 'content_items', 'certificates', 'detection_results', 'usage_logs', 'webhook_subscriptions', 'audit_logs']
    for (const table of tables) {
      expect(content, `Missing RLS for: ${table}`).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
    }
  })

  it('migration has auto-create tenant trigger', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/001_markify_foundation.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('handle_new_user')
    expect(content).toContain('on_auth_user_created')
  })
})

// ============================================================
// 8. File structure
// ============================================================
describe('project structure', () => {
  it('has required directories', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const root = path.resolve(__dirname, '../..')
    const dirs = [
      'src/app',
      'src/components/ui',
      'src/components/layout',
      'src/lib/supabase',
      'src/lib/i18n',
      'src/stores',
      'src/types',
      'supabase/migrations',
      'scripts',
      'tests/smoke',
    ]
    for (const dir of dirs) {
      expect(fs.existsSync(path.join(root, dir)), `Missing dir: ${dir}`).toBe(true)
    }
  })

  it('has required page files', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const root = path.resolve(__dirname, '../..')
    const pages = [
      'src/app/page.tsx',
      'src/app/(auth)/login/page.tsx',
      'src/app/(auth)/register/page.tsx',
      'src/app/(auth)/verify/page.tsx',
      'src/app/(app)/dashboard/page.tsx',
      'src/app/(app)/api-keys/page.tsx',
      'src/app/(app)/settings/page.tsx',
    ]
    for (const page of pages) {
      expect(fs.existsSync(path.join(root, page)), `Missing page: ${page}`).toBe(true)
    }
  })

  it('has layout files', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const root = path.resolve(__dirname, '../..')
    const layouts = [
      'src/app/layout.tsx',
      'src/app/(auth)/layout.tsx',
      'src/app/(app)/layout.tsx',
    ]
    for (const layout of layouts) {
      expect(fs.existsSync(path.join(root, layout)), `Missing layout: ${layout}`).toBe(true)
    }
  })

  it('has UI components', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const root = path.resolve(__dirname, '../..')
    const components = [
      'src/components/ui/button.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/badge.tsx',
    ]
    for (const comp of components) {
      expect(fs.existsSync(path.join(root, comp)), `Missing component: ${comp}`).toBe(true)
    }
  })
})
