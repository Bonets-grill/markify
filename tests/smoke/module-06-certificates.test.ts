import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Certificates & C2PA', () => {
  const root = path.resolve(__dirname, '../..')

  it('has public certificate page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(public)/certificate/[id]/page.tsx'))).toBe(true)
  })

  it('has certificates management page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/certificates/page.tsx'))).toBe(true)
  })

  it('has certificates API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/certificates/route.ts'))).toBe(true)
  })

  it('has C2PA manifest module', async () => {
    const mod = await import('@/lib/c2pa/manifest')
    expect(mod.generateC2PAManifest).toBeDefined()
  })

  it('generates valid C2PA manifest', async () => {
    const { generateC2PAManifest } = await import('@/lib/c2pa/manifest')
    const manifest = generateC2PAManifest({
      contentHash: 'sha256-abc123',
      provider: 'midjourney',
      model: 'v6',
      generationDate: new Date().toISOString(),
      watermarkId: 'wm_test123',
      issuer: 'Markify',
    })
    expect(manifest).toBeDefined()
    expect(manifest.claim_generator).toContain('Markify')
    expect(manifest.assertions).toBeDefined()
    expect(Array.isArray(manifest.assertions)).toBe(true)
  })

  it('crypto module signs and verifies certificates', async () => {
    const { generateKeyPair, signData, verifySignature, hashContent } = await import('@/lib/crypto/signatures')

    const { publicKey, privateKey } = await generateKeyPair()
    const certData = JSON.stringify({
      type: 'generation',
      contentHash: hashContent('test content'),
      watermarkId: 'wm_123',
      date: new Date().toISOString(),
    })

    const signature = await signData(certData, privateKey)
    expect(signature).toBeTruthy()

    const valid = await verifySignature(certData, signature, publicKey)
    expect(valid).toBe(true)
  })
})
