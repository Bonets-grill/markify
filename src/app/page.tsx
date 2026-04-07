'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'
import { T, SUPPORTED_LANGS, LANG_NAMES, type Lang } from '@/lib/i18n/translations'

/* ------------------------------------------------------------------ */
/*  Icon components                                                    */
/* ------------------------------------------------------------------ */

function IconWatermark() {
  return (
    <svg className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function IconDetect() {
  return (
    <svg className="h-8 w-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  )
}

function IconCertify() {
  return (
    <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15l-2 5 2-1.5L14 20l-2-5z" />
      <circle cx="12" cy="9" r="6" />
      <path d="M9 9l2 2 4-4" />
    </svg>
  )
}

function IconApi() {
  return (
    <svg className="h-8 w-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Code snippet                                                       */
/* ------------------------------------------------------------------ */

const CODE_SNIPPET = `import { Markify } from '@markify/sdk'

const markify = new Markify({ apiKey: 'mk_live_...' })

// Watermark an AI-generated image
const result = await markify.watermark.image(file, {
  method: 'spectral',
  label: true,
  provider: 'midjourney'
})

console.log(result.watermark_id)  // "wm_a1b2c3..."
console.log(result.certificate_url) // "https://markify.eu/cert/..."`

/* ------------------------------------------------------------------ */
/*  Plan data                                                          */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  nameKey: 'pricingFree' | 'pricingStarter' | 'pricingPro' | 'pricingEnterprise'
  price: string
  popular?: boolean
  features: (lang: Lang) => PlanFeature[]
}

const PLANS: Plan[] = [
  {
    nameKey: 'pricingFree',
    price: '$0',
    features: (lang) => [
      { text: `100 ${T[lang].pricingItemsMonth}`, included: true },
      { text: `10 ${T[lang].detections}/day`, included: true },
      { text: `API`, included: false },
      { text: `Community support`, included: true },
    ],
  },
  {
    nameKey: 'pricingStarter',
    price: '\u20AC29',
    features: (lang) => [
      { text: `1,000 ${T[lang].pricingItemsMonth}`, included: true },
      { text: `${T[lang].pricingUnlimited} ${T[lang].detection.toLowerCase()}`, included: true },
      { text: `1 ${T[lang].pricingApiKeys.replace(/s$/, '')}`, included: true },
      { text: T[lang].certificates, included: true },
      { text: `Email support`, included: true },
    ],
  },
  {
    nameKey: 'pricingPro',
    price: '\u20AC99',
    popular: true,
    features: (lang) => [
      { text: `10,000 ${T[lang].pricingItemsMonth}`, included: true },
      { text: `All features`, included: true },
      { text: `10 ${T[lang].pricingApiKeys}`, included: true },
      { text: T[lang].webhooks, included: true },
      { text: `Priority support`, included: true },
    ],
  },
  {
    nameKey: 'pricingEnterprise',
    price: '\u20AC299',
    features: (lang) => [
      { text: T[lang].pricingUnlimited, included: true },
      { text: `Custom branding`, included: true },
      { text: `SSO`, included: true },
      { text: `SLA`, included: true },
      { text: `Dedicated support`, included: true },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                 */
/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: <IconWatermark />, titleKey: 'featureWatermark' as const, descKey: 'featureWatermarkDesc' as const },
  { icon: <IconDetect />, titleKey: 'featureDetect' as const, descKey: 'featureDetectDesc' as const },
  { icon: <IconCertify />, titleKey: 'featureCertify' as const, descKey: 'featureCertifyDesc' as const },
  { icon: <IconApi />, titleKey: 'featureApi' as const, descKey: 'featureApiDesc' as const },
]

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { lang, setLang } = useAppStore()
  const t = T[lang]
  const [langOpen, setLangOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background" />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
              M
            </span>
            <span className="text-lg font-semibold tracking-tight">{t.appName}</span>
          </a>

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t.featureWatermark.split(' ')[0] === 'Invisible' ? 'Features' : t.content}
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t.pricingTitle.split(',')[0]}
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t.docs}
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {LANG_NAMES[lang].slice(0, 2).toUpperCase()}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 rounded-lg border border-border bg-card p-1 shadow-xl">
                  {SUPPORTED_LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false) }}
                      className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted ${l === lang ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {LANG_NAMES[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {t.login}
            </a>
            <a
              href="/register"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/25"
            >
              {t.ctaGetStarted}
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Gradient background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column */}
            <div className="flex flex-col items-start">
              {/* Urgency badge */}
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {t.heroDeadline}
              </span>

              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                  {t.heroTitle}
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {t.heroSubtitle}
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/register"
                  className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 hover:shadow-xl hover:shadow-sky-500/30"
                >
                  {t.ctaGetStarted}
                </a>
                <a
                  href="#"
                  className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {t.ctaViewDocs}
                </a>
              </div>
            </div>

            {/* Right column - code snippet */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-border bg-[#0d0d14] shadow-2xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-zinc-500">watermark.ts</span>
                </div>
                {/* Code */}
                <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                  <code className="text-zinc-300">
                    {CODE_SNIPPET.split('\n').map((line, i) => (
                      <span key={i} className="block">
                        {highlightLine(line)}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-sky-500/10 to-violet-500/10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                     */}
      {/* ============================================================ */}
      <section id="features" className="border-t border-border bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.tagline}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.titleKey}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{t[f.titleKey]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t[f.descKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                      */}
      {/* ============================================================ */}
      <section id="pricing" className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.pricingTitle}
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.nameKey}
                className={`relative flex flex-col rounded-xl border p-6 transition-all hover:shadow-lg ${
                  plan.popular
                    ? 'border-sky-500 shadow-lg shadow-sky-500/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}

                <h3 className="text-lg font-semibold">{t[plan.nameKey]}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{t.pricingMonth}</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features(lang).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      {feat.included ? <IconCheck /> : <IconX />}
                      <span className={feat.included ? 'text-foreground' : 'text-zinc-600 line-through'}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/register"
                  className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400'
                      : 'border border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {t.ctaGetStarted}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white">
              M
            </span>
            <span className="text-sm text-muted-foreground">
              {t.appName} &copy; {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="transition-colors hover:text-foreground">Status</a>
            <a href="#" className="transition-colors hover:text-foreground">GitHub</a>
          </nav>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
            EU AI Act Compliant
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Syntax highlighting (minimal)                                      */
/* ------------------------------------------------------------------ */

function highlightLine(line: string): React.ReactNode {
  if (line.startsWith('//') || line.startsWith('// ')) {
    return <span className="text-zinc-500">{line}</span>
  }
  if (line.startsWith('import')) {
    return (
      <>
        <span className="text-violet-400">import</span>
        {highlightStrings(line.slice(6))}
      </>
    )
  }
  if (line.startsWith('const ')) {
    const eqIdx = line.indexOf('=')
    if (eqIdx > 0) {
      return (
        <>
          <span className="text-violet-400">const </span>
          <span className="text-sky-300">{line.slice(6, eqIdx)}</span>
          <span className="text-zinc-400">=</span>
          {highlightStrings(line.slice(eqIdx + 1))}
        </>
      )
    }
    return <span className="text-violet-400">{line}</span>
  }
  if (line.trimStart().startsWith('console.')) {
    const indent = line.length - line.trimStart().length
    return (
      <>
        {' '.repeat(indent)}
        <span className="text-amber-300">console</span>
        <span className="text-zinc-400">.</span>
        {highlightStrings(line.trimStart().slice(8))}
      </>
    )
  }
  if (line.includes('await ')) {
    const idx = line.indexOf('await')
    return (
      <>
        {highlightStrings(line.slice(0, idx))}
        <span className="text-violet-400">await </span>
        {highlightStrings(line.slice(idx + 6))}
      </>
    )
  }
  return highlightStrings(line)
}

function highlightStrings(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  const regex = /('[^']*'|"[^"]*")/g
  let match
  let lastIndex = 0

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++} className="text-zinc-300">{remaining.slice(lastIndex, match.index)}</span>)
    }
    parts.push(<span key={key++} className="text-emerald-400">{match[0]}</span>)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < remaining.length) {
    parts.push(<span key={key++} className="text-zinc-300">{remaining.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}
