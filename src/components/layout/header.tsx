'use client'

import { useAppStore } from '@/stores/app-store'
import { T, SUPPORTED_LANGS, LANG_NAMES, type Lang } from '@/lib/i18n/translations'
import type { ThemeMode } from '@/stores/app-store'

export function Header({ title }: { title?: string }) {
  const { lang, theme, sidebarOpen, setLang, setTheme, toggleSidebar } = useAppStore()
  const t = T[lang]

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'system']
    const idx = modes.indexOf(theme)
    setTheme(modes[(idx + 1) % modes.length])
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {sidebarOpen ? (
              <>
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>

        {/* Collapse toggle — desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Collapse sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? (
              <path d="M11 4 7 9l4 5" />
            ) : (
              <path d="M7 4l4 5-4 5" />
            )}
          </svg>
        </button>

        {title && (
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {SUPPORTED_LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_NAMES[l]}
            </option>
          ))}
        </select>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title={`${t.theme}: ${theme === 'dark' ? t.darkMode : theme === 'light' ? t.lightMode : t.systemMode}`}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 9.6A7 7 0 1 1 8.4 2.5a5.5 5.5 0 0 0 7.1 7.1Z" />
            </svg>
          ) : theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="3.5" />
              <line x1="9" y1="1" x2="9" y2="3" />
              <line x1="9" y1="15" x2="9" y2="17" />
              <line x1="1" y1="9" x2="3" y2="9" />
              <line x1="15" y1="9" x2="17" y2="9" />
              <line x1="3.3" y1="3.3" x2="4.7" y2="4.7" />
              <line x1="13.3" y1="13.3" x2="14.7" y2="14.7" />
              <line x1="3.3" y1="14.7" x2="4.7" y2="13.3" />
              <line x1="13.3" y1="4.7" x2="14.7" y2="3.3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="14" height="10" rx="2" />
              <line x1="6" y1="17" x2="12" y2="17" />
              <line x1="9" y1="14" x2="9" y2="17" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
