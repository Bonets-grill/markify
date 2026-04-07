'use client'

import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'

const MOCK_DAILY = [
  { day: 'Mon', count: 42 },
  { day: 'Tue', count: 67 },
  { day: 'Wed', count: 35 },
  { day: 'Thu', count: 89 },
  { day: 'Fri', count: 54 },
  { day: 'Sat', count: 23 },
  { day: 'Sun', count: 12 },
]

const MOCK_BREAKDOWN = [
  { action: 'Watermark', count: 0, color: 'bg-sky-400' },
  { action: 'Detect', count: 0, color: 'bg-violet-400' },
  { action: 'Verify', count: 0, color: 'bg-emerald-400' },
  { action: 'Certificate', count: 0, color: 'bg-amber-400' },
]

export default function UsagePage() {
  const { lang, tenant } = useAppStore()
  const t = T[lang]

  const quota = tenant?.usage_quota_monthly ?? 100
  const current = tenant?.usage_current_monthly ?? 0
  const percentage = quota > 0 ? Math.round((current / quota) * 100) : 0
  const alertThreshold = percentage >= 80

  // Next month reset
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetDate = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const maxDaily = Math.max(...MOCK_DAILY.map((d) => d.count), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.usage}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your API usage and quota for the current billing period.
        </p>
      </div>

      {/* Alert banner */}
      {alertThreshold && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-400">{t.warning}: Usage at {percentage}%</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Consider upgrading your plan to avoid service interruptions.
            </p>
          </div>
        </div>
      )}

      {/* Usage gauge + chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage gauge */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Monthly Usage</h3>
          <div className="flex flex-col items-center">
            {/* Circular gauge */}
            <div className="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  className={percentage >= 80 ? 'stroke-amber-400' : 'stroke-primary'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{percentage}%</span>
                <span className="text-xs text-muted-foreground">used</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-foreground font-medium">
                {current.toLocaleString()} / {quota.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Usage resets on {resetDate}
              </p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Last 7 Days</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {MOCK_DAILY.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{d.count}</span>
                <div
                  className="w-full bg-primary/20 rounded-t-md relative overflow-hidden"
                  style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: 4 }}
                >
                  <div
                    className="absolute inset-0 bg-primary rounded-t-md"
                    style={{ opacity: 0.6 + (d.count / maxDaily) * 0.4 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Usage Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Action Type</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Count</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">% of Total</th>
                <th className="px-5 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BREAKDOWN.map((item) => {
                const pct = current > 0 ? Math.round((item.count / current) * 100) : 0
                return (
                  <tr key={item.action} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-foreground">{item.action}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground font-medium">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{pct}%</td>
                    <td className="px-5 py-3">
                      <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
