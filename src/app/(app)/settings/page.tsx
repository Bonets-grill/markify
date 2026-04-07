'use client'

import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { T, SUPPORTED_LANGS, LANG_NAMES, type Lang } from '@/lib/i18n/translations'
import type { ThemeMode } from '@/stores/app-store'

export default function SettingsPage() {
  const { lang, theme, tenant, setLang, setTheme } = useAppStore()
  const t = T[lang]

  const [companyName, setCompanyName] = useState(tenant?.name ?? '')
  const [companySlug, setCompanySlug] = useState(tenant?.slug ?? '')
  const [companyDomain, setCompanyDomain] = useState(tenant?.domain ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Simulated save — no DB yet
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const themes: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: t.darkMode },
    { value: 'light', label: t.lightMode },
    { value: 'system', label: t.systemMode },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.settingsTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.tenantSettings}</p>
      </div>

      {/* Company Info */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t.companyInfo}</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t.companyName}
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t.companySlug}
          </label>
          <input
            type="text"
            value={companySlug}
            onChange={(e) => setCompanySlug(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t.companyDomain}
          </label>
          <input
            type="text"
            value={companyDomain}
            onChange={(e) => setCompanyDomain(e.target.value)}
            placeholder="app.example.com"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </section>

      {/* Theme */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">{t.theme}</h2>
        <div className="flex gap-3">
          {themes.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors
                ${theme === opt.value
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}
              `}
            >
              {opt.value === 'dark' && (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-2 -mt-0.5">
                  <path d="M15.5 9.6A7 7 0 1 1 8.4 2.5a5.5 5.5 0 0 0 7.1 7.1Z" />
                </svg>
              )}
              {opt.value === 'light' && (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-2 -mt-0.5">
                  <circle cx="9" cy="9" r="3.5" />
                  <line x1="9" y1="1" x2="9" y2="3" />
                  <line x1="9" y1="15" x2="9" y2="17" />
                  <line x1="1" y1="9" x2="3" y2="9" />
                  <line x1="15" y1="9" x2="17" y2="9" />
                </svg>
              )}
              {opt.value === 'system' && (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-2 -mt-0.5">
                  <rect x="2" y="4" width="14" height="10" rx="2" />
                  <line x1="6" y1="17" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="9" y2="17" />
                </svg>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">{t.language}</h2>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {SUPPORTED_LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_NAMES[l]}
            </option>
          ))}
        </select>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {saved ? t.success : t.save}
        </button>
      </div>
    </div>
  )
}
