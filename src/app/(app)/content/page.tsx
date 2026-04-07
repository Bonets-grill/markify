'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import type { ContentItem, ContentType } from '@/types/database'

const TYPE_ICONS: Record<ContentType, { icon: string; color: string }> = {
  text: { icon: 'T', color: 'bg-sky-500/10 text-sky-400' },
  image: { icon: 'I', color: 'bg-violet-500/10 text-violet-400' },
  audio: { icon: 'A', color: 'bg-amber-500/10 text-amber-400' },
  video: { icon: 'V', color: 'bg-emerald-500/10 text-emerald-400' },
  document: { icon: 'D', color: 'bg-rose-500/10 text-rose-400' },
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400',
  processing: 'bg-amber-500/10 text-amber-400',
  queued: 'bg-sky-500/10 text-sky-400',
  failed: 'bg-red-500/10 text-red-400',
}

export default function ContentPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  const [items] = useState<ContentItem[]>([])
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = items.filter((item) => {
    if (filterType !== 'all' && item.content_type !== filterType) return false
    if (dateFrom && item.created_at < dateFrom) return false
    if (dateTo && item.created_at > dateTo + 'T23:59:59') return false
    return true
  })

  const typeCounts = items.reduce(
    (acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.content}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all your watermarked content items.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.totalItems}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
        </div>
        {(['text', 'image', 'audio', 'video', 'document'] as ContentType[]).map((type) => (
          <div key={type} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{typeCounts[type] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t.filter}:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-foreground font-medium mb-1">No content yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Use the API to watermark your first item.
          </p>
          <Link
            href="/docs"
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t.docs}
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Source</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Watermark ID</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const typeInfo = TYPE_ICONS[item.content_type]
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg text-xs font-bold ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">
                          {item.source_provider || 'Unknown'}
                        </span>
                        {item.source_model && (
                          <span className="text-muted-foreground ml-1">/ {item.source_model}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                          {item.watermark_id ? item.watermark_id.slice(0, 12) + '...' : '--'}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.processing_status]}`}>
                          {item.processing_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.watermark_id && (
                            <Link
                              href={`/verify/${item.watermark_id}`}
                              className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                            >
                              Verify
                            </Link>
                          )}
                          {item.certificate_id && (
                            <Link
                              href={`/certificate/${item.certificate_id}`}
                              className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                            >
                              Certificate
                            </Link>
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
      )}
    </div>
  )
}
