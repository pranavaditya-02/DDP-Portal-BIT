import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type SourceName = 'openAlex' | 'crossref' | 'orcid'

type SourceResult = {
  source: SourceName
  ok: boolean
  status: number | null
  endpoint: string
  data: unknown | null
  error: string | null
}

const DEFAULT_COLLEGE = 'Bannari Amman Institute of Technology'

const trimParam = (value: string | null) => (value || '').trim()

const withSearchParams = (base: string, params: Record<string, string | number | undefined>) => {
  const url = new URL(base)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return
    const stringValue = String(value).trim()
    if (!stringValue) return
    url.searchParams.set(key, stringValue)
  })

  return url.toString()
}

const pickErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') return fallback

  const possible = payload as {
    error?: string
    message?: string
    serviceError?: { statusText?: string }
  }

  if (typeof possible.error === 'string' && possible.error.trim()) return possible.error
  if (typeof possible.message === 'string' && possible.message.trim()) return possible.message

  const statusText = possible.serviceError?.statusText
  if (typeof statusText === 'string' && statusText.trim()) return statusText

  return fallback
}

const maskEndpoint = (endpoint: string) => {
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    return endpoint
  }

  try {
    const url = new URL(endpoint)
    const sensitiveKeys = ['api_key', 'apikey', 'key', 'token', 'access_token']

    sensitiveKeys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, '***')
      }
    })

    return url.toString()
  } catch {
    return endpoint
  }
}

const normalizeForMatch = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const tokenize = (value: string) => normalizeForMatch(value).split(' ').filter((token) => token.length >= 2)

const isNameMatch = (authorNames: string[], inputName: string) => {
  const nameTokens = tokenize(inputName)
  if (nameTokens.length === 0) return true

  const normalizedAuthors = authorNames.map(normalizeForMatch).filter(Boolean)
  if (normalizedAuthors.length === 0) return false

  return normalizedAuthors.some((author) => nameTokens.every((token) => author.includes(token)))
}

const isCollegeMatch = (affiliations: string[], inputCollege: string) => {
  const normalizedCollege = normalizeForMatch(inputCollege)
  if (!normalizedCollege) return true

  const normalizedAffiliations = affiliations.map(normalizeForMatch).filter(Boolean)
  if (normalizedAffiliations.length === 0) return false

  return normalizedAffiliations.some((affiliation) => affiliation.includes(normalizedCollege) || normalizedCollege.includes(affiliation))
}

const filterCrossrefItems = (items: unknown[], inputName: string, inputCollege: string) => {
  return items.filter((item) => {
    const row = item as {
      author?: Array<{
        given?: string
        family?: string
        name?: string
        affiliation?: Array<{ name?: string }>
      }>
    }

    const authors = Array.isArray(row.author) ? row.author : []

    const authorNames = authors
      .map((author) => {
        const fullName = [author.given, author.family].filter(Boolean).join(' ').trim()
        return fullName || (author.name || '').trim()
      })
      .filter(Boolean)

    const affiliations = authors
      .flatMap((author) => (Array.isArray(author.affiliation) ? author.affiliation : []))
      .map((affiliation) => (affiliation.name || '').trim())
      .filter(Boolean)

    const nameMatched = isNameMatch(authorNames, inputName)
    const collegeMatched = isCollegeMatch(affiliations, inputCollege)

    return nameMatched && collegeMatched
  })
}

const fetchJson = async (
  source: SourceName,
  endpoint: string,
  init?: RequestInit,
): Promise<SourceResult> => {
  try {
    const response = await fetch(endpoint, {
      ...init,
      cache: 'no-store',
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      return {
        source,
        ok: false,
        status: response.status,
        endpoint: maskEndpoint(endpoint),
        data,
        error: pickErrorMessage(data, `${source} request failed (${response.status})`),
      }
    }

    return {
      source,
      ok: true,
      status: response.status,
      endpoint: maskEndpoint(endpoint),
      data,
      error: null,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return {
      source,
      ok: false,
      status: null,
      endpoint: maskEndpoint(endpoint),
      data: null,
      error: message,
    }
  }
}

const searchOpenAlex = async ({
  name,
  orcid,
  college,
}: {
  name: string
  orcid: string
  college: string
}): Promise<SourceResult> => {
  const mailto = (process.env.OPENALEX_MAILTO || '').trim()

  if (orcid) {
    const normalizedOrcid = orcid.startsWith('http') ? orcid : `https://orcid.org/${orcid}`
    const endpoint = withSearchParams('https://api.openalex.org/authors', {
      filter: `orcid:${normalizedOrcid}`,
      'per-page': 10,
      mailto: mailto || undefined,
    })
    return fetchJson('openAlex', endpoint, {
      headers: {
        Accept: 'application/json',
      },
    })
  }

  const searchTerm = [name, college].filter(Boolean).join(' ')

  const endpoint = withSearchParams('https://api.openalex.org/authors', {
    search: searchTerm || name,
    'per-page': 10,
    mailto: mailto || undefined,
  })

  return fetchJson('openAlex', endpoint, {
    headers: {
      Accept: 'application/json',
    },
  })
}

const searchCrossref = async ({
  name,
  orcid,
  college,
}: {
  name: string
  orcid: string
  college: string
}): Promise<SourceResult> => {
  if (orcid) {
    const endpoint = withSearchParams('https://api.crossref.org/works', {
      filter: `orcid:${orcid}`,
      rows: 10,
    })
    return fetchJson('crossref', endpoint, {
      headers: {
        Accept: 'application/json',
      },
    })
  }

  const endpoint = withSearchParams('https://api.crossref.org/works', {
    'query.author': name,
    'query.affiliation': college,
    rows: 10,
  })

  const response = await fetchJson('crossref', endpoint, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok || !response.data || typeof response.data !== 'object') {
    return response
  }

  const payload = response.data as {
    message?: {
      items?: unknown[]
    }
  }

  const originalItems = Array.isArray(payload.message?.items) ? payload.message?.items : []
  const filteredItems = filterCrossrefItems(originalItems, name, college)

  return {
    ...response,
    data: {
      ...payload,
      message: {
        ...(payload.message || {}),
        items: filteredItems,
      },
    },
  }
}

const searchOrcid = async ({
  name,
  orcid,
  college,
}: {
  name: string
  orcid: string
  college: string
}): Promise<SourceResult> => {
  const query = orcid
    ? `orcid:${orcid}`
    : `given-and-family-names:${name} AND affiliation-org-name:${college}`

  const endpoint = withSearchParams('https://pub.orcid.org/v3.0/expanded-search/', {
    q: query,
  })

  return fetchJson('orcid', endpoint, {
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const name = trimParam(params.get('name'))
  const orcid = trimParam(params.get('orcid'))
  const includeOrcid =
    trimParam(params.get('includeOrcid')).toLowerCase() === 'true'
    || trimParam(params.get('includeScholar')).toLowerCase() === 'true'
  const college = trimParam(params.get('college')) || DEFAULT_COLLEGE

  if (!name && !orcid) {
    return NextResponse.json(
      {
        error: 'Provide at least one filter: name or orcid',
      },
      { status: 400 },
    )
  }

  const tasks: Promise<SourceResult>[] = [
    searchOpenAlex({ name, orcid, college }),
    searchCrossref({ name, orcid, college }),
  ]

  if (includeOrcid) {
    tasks.push(searchOrcid({ name, orcid, college }))
  }

  const results = await Promise.all(tasks)

  return NextResponse.json({
    college,
    filters: {
      name,
      orcid,
      includeOrcid,
    },
    results,
    generatedAt: new Date().toISOString(),
  })
}
