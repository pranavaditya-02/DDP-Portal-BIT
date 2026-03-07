'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import Link from 'next/link'

const PUBLIC_PATHS = ['/login', '/register', '/']

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  // Wait for zustand to rehydrate from localStorage before deciding layout
  if (!_hasHydrated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </main>
    )
  }

  const showSidebar = isAuthenticated && !isPublicPage

  if (!showSidebar) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        {children}
      </main>
    )
  }

  // Desktop margin: collapsed → 72px, expanded → 260px
  const desktopMargin = collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeInUp"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ml-0 ${desktopMargin}`}>
        {/* Mobile top bar - Modern Glassmorphism */}
        <div className="md:hidden sticky top-0 z-30 glass rounded-none border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg hover-scale">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Faculty Tracker</span>
            </Link>
            <div className="w-10" /> {/* Spacer for symmetry */}
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
