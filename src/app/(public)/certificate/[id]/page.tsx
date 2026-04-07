'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface CertificateData {
  id: string
  certificate_type: 'generation' | 'modification' | 'verification'
  issuer: string
  generation_date: string
  content_hash: string
  watermark_id: string | null
  digital_signature: string
  is_valid: boolean
  revoked_at: string | null
  revoked_reason: string | null
  ai_provider: string | null
  ai_model: string | null
  subject_description: string | null
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  generation: { label: 'Generation Certificate', color: 'bg-sky-500/10 text-sky-400' },
  modification: { label: 'Modification Certificate', color: 'bg-violet-500/10 text-violet-400' },
  verification: { label: 'Verification Certificate', color: 'bg-emerald-500/10 text-emerald-400' },
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [cert, setCert] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/v1/certificates/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('Certificate not found')
        const data = await res.json()
        setCert(data)
      } catch {
        setError('Unable to load certificate. It may not exist or has been removed.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleVerifySignature = async () => {
    if (!cert) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch(`/api/v1/certificates/${cert.id}/verify`, { method: 'POST' })
      if (!res.ok) throw new Error('Verification failed')
      const data = await res.json()
      setVerifyResult(data)
    } catch {
      setVerifyResult({ valid: false, message: 'Signature verification failed.' })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground">
            <span className="text-primary">Mark</span>ify
          </Link>
          <span className="text-sm text-muted-foreground">Certificate Verification</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {loading && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-primary mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              <p className="text-muted-foreground text-sm">Loading certificate...</p>
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
              <h2 className="text-lg font-semibold text-foreground mb-2">Certificate Not Found</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {cert && !loading && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Certificate header with logo */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center border-b border-border">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    <span className="text-primary">Mark</span>ify
                  </span>
                </div>
                <div className="mb-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${TYPE_LABELS[cert.certificate_type]?.color ?? 'bg-muted text-muted-foreground'}`}>
                    {TYPE_LABELS[cert.certificate_type]?.label ?? cert.certificate_type}
                  </span>
                </div>
                {/* Status */}
                <div className="flex items-center justify-center gap-2">
                  {cert.is_valid && !cert.revoked_at ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Valid</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-sm font-medium text-red-400">Revoked</span>
                    </>
                  )}
                </div>
              </div>

              {/* Certificate details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CertField label="Certificate ID" value={cert.id} mono />
                  <CertField label="Issuer" value={cert.issuer} />
                  <CertField
                    label="Generation Date"
                    value={new Date(cert.generation_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  />
                  <CertField label="Content Hash" value={cert.content_hash.slice(0, 16) + '...'} mono />
                  {cert.watermark_id && (
                    <CertField label="Watermark ID" value={cert.watermark_id.slice(0, 16) + '...'} mono />
                  )}
                  {cert.ai_provider && <CertField label="AI Provider" value={cert.ai_provider} />}
                  {cert.ai_model && <CertField label="AI Model" value={cert.ai_model} />}
                  {cert.subject_description && (
                    <div className="sm:col-span-2">
                      <CertField label="Description" value={cert.subject_description} />
                    </div>
                  )}
                </div>

                {/* Digital signature */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Digital Signature</p>
                  <code className="block text-xs font-mono text-muted-foreground bg-muted rounded-lg p-3 break-all">
                    {cert.digital_signature.slice(0, 64)}...
                  </code>
                </div>

                {/* QR Code placeholder */}
                <div className="flex items-center justify-center pt-4">
                  <div className="w-28 h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                    <span className="text-muted-foreground text-sm font-medium">QR</span>
                  </div>
                </div>

                {/* Revocation info */}
                {cert.revoked_at && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm text-red-400 font-medium">Revoked on {new Date(cert.revoked_at).toLocaleDateString()}</p>
                    {cert.revoked_reason && (
                      <p className="text-sm text-red-400/80 mt-1">{cert.revoked_reason}</p>
                    )}
                  </div>
                )}

                {/* Verify result */}
                {verifyResult && (
                  <div className={`rounded-lg p-4 ${verifyResult.valid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${verifyResult.valid ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className={`text-sm font-medium ${verifyResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {verifyResult.message}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <button
                    className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={handleVerifySignature}
                    disabled={verifying}
                    className="flex-1 py-2.5 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors border border-border disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Verify Signature'
                    )}
                  </button>
                </div>
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

function CertField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-sm text-foreground ${mono ? 'font-mono text-xs bg-muted px-2 py-1 rounded' : ''}`}>
        {value}
      </p>
    </div>
  )
}
