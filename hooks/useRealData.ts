'use client'

import { useState, useEffect, useMemo } from 'react'
import type { AchievementData, LeaderboardEntry } from '@/lib/csv-loader'
import {
  realCollegeStats,
  realDeptRankings,
  realDeptByActivity,
  realDeptMap,
  realDeptFacultyRankings,
  realActivityBreakdown,
  realLeaderboard,
} from '@/lib/real-data'

// Convert realLeaderboard 'none' badge to '' to match LeaderboardEntry type
const fallbackLeaderboard: LeaderboardEntry[] = realLeaderboard.map(e => ({
  ...e,
  badge: e.badge === 'none' ? '' : e.badge,
}))

export interface RealDataOptions {
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string   // YYYY-MM-DD
}

export function useRealData(opts?: RealDataOptions) {
  const [data, setData] = useState<AchievementData | null>(null)
  const [loading, setLoading] = useState(true)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (opts?.dateFrom) params.set('from', opts.dateFrom)
    if (opts?.dateTo)   params.set('to',   opts.dateTo)
    const qs = params.toString()
    return `/api/real-data${qs ? `?${qs}` : ''}`
  }, [opts?.dateFrom, opts?.dateTo])

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(url)
      .then(r => r.json())
      .then((d: AchievementData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [url])

  return {
    loading,
    collegeStats: data?.collegeStats ?? realCollegeStats,
    deptStats: data?.deptStats ?? [],
    deptRankings: data?.deptRankings ?? realDeptRankings,
    deptByActivity: data?.deptByActivity ?? realDeptByActivity,
    deptMap: data?.deptMap ?? realDeptMap,
    deptFacultyRankings: data?.deptFacultyRankings ?? realDeptFacultyRankings,
    activityBreakdown: data?.activityBreakdown ?? realActivityBreakdown,
    leaderboard: data?.leaderboard ?? fallbackLeaderboard,
  }
}
