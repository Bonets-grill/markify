'use client'

import Link from 'next/link'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

const STAT_COLORS = [
  'border-l-sky-500',
  'border-l-violet-500',
  'border-l-emerald-500',
  'border-l-amber-500',
]

export default function DashboardPage() {
  const { lang, user } = useAppStore()
  const t = T[lang]

  const stats = [
    { label: t.totalItems, value: '0', color: STAT_COLORS[0] },
    { label: t.itemsThisMonth, value: '0', color: STAT_COLORS[1] },
    { label: t.apiCalls, value: '0', color: STAT_COLORS[2] },
    { label: t.detections, value: '0', color: STAT_COLORS[3] },
  ]

  const steps = [
    { title: t.step1Title, desc: t.step1Desc, href: '/api-keys' },
    { title: t.step2Title, desc: t.step2Desc, href: '/content' },
    { title: t.step3Title, desc: t.step3Desc, href: '/certificates' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t.welcomeBack}{user ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t.tagline}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-card border border-border rounded-xl p-5 border-l-4 ${stat.color}`}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">--</p>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t.quickStart}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.quickStartDesc}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {steps.map((step, i) => (
            <Link
              key={i}
              href={step.href}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {step.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
