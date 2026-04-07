'use client'

import Link from 'next/link'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

export default function VerifyPage() {
  const { lang } = useAppStore()
  const t = T[lang]

  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">{t.verifyEmail}</h1>
      <p className="text-muted-foreground mb-8">{t.verifyEmailDesc}</p>

      <Link
        href="/login"
        className="inline-block bg-primary text-primary-foreground hover:opacity-90 rounded-lg px-4 py-2.5 font-medium transition"
      >
        {t.login}
      </Link>
    </div>
  )
}
