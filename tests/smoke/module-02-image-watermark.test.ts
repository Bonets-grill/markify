import { describe, it, expect } from 'vitest'

describe('Image Watermark Engine', () => {
  it('common module exports watermark utilities', async () => {
    const mod = await import('@/lib/watermark/common')
    expect(mod.generateWatermarkId).toBeDefined()
    expect(mod.encodeWatermarkData).toBeDefined()
    expect(mod.decodeWatermarkData).toBeDefined()
  })

  it('generates watermark ID with wm_ prefix', async () => {
    const { generateWatermarkId } = await import('@/lib/watermark/common')
    const id = generateWatermarkId()
    expect(id.startsWith('wm_')).toBe(true)
    expect(id.length).toBeGreaterThan(10)
  })

  it('encodes and decodes watermark payload', async () => {
    const { encodeWatermarkData, decodeWatermarkData, generateWatermarkId } = await import('@/lib/watermark/common')
    const payload = {
      watermarkId: generateWatermarkId(),
      tenantId: 'tenant-123',
      timestamp: Date.now(),
      provider: 'midjourney',
      model: 'v6',
      contentHash: 'abc123def456',
    }
    const encoded = encodeWatermarkData(payload)
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBeGreaterThan(0)

    const decoded = decodeWatermarkData(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.watermarkId).toBe(payload.watermarkId)
    expect(decoded!.tenantId).toBe(payload.tenantId)
    expect(decoded!.provider).toBe(payload.provider)
    expect(decoded!.contentHash).toBe(payload.contentHash)
  })

  it('returns null for invalid watermark data', async () => {
    const { decodeWatermarkData } = await import('@/lib/watermark/common')
    const decoded = decodeWatermarkData(new Uint8Array([0, 1, 2, 3, 4]))
    expect(decoded).toBeNull()
  })

  it('image watermark module exports required functions', async () => {
    const mod = await import('@/lib/watermark/image')
    expect(mod.embedImageWatermark).toBeDefined()
    expect(mod.extractImageWatermark).toBeDefined()
    expect(mod.addVisibleLabel).toBeDefined()
  })

  it('crypto module exports signature functions', async () => {
    const mod = await import('@/lib/crypto/signatures')
    expect(mod.generateKeyPair).toBeDefined()
    expect(mod.signData).toBeDefined()
    expect(mod.verifySignature).toBeDefined()
    expect(mod.hashContent).toBeDefined()
  })

  it('hashContent produces consistent SHA-256 hex', async () => {
    const { hashContent } = await import('@/lib/crypto/signatures')
    const hash1 = hashContent('test data')
    const hash2 = hashContent('test data')
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })

  it('different content produces different hashes', async () => {
    const { hashContent } = await import('@/lib/crypto/signatures')
    const hash1 = hashContent('content A')
    const hash2 = hashContent('content B')
    expect(hash1).not.toBe(hash2)
  })

  it('generates key pair and signs/verifies data', async () => {
    const { generateKeyPair, signData, verifySignature } = await import('@/lib/crypto/signatures')
    const { publicKey, privateKey } = await generateKeyPair()
    expect(publicKey).toBeTruthy()
    expect(privateKey).toBeTruthy()

    const data = 'test content to sign'
    const signature = await signData(data, privateKey)
    expect(signature).toBeTruthy()

    const isValid = await verifySignature(data, signature, publicKey)
    expect(isValid).toBe(true)

    const isInvalid = await verifySignature('tampered data', signature, publicKey)
    expect(isInvalid).toBe(false)
  })
})
