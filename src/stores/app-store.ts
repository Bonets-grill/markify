'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '@/lib/i18n/translations'
import type { Profile, Tenant } from '@/types/database'

export type ThemeMode = 'dark' | 'light' | 'system'

interface AppState {
  lang: Lang
  theme: ThemeMode
  sidebarOpen: boolean
  user: Profile | null
  tenant: Tenant | null

  setLang: (lang: Lang) => void
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setUser: (user: Profile | null) => void
  setTenant: (tenant: Tenant | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      theme: 'dark',
      sidebarOpen: true,
      user: null,
      tenant: null,

      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      reset: () => set({ user: null, tenant: null }),
    }),
    {
      name: 'markify_app',
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
