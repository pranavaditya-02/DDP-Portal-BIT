import { create } from 'zustand'
import type { AuthUser } from './auth-session'

export interface AccessResource {
  id: string
  label: string
  icon: string
  href: string
  group: string
}

export interface AuthState {
  user: AuthUser | null
  allowedRoutes: string[]
  allowedResources: AccessResource[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
  setUser: (user: AuthUser | null) => void
  setAllowedRoutes: (routes: string[]) => void
  setAllowedResources: (resources: AccessResource[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
  setHasHydrated: (value: boolean) => void
}

/* ── Sidebar UI store (not persisted) ── */
interface SidebarState {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggleCollapsed: () => void
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  collapsed: false,
  setCollapsed: (v) => set({ collapsed: v }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}))

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  allowedRoutes: [],
  allowedResources: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setAllowedRoutes: (routes) => set({ allowedRoutes: Array.from(new Set(routes)) }),
  setAllowedResources: (resources) => set({
    allowedResources: resources.filter((resource) => resource?.href).map((resource) => ({
      ...resource,
      href: resource.href.replace(/\/+$/, '') || '/',
    })),
  }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      allowedRoutes: [],
      allowedResources: [],
      error: null,
      isLoading: false,
      _hasHydrated: true,
    }),

  hasRole: (role: string) => {
    const { user } = get()
    const normalizedRole = role.toLowerCase()
    return user?.roles.map((item) => item.toLowerCase()).includes(normalizedRole) ?? false
  },

  hasAnyRole: (roles: string[]) => {
    const { user } = get()
    const normalizedRoles = roles.map((role) => role.toLowerCase())
    return user?.roles.map((role) => role.toLowerCase()).some((role) => normalizedRoles.includes(role)) ?? false
  },

  hasAllRoles: (roles: string[]) => {
    const { user } = get()
    const normalizedRoles = roles.map((role) => role.toLowerCase())
    return normalizedRoles.every((role) => user?.roles.map((item) => item.toLowerCase()).includes(role)) ?? false
  },

  setHasHydrated: (value) => set({ _hasHydrated: value }),
}))
