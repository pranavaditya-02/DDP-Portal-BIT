import { NextResponse } from 'next/server'
import { computeAchievementData } from '@/lib/csv-loader'
import type { DateFilter } from '@/lib/csv-loader'

/**
 * GET /api/real-data[?from=YYYY-MM-DD&to=YYYY-MM-DD]
 *
 * Reads the 8 approved-activity CSV files from /assets/ and returns all
 * computed stats as JSON.  When date params are provided the response is
 * always freshly computed (no caching).
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromStr = searchParams.get('from')
    const toStr   = searchParams.get('to')

    const filter: DateFilter = {}
    if (fromStr) {
      // "YYYY-MM-DD" → new Date() parses as UTC midnight — consistent with parseCSVDate
      const d = new Date(fromStr)
      if (!isNaN(d.getTime())) filter.from = d
    }
    if (toStr) {
      const d = new Date(toStr)
      if (!isNaN(d.getTime())) {
        d.setUTCHours(23, 59, 59, 999) // end of day, all in UTC
        filter.to = d
      }
    }

    const data = await computeAchievementData(filter)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[real-data API] Failed to compute achievement data:', err)
    return NextResponse.json(
      { error: 'Failed to process CSV files' },
      { status: 500 },
    )
  }
}
