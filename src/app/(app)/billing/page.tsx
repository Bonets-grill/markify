'use client'

import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import type { Plan } from '@/types/database'

interface PlanInfo {
  name: string
  price: string
  items: string
  keys: string
  features: string[]
  popular?: boolean
}

const PLANS: Record<Plan, PlanInfo> = {
  free: {
    name: 'Free',
    price: '$0',
    items: '100 items/month',
    keys: '1 API key',
    features: [
      'Text & image watermarking',
      'Basic AI detection',
      'Watermark verification',
      'Community support',
    ],
  },
  starter: {
    name: 'Starter',
    price: '$29',
    items: '5,000 items/month',
    keys: '5 API keys',
    features: [
      'All content types',
      'Advanced AI detection',
      'Compliance certificates',
      'Webhook notifications',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$99',
    items: '50,000 items/month',
    keys: '25 API keys',
    popular: true,
    features: [
      'Everything in Starter',
      'Batch processing',
      'Custom watermark strength',
      'C2PA manifest support',
      'Priority support',
      'Usage analytics',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    items: 'Unlimited',
    keys: 'Unlimited',
    features: [
      'Everything in Pro',
      'On-premise deployment',
      'Custom SLA',
      'Dedicated account manager',
      'SOC 2 compliance',
      'SSO / SAML',
    ],
  },
}

const MOCK_INVOICES = [
  { id: 'INV-001', date: '2026-04-01', amount: '$0.00', status: 'Paid' },
  { id: 'INV-002', date: '2026-03-01', amount: '$0.00', status: 'Paid' },
]

export default function BillingPage() {
  const { lang, tenant } = useAppStore()
  const t = T[lang]

  const currentPlan: Plan = tenant?.plan ?? 'free'
  const planInfo = PLANS[currentPlan]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.billing}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.currentPlan}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {planInfo.name}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Price</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {planInfo.price}
              {currentPlan !== 'enterprise' && <span className="text-sm font-normal text-muted-foreground">{t.pricingMonth}</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Items Included</p>
            <p className="text-lg font-semibold text-foreground mt-1">{planInfo.items}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">API Keys</p>
            <p className="text-lg font-semibold text-foreground mt-1">{planInfo.keys}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Included features:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {planInfo.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t.upgradePlan}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(PLANS) as [Plan, PlanInfo][]).map(([key, plan]) => {
            const isCurrent = key === currentPlan
            return (
              <div
                key={key}
                className={`bg-card border rounded-xl p-5 flex flex-col relative ${
                  plan.popular
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 right-3 px-3 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    {t.currentPlan}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {plan.price}
                  {key !== 'enterprise' && (
                    <span className="text-sm font-normal text-muted-foreground">{t.pricingMonth}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{plan.items}</p>
                <p className="text-xs text-muted-foreground">{plan.keys}</p>

                <div className="mt-4 pt-4 border-t border-border flex-1">
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent}
                  className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isCurrent ? t.currentPlan : t.upgradePlan}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Manage billing */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Manage Billing</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Update payment method, download invoices, and manage your subscription.
          </p>
        </div>
        <a
          href="#"
          className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors border border-border"
        >
          Open Stripe Portal
        </a>
      </div>

      {/* Billing history */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Invoice</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 text-foreground font-mono text-xs">{inv.id}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{inv.date}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
