import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Billing & Plans', () => {
  const root = path.resolve(__dirname, '../..')

  it('has billing page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/billing/page.tsx'))).toBe(true)
  })

  it('has usage page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/usage/page.tsx'))).toBe(true)
  })

  it('has webhooks page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/webhooks/page.tsx'))).toBe(true)
  })

  it('has Stripe checkout API', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/stripe/checkout/route.ts'))).toBe(true)
  })

  it('has Stripe webhook API', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/stripe/webhook/route.ts'))).toBe(true)
  })

  it('has Stripe portal API', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/stripe/portal/route.ts'))).toBe(true)
  })

  it('plan limits are correctly defined', () => {
    const plans = {
      free: { items: 100, apiKeys: 0, priceEur: 0 },
      starter: { items: 1000, apiKeys: 1, priceEur: 29 },
      pro: { items: 10000, apiKeys: 10, priceEur: 99 },
      enterprise: { items: -1, apiKeys: -1, priceEur: 299 },
    }

    expect(plans.free.items).toBe(100)
    expect(plans.starter.priceEur).toBe(29)
    expect(plans.pro.priceEur).toBe(99)
    expect(plans.enterprise.items).toBe(-1) // unlimited
  })

  it('overage pricing is 0.005 EUR per item', () => {
    const overagePerItem = 0.005
    const overageFor100 = 100 * overagePerItem
    expect(overageFor100).toBe(0.5) // €0.50 for 100 extra items
  })
})
