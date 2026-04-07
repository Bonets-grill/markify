'use client'

import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

type HttpMethod = 'GET' | 'POST'
type CodeLang = 'curl' | 'javascript' | 'python'

interface Endpoint {
  method: HttpMethod
  path: string
  description: string
  body?: string
  params?: string
  response: string
  curl: string
  javascript: string
  python: string
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/watermark/image',
    description: 'Embed an invisible watermark into an image. Supports PNG, JPG, and WebP formats up to 25MB.',
    body: `{
  "image_url": "https://example.com/image.png",
  "provider": "midjourney",
  "model": "v6",
  "strength": "standard",
  "metadata": { "prompt": "a sunset over mountains" }
}`,
    response: `{
  "id": "ci_abc123",
  "watermark_id": "wm_xyz789",
  "watermarked_url": "https://cdn.markify.ai/wm/abc123.png",
  "method": "invisible_spectral",
  "processing_status": "completed"
}`,
    curl: `curl -X POST https://api.markify.ai/v1/watermark/image \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.png",
    "provider": "midjourney",
    "model": "v6",
    "strength": "standard"
  }'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/watermark/image", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image_url: "https://example.com/image.png",
    provider: "midjourney",
    model: "v6",
    strength: "standard",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/watermark/image",
    headers={"Authorization": "Bearer mk_live_..."},
    json={
        "image_url": "https://example.com/image.png",
        "provider": "midjourney",
        "model": "v6",
        "strength": "standard",
    },
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/watermark/text',
    description: 'Embed invisible Unicode watermarks into text content. Preserves readability while encoding provenance data.',
    body: `{
  "text": "The quick brown fox jumps over the lazy dog.",
  "provider": "openai",
  "model": "gpt-4",
  "strength": "standard"
}`,
    response: `{
  "id": "ci_def456",
  "watermark_id": "wm_uvw321",
  "watermarked_text": "The quick brown fox jumps over the lazy dog.",
  "method": "text_unicode",
  "processing_status": "completed"
}`,
    curl: `curl -X POST https://api.markify.ai/v1/watermark/text \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "The quick brown fox...",
    "provider": "openai",
    "model": "gpt-4"
  }'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/watermark/text", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "The quick brown fox...",
    provider: "openai",
    model: "gpt-4",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/watermark/text",
    headers={"Authorization": "Bearer mk_live_..."},
    json={
        "text": "The quick brown fox...",
        "provider": "openai",
        "model": "gpt-4",
    },
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/watermark/audio',
    description: 'Embed spectral watermarks into audio files. Supports MP3, WAV, and OGG up to 50MB.',
    body: `{
  "audio_url": "https://example.com/speech.mp3",
  "provider": "elevenlabs",
  "model": "eleven_turbo_v2",
  "strength": "strong"
}`,
    response: `{
  "id": "ci_ghi789",
  "watermark_id": "wm_rst654",
  "watermarked_url": "https://cdn.markify.ai/wm/ghi789.mp3",
  "method": "audio_spectral",
  "processing_status": "completed"
}`,
    curl: `curl -X POST https://api.markify.ai/v1/watermark/audio \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "https://example.com/speech.mp3",
    "provider": "elevenlabs",
    "model": "eleven_turbo_v2",
    "strength": "strong"
  }'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/watermark/audio", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    audio_url: "https://example.com/speech.mp3",
    provider: "elevenlabs",
    model: "eleven_turbo_v2",
    strength: "strong",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/watermark/audio",
    headers={"Authorization": "Bearer mk_live_..."},
    json={
        "audio_url": "https://example.com/speech.mp3",
        "provider": "elevenlabs",
        "model": "eleven_turbo_v2",
        "strength": "strong",
    },
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/detect/text',
    description: 'Analyze text to determine if it was AI-generated. Returns confidence score, provider guess, and reasoning.',
    body: `{
  "text": "The quick brown fox jumps over the lazy dog."
}`,
    response: `{
  "id": "det_abc123",
  "is_ai_generated": true,
  "confidence": 87.5,
  "provider_detected": "openai",
  "model_detected": "gpt-4",
  "watermark_found": true,
  "watermark_id": "wm_uvw321",
  "analysis_details": {
    "reasoning": "High perplexity uniformity and token distribution patterns consistent with GPT-4."
  }
}`,
    curl: `curl -X POST https://api.markify.ai/v1/detect/text \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text": "The quick brown fox..."}'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/detect/text", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "The quick brown fox...",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/detect/text",
    headers={"Authorization": "Bearer mk_live_..."},
    json={"text": "The quick brown fox..."},
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/detect/image',
    description: 'Analyze an image to detect AI generation artifacts and check for embedded watermarks.',
    body: `{
  "image_url": "https://example.com/photo.jpg"
}`,
    response: `{
  "id": "det_def456",
  "is_ai_generated": true,
  "confidence": 92.3,
  "provider_detected": "midjourney",
  "model_detected": "v6",
  "watermark_found": false,
  "watermark_id": null,
  "analysis_details": {
    "reasoning": "GAN fingerprint detected. Frequency domain analysis shows synthetic artifacts."
  }
}`,
    curl: `curl -X POST https://api.markify.ai/v1/detect/image \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "https://example.com/photo.jpg"}'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/detect/image", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image_url: "https://example.com/photo.jpg",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/detect/image",
    headers={"Authorization": "Bearer mk_live_..."},
    json={"image_url": "https://example.com/photo.jpg"},
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/verify',
    description: 'Verify a watermark by its ID. Returns watermark details, provenance, and certificate link if available.',
    body: `{
  "watermark_id": "wm_xyz789"
}`,
    response: `{
  "found": true,
  "watermark_id": "wm_xyz789",
  "content_type": "image",
  "provider": "midjourney",
  "model": "v6",
  "date": "2026-04-07T10:30:00Z",
  "tenant": "Acme Corp",
  "certificate_id": "cert_abc123"
}`,
    curl: `curl -X POST https://api.markify.ai/v1/verify \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"watermark_id": "wm_xyz789"}'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/verify", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ watermark_id: "wm_xyz789" }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/verify",
    headers={"Authorization": "Bearer mk_live_..."},
    json={"watermark_id": "wm_xyz789"},
)
data = res.json()`,
  },
  {
    method: 'GET',
    path: '/api/v1/certificates',
    description: 'List all certificates for your organization. Supports pagination and filtering by type.',
    params: `Query parameters:
  page (number, default: 1)
  limit (number, default: 20, max: 100)
  type (string, optional): "generation" | "modification" | "verification"`,
    response: `{
  "data": [
    {
      "id": "cert_abc123",
      "certificate_type": "generation",
      "issuer": "Markify",
      "generation_date": "2026-04-07T10:30:00Z",
      "is_valid": true,
      "content_hash": "sha256:abc123..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}`,
    curl: `curl https://api.markify.ai/v1/certificates?page=1&limit=20 \\
  -H "Authorization: Bearer mk_live_..."`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/certificates?page=1&limit=20", {
  headers: {
    "Authorization": "Bearer mk_live_...",
  },
});
const data = await res.json();`,
    python: `import requests

res = requests.get(
    "https://api.markify.ai/v1/certificates",
    headers={"Authorization": "Bearer mk_live_..."},
    params={"page": 1, "limit": 20},
)
data = res.json()`,
  },
  {
    method: 'POST',
    path: '/api/v1/certificates',
    description: 'Generate a new compliance certificate for a watermarked content item.',
    body: `{
  "content_item_id": "ci_abc123",
  "certificate_type": "generation",
  "description": "AI-generated marketing image for Q2 campaign"
}`,
    response: `{
  "id": "cert_new456",
  "certificate_type": "generation",
  "issuer": "Markify",
  "generation_date": "2026-04-07T14:00:00Z",
  "content_hash": "sha256:def456...",
  "watermark_id": "wm_xyz789",
  "digital_signature": "sig_...",
  "verification_url": "https://markify.ai/certificate/cert_new456",
  "is_valid": true
}`,
    curl: `curl -X POST https://api.markify.ai/v1/certificates \\
  -H "Authorization: Bearer mk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "content_item_id": "ci_abc123",
    "certificate_type": "generation",
    "description": "AI-generated marketing image"
  }'`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/certificates", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_item_id: "ci_abc123",
    certificate_type: "generation",
    description: "AI-generated marketing image",
  }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    "https://api.markify.ai/v1/certificates",
    headers={"Authorization": "Bearer mk_live_..."},
    json={
        "content_item_id": "ci_abc123",
        "certificate_type": "generation",
        "description": "AI-generated marketing image",
    },
)
data = res.json()`,
  },
  {
    method: 'GET',
    path: '/api/v1/usage',
    description: 'Get usage statistics for the current billing period. Includes breakdown by action type and daily totals.',
    params: `Query parameters:
  from (string, optional): ISO date, default: start of current month
  to (string, optional): ISO date, default: now`,
    response: `{
  "current_month": {
    "total": 1234,
    "quota": 5000,
    "percentage": 24.68
  },
  "breakdown": {
    "watermark": 567,
    "detect": 321,
    "verify": 234,
    "certificate": 112
  },
  "daily": [
    { "date": "2026-04-01", "count": 45 },
    { "date": "2026-04-02", "count": 67 }
  ]
}`,
    curl: `curl https://api.markify.ai/v1/usage \\
  -H "Authorization: Bearer mk_live_..."`,
    javascript: `const res = await fetch("https://api.markify.ai/v1/usage", {
  headers: {
    "Authorization": "Bearer mk_live_...",
  },
});
const data = await res.json();`,
    python: `import requests

res = requests.get(
    "https://api.markify.ai/v1/usage",
    headers={"Authorization": "Bearer mk_live_..."},
)
data = res.json()`,
  },
]

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400',
  POST: 'bg-sky-500/10 text-sky-400',
}

const CODE_TABS: { key: CodeLang; label: string }[] = [
  { key: 'curl', label: 'cURL' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
]

export default function DocsPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  const [activeEndpoint, setActiveEndpoint] = useState(0)
  const [codeLang, setCodeLang] = useState<CodeLang>('curl')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-0 space-y-1">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              API Endpoints
            </h2>
            {ENDPOINTS.map((ep, i) => (
              <button
                key={i}
                onClick={() => setActiveEndpoint(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  activeEndpoint === i
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <span className="truncate font-mono text-xs">{ep.path.replace('/api/v1/', '')}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t.docs}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete API reference for Markify. All endpoints require an API key.
            </p>
          </div>

          {/* Mobile endpoint selector */}
          <div className="lg:hidden">
            <select
              value={activeEndpoint}
              onChange={(e) => setActiveEndpoint(Number(e.target.value))}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ENDPOINTS.map((ep, i) => (
                <option key={i} value={i}>
                  {ep.method} {ep.path}
                </option>
              ))}
            </select>
          </div>

          {/* Authentication */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Include your API key in the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">Authorization</code> header:
            </p>
            <div className="bg-muted rounded-lg p-3">
              <code className="text-xs font-mono text-foreground">
                Authorization: Bearer mk_live_your_api_key_here
              </code>
            </div>
          </div>

          {/* Active endpoint */}
          {ENDPOINTS.map((ep, i) => (
            <div
              key={i}
              className={activeEndpoint === i ? 'space-y-5' : 'hidden'}
            >
              {/* Endpoint header */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${METHOD_COLORS[ep.method]}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-foreground">{ep.path}</code>
                </div>
                <p className="text-sm text-muted-foreground">{ep.description}</p>
              </div>

              {/* Request */}
              {(ep.body || ep.params) && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h4 className="text-sm font-semibold text-foreground">
                      {ep.body ? 'Request Body' : 'Parameters'}
                    </h4>
                  </div>
                  <div className="p-5">
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <code className="text-xs font-mono text-foreground whitespace-pre">
                        {ep.body || ep.params}
                      </code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Response */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground">Response</h4>
                </div>
                <div className="p-5">
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-emerald-400 whitespace-pre">
                      {ep.response}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Code examples */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Code Examples</h4>
                  <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                    {CODE_TABS.map((ct) => (
                      <button
                        key={ct.key}
                        onClick={() => setCodeLang(ct.key)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          codeLang === ct.key
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-foreground whitespace-pre">
                      {ep[codeLang]}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
