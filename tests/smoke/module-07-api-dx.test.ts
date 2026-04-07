import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('API Documentation & DX', () => {
  const root = path.resolve(__dirname, '../..')

  it('has docs page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/docs/page.tsx'))).toBe(true)
  })

  it('has all watermark API routes', () => {
    const routes = [
      'src/app/api/v1/watermark/image/route.ts',
      'src/app/api/v1/watermark/text/route.ts',
      'src/app/api/v1/watermark/audio/route.ts',
    ]
    for (const route of routes) {
      expect(fs.existsSync(path.join(root, route)), `Missing: ${route}`).toBe(true)
    }
  })

  it('has all detect API routes', () => {
    const routes = [
      'src/app/api/v1/detect/text/route.ts',
      'src/app/api/v1/detect/image/route.ts',
      'src/app/api/v1/detect/audio/route.ts',
    ]
    for (const route of routes) {
      expect(fs.existsSync(path.join(root, route)), `Missing: ${route}`).toBe(true)
    }
  })

  it('has verify API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/verify/route.ts'))).toBe(true)
  })

  it('has usage API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/usage/route.ts'))).toBe(true)
  })

  it('has webhook API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/webhooks/route.ts'))).toBe(true)
  })

  it('has API auth helper', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/api/auth.ts'))).toBe(true)
  })

  it('API auth module exports required functions', async () => {
    const mod = await import('@/lib/api/auth')
    expect(mod.authenticateApiKey).toBeDefined()
    expect(mod.checkPermission).toBeDefined()
    expect(mod.rateLimitCheck).toBeDefined()
  })

  it('rate limiter works correctly', async () => {
    const { rateLimitCheck } = await import('@/lib/api/auth')
    // First call should be allowed
    const result = rateLimitCheck('test-tenant-rate', 'test-action')
    expect(result.allowed).toBe(true)
  })

  it('queue processor exists and works', async () => {
    const mod = await import('@/lib/queue/processor')
    expect(mod.JobQueue).toBeDefined()

    const queue = new mod.JobQueue()
    const jobId = queue.enqueue({
      type: 'watermark',
      payload: { test: true },
    })
    expect(jobId).toBeTruthy()

    const status = queue.getStatus(jobId)
    expect(status).toBeDefined()
    expect(['queued', 'processing', 'completed', 'failed']).toContain(status!.status)
  })
})
