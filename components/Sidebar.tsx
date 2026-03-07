'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  User,
  ChevronDown,
  Award,
  Clipboard,
  X,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  show: boolean
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: !isDean() },
      ],
    },
    {
      title: 'Faculty',
      items: [
        { label: 'My Activities', href: '/activities', icon: FileText, show: isFaculty() && !isDean() },
        // { label: 'Submit Activity', href: '/activities/submit', icon: PlusCircle, show: isFaculty() },
        { label: 'Submit Achievements', href: '/achievements/submit', icon: Award, show: isFaculty() && !isDean() },
        { label: 'Submit Action Plan', href: '/action-plan/submit', icon: Clipboard, show: isFaculty() && !isDean() },
      ],
    },
    {
      title: 'Department',
      items: [
        { label: 'Department', href: '/department', icon: Building2, show: isHod() },
        { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, show: isHod() },
      ],
    },
    {
      title: 'College',
      items: [
        { label: 'College Overview', href: '/college', icon: GraduationCap, show: isDean() },
        { label: 'Department', href: '/department', icon: Building2, show: isDean() },
        { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, show: isDean() },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Verification Queue', href: '/verification', icon: ShieldCheck, show: isVerification(), badge: 7 },
        { label: 'Role Management', href: '/roles', icon: Shield, show: isMaintenance() },
        { label: 'Settings', href: '/settings', icon: Settings, show: isMaintenance() },
      ],
    },
  ]

  // Filter groups: only show groups that have at least one visible item
  const visibleGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.show) }))
    .filter(g => g.items.length > 0)

  const isActive = (href: string) => pathname === href

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      faculty: 'bg-blue-500/20 text-blue-300',
      hod: 'bg-emerald-500/20 text-emerald-300',
      dean: 'bg-purple-500/20 text-purple-300',
      verification: 'bg-amber-500/20 text-amber-300',
      maintenance: 'bg-red-500/20 text-red-300',
    }
    return colors[role] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col z-50 border-r border-slate-700/50
        transition-all duration-300 ease-in-out w-[260px]
        ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-sm whitespace-nowrap animate-fadeInUp text-slate-100">
              Faculty Tracker
            </span>
          )}
        </Link>
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 text-slate-400 hover:text-slate-200 hover-scale"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 text-slate-400 hover:text-slate-200 hover-scale"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {visibleGroups.map((group) => (
          <div key={group.title} className="animate-fadeInUp">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 px-3 opacity-70">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? 'bg-blue-600/30 text-blue-300 shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-r-full shadow-lg" />
                    )}
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        active ? 'text-blue-300 scale-110' : 'group-hover:scale-110'
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/80 text-white rounded-full animate-pulse-soft">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-0 right-0 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse-soft">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-700/50 p-3 bg-gradient-to-t from-slate-900 to-slate-800/50">
        {/* Roles */}
        {!collapsed && (
          <div className="flex flex-wrap gap-1.5 mb-3 px-1">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-all duration-200 ${getRoleBadgeColor(
                  role
                )}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ))}
          </div>
        )}

        {/* User Info */}
        <div
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-all duration-200 ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>

        {/* Profile dropdown */}
        {profileOpen && !collapsed && (
          <div className="overflow-hidden animate-fadeInUp">
            <div className="pt-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-all duration-200 group">
                <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-all duration-200 group">
                <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
                Notifications
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Collapsed logout */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2.5 mt-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        )}
      </div>
    </aside>
  )
}
