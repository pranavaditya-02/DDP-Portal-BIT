'use client'

import { useState, useEffect } from 'react'
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

export function useRealData() {
  const [data, setData] = useState<AchievementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/real-data')
      .then(r => r.json())
      .then((d: AchievementData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
