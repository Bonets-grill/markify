'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useAppStore()
  const t = T[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(t.invalidCredentials)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{t.login}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.email}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-ring outline-none"
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
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-ring outline-none"
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
          {loading ? t.loading : t.login}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t.dontHaveAccount}{' '}
        <Link href="/register" className="text-primary hover:underline">
          {t.register}
        </Link>
      </p>
    </div>
  )
}
