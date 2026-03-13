import { NextResponse } from 'next/server'
import { computeAchievementData } from '@/lib/csv-loader'

/**
 * GET /api/real-data
 *
 * Reads the 8 approved-activity CSV files from /assets/ and returns all
 * computed stats as JSON.  Cached by Next.js for 1 hour — replace the CSV
 * files and redeploy (or bump `revalidate`) to refresh.
 */
export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  try {
    const data = await computeAchievementData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[real-data API] Failed to compute achievement data:', err)
    return NextResponse.json(
      { error: 'Failed to process CSV files' },
      { status: 500 },
    )
  }
}
