'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import type { ApiKey } from '@/types/database'

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'mk_live_'
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

type PermKey = 'watermark' | 'detect' | 'verify' | 'certificates'

export default function ApiKeysPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    watermark: true,
    detect: true,
    verify: true,
    certificates: false,
  })
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const permLabels: { key: PermKey; label: string }[] = [
    { key: 'watermark', label: t.permWatermark },
    { key: 'detect', label: t.permDetect },
    { key: 'verify', label: t.permVerify },
    { key: 'certificates', label: t.permCertificates },
  ]

  const handleCreate = useCallback(async () => {
    if (!newKeyName.trim()) return
    const rawKey = generateKey()
    const hash = await hashKey(rawKey)
    const prefix = rawKey.slice(0, 8) + '...' + rawKey.slice(-4)

    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      tenant_id: '',
      name: newKeyName.trim(),
      key_hash: hash,
      key_prefix: prefix,
      permissions: { ...perms },
      last_used_at: null,
      expires_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    setKeys((prev) => [apiKey, ...prev])
    setRevealedKey(rawKey)
    setNewKeyName('')
    setPerms({ watermark: true, detect: true, verify: true, certificates: false })
    setShowCreate(false)
  }, [newKeyName, perms])

  const handleRevoke = (id: string) => {
    if (!confirm(t.revokeKeyConfirm)) return
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, is_active: false } : k))
    )
  }

  const handleCopy = () => {
    if (revealedKey) {
      navigator.clipboard.writeText(revealedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.apiKeysTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.apiKeysDesc}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t.createApiKey}
        </button>
      </div>

      {/* Revealed key modal */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t.apiKeyCreated}</h2>
            <p className="text-sm text-muted-foreground">{t.apiKeyCreatedDesc}</p>
            <div className="bg-muted rounded-lg p-3 font-mono text-sm text-foreground break-all select-all">
              {revealedKey}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                {copied ? t.copied : t.copyToClipboard}
              </button>
              <button
                onClick={() => setRevealedKey(null)}
                className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors border border-border"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">{t.createApiKey}</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t.apiKeyName}
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production Backend"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.apiKeyPermissions}
            </label>
            <div className="flex flex-wrap gap-4">
              {permLabels.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms[key]}
                    onChange={() => setPerms((p) => ({ ...p, [key]: !p[key] }))}
                    className="w-4 h-4 rounded border-border bg-muted accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.create}
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length === 0 && !showCreate ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground/50 mb-4">
            <path d="M10.5 2a4.5 4.5 0 0 0-3.8 6.9L2 13.6V16h2.4l.9-.9v-1.5h1.5l1-1h1.5l.6-.6A4.5 4.5 0 1 0 10.5 2Z" />
            <circle cx="12" cy="5.5" r="1" />
          </svg>
          <p className="text-muted-foreground text-sm">{t.noResults}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t.createApiKey}
          </button>
        </div>
      ) : keys.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t.keyPrefix}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t.apiKeyName}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t.apiKeyPermissions}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t.lastUsed}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {key.key_prefix}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-foreground">{key.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(Object.entries(key.permissions) as [PermKey, boolean][])
                          .filter(([, v]) => v)
                          .map(([k]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium"
                            >
                              {permLabels.find((p) => p.key === k)?.label}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : t.never}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {key.is_active ? (
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-xs font-medium text-emerald-400">{t.active}</span>
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                          >
                            {t.revokeKey}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">{t.revoked}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
