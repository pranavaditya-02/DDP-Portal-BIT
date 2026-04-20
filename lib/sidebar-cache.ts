import type { AccessResource } from './store'

export const SIDEBAR_ACCESS_CACHE_KEY = 'sidebar-access-cache-v1'

type SidebarAccessCachePayload = {
  routes: string[]
  resources: AccessResource[]
  savedAt: number
}

const normalizeRoute = (value: string) => {
  const route = String(value || '').trim()
  if (!route) return null
  return route.replace(/\/+$/, '') || '/'
}

const normalizeResource = (value: AccessResource): AccessResource | null => {
  if (!value || !value.href) return null
  const href = normalizeRoute(value.href)
  if (!href) return null

  return {
    id: String(value.id || href),
    label: String(value.label || href),
    icon: String(value.icon || 'FileText'),
    href,
    group: String(value.group || 'Other'),
  }
}

export const persistSidebarAccessCache = (routes: string[], resources: AccessResource[]) => {
  if (typeof window === 'undefined') return

  const normalizedRoutes = Array.from(new Set((routes || [])
    .map((route) => normalizeRoute(route))
    .filter((route): route is string => Boolean(route))))

  const normalizedResources = (resources || [])
    .map((resource) => normalizeResource(resource))
    .filter((resource): resource is AccessResource => Boolean(resource))

  const payload: SidebarAccessCachePayload = {
    routes: normalizedRoutes,
    resources: normalizedResources,
    savedAt: Date.now(),
  }

  try {
    window.sessionStorage.setItem(SIDEBAR_ACCESS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore write errors (private mode, storage limits, etc.).
  }
}

export const readSidebarAccessCache = (): { routes: string[]; resources: AccessResource[] } => {
  if (typeof window === 'undefined') return { routes: [], resources: [] }

  try {
    const raw = window.sessionStorage.getItem(SIDEBAR_ACCESS_CACHE_KEY)
    if (!raw) return { routes: [], resources: [] }

    const parsed = JSON.parse(raw) as SidebarAccessCachePayload
    if (!parsed || !Array.isArray(parsed.routes) || !Array.isArray(parsed.resources)) {
      return { routes: [], resources: [] }
    }

    return {
      routes: Array.from(new Set(parsed.routes
        .map((route) => normalizeRoute(route))
        .filter((route): route is string => Boolean(route)))),
      resources: parsed.resources
        .map((resource) => normalizeResource(resource))
        .filter((resource): resource is AccessResource => Boolean(resource)),
    }
  } catch {
    return { routes: [], resources: [] }
  }
}

export const clearSidebarAccessCache = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SIDEBAR_ACCESS_CACHE_KEY)
  } catch {
    // Ignore cleanup failures.
  }
}
