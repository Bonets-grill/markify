'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

export default function RegisterPage() {
  const router = useRouter()
  const { lang } = useAppStore()
  const t = T[lang]

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPw) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/verify')
  }

  const inputClass =
    'w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-ring outline-none'

  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{t.register}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.fullName}</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.companyName}</label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.email}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.password}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.confirmPassword}</label>
          <input
            type="password"
            required
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-lg px-4 py-2.5 font-medium transition disabled:opacity-50"
        >
          {loading ? t.loading : t.register}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t.alreadyHaveAccount}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t.login}
        </Link>
      </p>
    </div>
  )
}
