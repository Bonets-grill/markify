'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface VerifyResult {
  found: boolean
  watermark_id: string
  content_type: string | null
  provider: string | null
  model: string | null
  date: string | null
  tenant: string | null
  certificate_id: string | null
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/v1/verify?watermark_id=${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('Verification request failed')
        const data = await res.json()
        setResult(data)
      } catch {
        setError('Unable to verify watermark. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [id])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground">
            <span className="text-primary">Mark</span>ify
          </Link>
          <span className="text-sm text-muted-foreground">Watermark Verification</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {loading && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-primary mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              <p className="text-muted-foreground text-sm">Verifying watermark...</p>
            </div>
          )}

          {error && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Verification Error</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Status banner */}
              <div className={`px-6 py-4 ${result.found ? 'bg-emerald-500/10 border-b border-emerald-500/20' : 'bg-red-500/10 border-b border-red-500/20'}`}>
                <div className="flex items-center gap-3">
                  {result.found ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h2 className={`text-lg font-semibold ${result.found ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.found ? 'Watermark Verified' : 'Watermark Not Found'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {result.found
                        ? 'This content has been verified as AI-generated and properly watermarked.'
                        : 'No matching watermark was found for this ID.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Watermark Details</h3>
                <div className="space-y-3">
                  <DetailRow label="Watermark ID" value={result.watermark_id} mono />
                  {result.content_type && (
                    <DetailRow label="Content Type" value={result.content_type.charAt(0).toUpperCase() + result.content_type.slice(1)} />
                  )}
                  {result.provider && <DetailRow label="Provider" value={result.provider} />}
                  {result.model && <DetailRow label="Model" value={result.model} />}
                  {result.date && (
                    <DetailRow label="Watermarked On" value={new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                  )}
                  {result.tenant && <DetailRow label="Organization" value={result.tenant} />}
                </div>

                {/* Certificate link */}
                {result.certificate_id && (
                  <div className="pt-4 border-t border-border">
                    <Link
                      href={`/certificate/${result.certificate_id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10M7 12h6M7 16h8" />
                      </svg>
                      View Compliance Certificate
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Powered by <span className="text-primary font-medium">Markify</span>
        </Link>
      </footer>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-foreground text-right ${mono ? 'font-mono text-xs bg-muted px-2 py-0.5 rounded' : ''}`}>
        {value}
      </span>
    </div>
  )
}
