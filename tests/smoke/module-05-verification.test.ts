import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Verification & Detection Dashboard', () => {
  const root = path.resolve(__dirname, '../..')

  it('has public verification page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(public)/verify/[id]/page.tsx'))).toBe(true)
  })

  it('has public detection playground', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(public)/detect/page.tsx'))).toBe(true)
  })

  it('has content dashboard page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/content/page.tsx'))).toBe(true)
  })

  it('has detection page', () => {
    expect(fs.existsSync(path.join(root, 'src/app/(app)/detection/page.tsx'))).toBe(true)
  })

  it('has verify API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/verify/route.ts'))).toBe(true)
  })

  it('has detect text API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/detect/text/route.ts'))).toBe(true)
  })

  it('has detect image API route', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/v1/detect/image/route.ts'))).toBe(true)
  })
})
