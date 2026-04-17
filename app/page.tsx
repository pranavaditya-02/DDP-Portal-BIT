import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE_NAME, decodeAuthToken, getPostLoginRoute } from '@/lib/auth-session'
import { pickFirstAccessibleRoute } from '@/lib/route-access'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null
  const user = token ? decodeAuthToken(token) : null

  if (!user) {
    redirect('/login')
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

  try {
    const response = await fetch(`${apiBase}/roles/me/access`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (response.ok) {
      const access = (await response.json()) as { resources?: Array<{ href: string; label: string; group: string }>; routePaths?: string[] }
      const target = pickFirstAccessibleRoute(access)
      if (target) {
        redirect(target)
      }
    }
  } catch {
    // Fall back to role-based route if access endpoint is unreachable.
  }

  redirect(getPostLoginRoute(user.roles))
}
