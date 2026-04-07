'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import type { Certificate, CertificateType } from '@/types/database'

const TYPE_STYLES: Record<CertificateType, { label: string; color: string }> = {
  generation: { label: 'Generation', color: 'bg-sky-500/10 text-sky-400' },
  modification: { label: 'Modification', color: 'bg-violet-500/10 text-violet-400' },
  verification: { label: 'Verification', color: 'bg-emerald-500/10 text-emerald-400' },
}

export default function CertificatesPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  const [certs] = useState<Certificate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<CertificateType>('generation')
  const [formDesc, setFormDesc] = useState('')
  const [formContentId, setFormContentId] = useState('')

  const handleGenerate = async () => {
    if (!formContentId.trim()) return
    // API call would go here
    setShowForm(false)
    setFormType('generation')
    setFormDesc('')
    setFormContentId('')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.certificates}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage compliance certificates for your content.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Generate Certificate
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Generate Certificate</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Content Item ID
            </label>
            <input
              type="text"
              value={formContentId}
              onChange={(e) => setFormContentId(e.target.value)}
              placeholder="Enter content item ID..."
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Certificate Type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as CertificateType)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="generation">Generation</option>
              <option value="modification">Modification</option>
              <option value="verification">Verification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Describe the content or context..."
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleGenerate}
              disabled={!formContentId.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {certs.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-foreground font-medium mb-1">No certificates yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Generate your first compliance certificate.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Generate Certificate
          </button>
        </div>
      ) : certs.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Content</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((cert) => {
                  const typeInfo = TYPE_STYLES[cert.certificate_type]
                  return (
                    <tr key={cert.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground text-xs">
                        {cert.subject_description || cert.content_item_id?.slice(0, 12) + '...' || '--'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(cert.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {cert.is_valid && !cert.revoked_at ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/certificate/${cert.id}`}
                            className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                          >
                            View
                          </Link>
                          {cert.is_valid && !cert.revoked_at && (
                            <button className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors">
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
