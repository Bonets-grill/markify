'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/stores/app-store'
import { T } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  {
    key: 'dashboard' as const,
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="7" height="7" rx="1" />
        <rect x="10" y="1" width="7" height="7" rx="1" />
        <rect x="1" y="10" width="7" height="7" rx="1" />
        <rect x="10" y="10" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'content' as const,
    href: '/content',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        <path d="M5 7h8M5 11h5" />
      </svg>
    ),
  },
  {
    key: 'certificates' as const,
    href: '/certificates',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M6 10.5V16l3-1.5L12 16v-5.5" />
      </svg>
    ),
  },
  {
    key: 'detection' as const,
    href: '/detection',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="5" />
        <path d="m13 13 3 3" />
      </svg>
    ),
  },
  {
    key: 'apiKeys' as const,
    href: '/api-keys',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 2a4.5 4.5 0 0 0-3.8 6.9L2 13.6V16h2.4l.9-.9v-1.5h1.5l1-1h1.5l.6-.6A4.5 4.5 0 1 0 10.5 2Z" />
        <circle cx="12" cy="5.5" r="1" />
      </svg>
    ),
  },
  {
    key: 'webhooks' as const,
    href: '/webhooks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14a3 3 0 1 0 0-6h-.3" />
        <path d="M13 4a3 3 0 1 0 0 6h.3" />
        <path d="M9 16a3 3 0 0 0 2.6-4.5" />
        <path d="M9 2a3 3 0 0 0-2.6 4.5" />
        <line x1="5" y1="11" x2="13" y2="7" />
      </svg>
    ),
  },
  {
    key: 'usage' as const,
    href: '/usage',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 14H2V2" />
        <path d="M5 11 8 7l3 3 4-5" />
      </svg>
    ),
  },
  {
    key: 'docs' as const,
    href: '/docs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h5a2 2 0 0 1 2 2v11l-2.5-1.5L4 16V5a2 2 0 0 1 2-2Z" />
        <path d="M16 3h-5a2 2 0 0 0-2 2v11l2.5-1.5L14 16V5a2 2 0 0 0-2-2Z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, sidebarOpen, toggleSidebar, setSidebarOpen, user } = useAppStore()
  const t = T[lang]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    useAppStore.getState().reset()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-card border-r border-border
          flex flex-col transition-all duration-200 ease-in-out
          lg:relative lg:z-auto
          ${sidebarOpen ? 'w-60 translate-x-0' : 'w-[60px] -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            M
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-foreground text-base tracking-tight">
              Markify
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
              title={!sidebarOpen ? t[item.key] : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{t[item.key]}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-0.5 shrink-0">
          <Link
            href="/settings"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive('/settings')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}
            title={!sidebarOpen ? t.settings : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="9" cy="9" r="2.5" />
              <path d="M14.7 11a1.2 1.2 0 0 0 .2 1.3l.1.1a1.5 1.5 0 1 1-2.1 2.1l-.1-.1a1.2 1.2 0 0 0-1.3-.2 1.2 1.2 0 0 0-.7 1.1v.2a1.5 1.5 0 0 1-3 0v-.1a1.2 1.2 0 0 0-.8-1.1 1.2 1.2 0 0 0-1.3.2l-.1.1a1.5 1.5 0 1 1-2.1-2.1l.1-.1a1.2 1.2 0 0 0 .2-1.3 1.2 1.2 0 0 0-1.1-.7h-.2a1.5 1.5 0 0 1 0-3h.1a1.2 1.2 0 0 0 1.1-.8 1.2 1.2 0 0 0-.2-1.3l-.1-.1a1.5 1.5 0 1 1 2.1-2.1l.1.1a1.2 1.2 0 0 0 1.3.2h.1a1.2 1.2 0 0 0 .7-1.1v-.2a1.5 1.5 0 0 1 3 0v.1a1.2 1.2 0 0 0 .7 1.1 1.2 1.2 0 0 0 1.3-.2l.1-.1a1.5 1.5 0 1 1 2.1 2.1l-.1.1a1.2 1.2 0 0 0-.2 1.3v.1a1.2 1.2 0 0 0 1.1.7h.2a1.5 1.5 0 0 1 0 3h-.1a1.2 1.2 0 0 0-1.1.7Z" />
            </svg>
            {sidebarOpen && <span>{t.settings}</span>}
          </Link>

          {sidebarOpen && user && (
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={!sidebarOpen ? t.logout : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M6 16H3.5A1.5 1.5 0 0 1 2 14.5v-11A1.5 1.5 0 0 1 3.5 2H6" />
              <polyline points="12 13 16 9 12 5" />
              <line x1="16" y1="9" x2="6" y2="9" />
            </svg>
            {sidebarOpen && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
