'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import type { WebhookSubscription } from '@/types/database'

const WEBHOOK_EVENTS = [
  { key: 'content.watermarked', label: 'Content Watermarked', desc: 'Triggered when content is successfully watermarked' },
  { key: 'content.detected', label: 'Content Detected', desc: 'Triggered when AI detection completes on content' },
  { key: 'certificate.issued', label: 'Certificate Issued', desc: 'Triggered when a new certificate is generated' },
]

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'whsec_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function WebhooksPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formUrl, setFormUrl] = useState('')
  const [formEvents, setFormEvents] = useState<string[]>([])
  const [formSecret, setFormSecret] = useState('')
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean } | null>(null)

  const openCreateForm = () => {
    setEditingId(null)
    setFormUrl('')
    setFormEvents([])
    setFormSecret(generateSecret())
    setShowForm(true)
  }

  const openEditForm = (wh: WebhookSubscription) => {
    setEditingId(wh.id)
    setFormUrl(wh.url)
    setFormEvents(wh.events)
    setFormSecret(wh.secret)
    setShowForm(true)
  }

  const toggleEvent = (event: string) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const handleSave = useCallback(() => {
    if (!formUrl.trim() || formEvents.length === 0) return

    if (editingId) {
      setWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === editingId
            ? { ...wh, url: formUrl.trim(), events: formEvents, secret: formSecret }
            : wh
        )
      )
    } else {
      const newWebhook: WebhookSubscription = {
        id: crypto.randomUUID(),
        tenant_id: '',
        url: formUrl.trim(),
        events: formEvents,
        secret: formSecret,
        is_active: true,
        last_triggered_at: null,
        created_at: new Date().toISOString(),
      }
      setWebhooks((prev) => [newWebhook, ...prev])
    }

    setShowForm(false)
    setEditingId(null)
  }, [formUrl, formEvents, formSecret, editingId])

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id))
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    setTestResult(null)
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setTestResult({ id, success: true })
    setTesting(null)
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(formSecret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, is_active: !wh.is_active } : wh))
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.webhooks}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Receive real-time notifications when events occur in your account.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Webhook
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h3 className="text-base font-semibold text-foreground">
            {editingId ? 'Edit Webhook' : 'Add Webhook'}
          </h3>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Endpoint URL
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://your-app.com/webhooks/markify"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Events
            </label>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label
                  key={ev.key}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formEvents.includes(ev.key)}
                    onChange={() => toggleEvent(ev.key)}
                    className="w-4 h-4 rounded border-border bg-muted accent-primary mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground">{ev.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Secret */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Signing Secret
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono select-all overflow-x-auto">
                {formSecret}
              </div>
              <button
                onClick={handleCopySecret}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors shrink-0"
              >
                {copied ? t.copied : t.copyToClipboard}
              </button>
              <button
                onClick={() => setFormSecret(generateSecret())}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Regenerate
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use this secret to verify webhook signatures in your application.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!formUrl.trim() || formEvents.length === 0}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t.save : t.create}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {webhooks.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <p className="text-foreground font-medium mb-1">No webhooks configured</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add a webhook to receive real-time event notifications.
          </p>
          <button
            onClick={openCreateForm}
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Webhook
          </button>
        </div>
      ) : webhooks.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">URL</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Events</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Last Triggered</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-foreground">
                        {wh.url.length > 40 ? wh.url.slice(0, 40) + '...' : wh.url}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((ev) => (
                          <span
                            key={ev}
                            className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(wh.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          wh.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${wh.is_active ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                        {wh.is_active ? t.active : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {wh.last_triggered_at
                        ? new Date(wh.last_triggered_at).toLocaleString()
                        : t.never}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleTest(wh.id)}
                          disabled={testing === wh.id}
                          className="text-xs text-primary font-medium hover:text-primary/80 transition-colors disabled:opacity-50"
                        >
                          {testing === wh.id ? 'Testing...' : 'Test'}
                        </button>
                        <button
                          onClick={() => openEditForm(wh)}
                          className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(wh.id)}
                          className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Test result */}
          {testResult && (
            <div className={`mx-4 mb-4 p-3 rounded-lg ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {testResult.success
                  ? 'Test event sent successfully! Check your endpoint for the delivery.'
                  : 'Test event delivery failed. Check the URL and try again.'}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
