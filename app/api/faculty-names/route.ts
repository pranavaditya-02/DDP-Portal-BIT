import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const backendBaseURL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api'

type BackendMetadataPayload = {
  faculties?: Array<{
    id?: string | number
    name?: string
    department?: string
  }>
}

const stripSalutation = (value: string) => {
  return value
    .replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?|miss|rev\.?|fr\.?)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const ensureApiBaseURL = (baseURL: string) => {
  const parsed = new URL(baseURL)
  let pathname = parsed.pathname.replace(/\/+$/, '')

  if (!pathname.endsWith('/api')) {
    pathname = `${pathname}/api`.replace(/\/+/g, '/')
  }

  parsed.pathname = `${pathname}/`
  return parsed.toString()
}

export async function GET(request: NextRequest) {
  try {
    const backendURL = new URL('users/metadata', ensureApiBaseURL(backendBaseURL))

    const headers: HeadersInit = {
      Accept: 'application/json',
    }

    const authorization = request.headers.get('authorization')
    const cookie = request.headers.get('cookie')

    if (authorization) {
      headers.authorization = authorization
    }

    if (cookie) {
      headers.cookie = cookie
    }

    const response = await fetch(backendURL, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    const payload = (await response.json().catch(() => null)) as BackendMetadataPayload | null

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error?: string }).error || 'Failed to load faculty names')
          : 'Failed to load faculty names'

      return NextResponse.json({ error: message }, { status: response.status })
    }

    const names = Array.from(
      new Set(
        (payload?.faculties || [])
          .map((faculty) => stripSalutation((faculty.name || '').trim()))
          .filter((name) => name.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ names })
  } catch (error) {
    console.error('[faculty-names API] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to load faculty names' },
      { status: 502 },
    )
  }
}
