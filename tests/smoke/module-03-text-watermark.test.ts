import { describe, it, expect } from 'vitest'

describe('Text Watermark Engine', () => {
  it('text watermark module exports required functions', async () => {
    const mod = await import('@/lib/watermark/text')
    expect(mod.embedTextWatermark).toBeDefined()
    expect(mod.extractTextWatermark).toBeDefined()
    expect(mod.stripTextWatermark).toBeDefined()
    expect(mod.isTextWatermarked).toBeDefined()
  })

  it('embeds watermark that is visually identical', async () => {
    const { embedTextWatermark, stripTextWatermark } = await import('@/lib/watermark/text')
    const { generateWatermarkId } = await import('@/lib/watermark/common')

    const original = 'This is a test sentence with multiple words for watermarking.'
    const payload = {
      watermarkId: generateWatermarkId(),
      tenantId: 'tenant-123',
      timestamp: Date.now(),
      contentHash: 'hash123',
    }

    const watermarked = embedTextWatermark(original, payload)
    // Watermarked text should look different in raw form (has zero-width chars)
    expect(watermarked).not.toBe(original)
    // But stripped version should match original
    const stripped = stripTextWatermark(watermarked)
    expect(stripped).toBe(original)
  })

  it('extracts watermark from watermarked text', async () => {
    const { embedTextWatermark, extractTextWatermark } = await import('@/lib/watermark/text')
    const { generateWatermarkId } = await import('@/lib/watermark/common')

    const wmId = generateWatermarkId()
    const payload = {
      watermarkId: wmId,
      tenantId: 'tenant-456',
      timestamp: Date.now(),
      contentHash: 'hash456',
    }

    const watermarked = embedTextWatermark('Hello world this is a test of the watermark system.', payload)
    const extracted = extractTextWatermark(watermarked)

    expect(extracted).not.toBeNull()
    expect(extracted!.watermarkId).toBe(wmId)
    expect(extracted!.tenantId).toBe('tenant-456')
  })

  it('detects watermarked text', async () => {
    const { embedTextWatermark, isTextWatermarked } = await import('@/lib/watermark/text')
    const { generateWatermarkId } = await import('@/lib/watermark/common')

    const original = 'Plain text without any watermark.'
    expect(isTextWatermarked(original)).toBe(false)

    const watermarked = embedTextWatermark('Watermarked text with hidden data inside it.', {
      watermarkId: generateWatermarkId(),
      tenantId: 'tenant-789',
      timestamp: Date.now(),
      contentHash: 'hash789',
    })
    expect(isTextWatermarked(watermarked)).toBe(true)
  })

  it('strips watermark completely', async () => {
    const { embedTextWatermark, stripTextWatermark, isTextWatermarked } = await import('@/lib/watermark/text')
    const { generateWatermarkId } = await import('@/lib/watermark/common')

    const original = 'Text that will be watermarked and then cleaned.'
    const watermarked = embedTextWatermark(original, {
      watermarkId: generateWatermarkId(),
      tenantId: 'test',
      timestamp: Date.now(),
      contentHash: 'hash',
    })

    const stripped = stripTextWatermark(watermarked)
    expect(isTextWatermarked(stripped)).toBe(false)
    expect(stripped).toBe(original)
  })
})
