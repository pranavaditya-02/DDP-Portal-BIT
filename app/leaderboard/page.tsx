'use client'

import React, { useState, useMemo } from 'react'
import { leaderboard, facultyMembers } from '@/lib/mock-data'
import { Trophy, Medal, Search, Filter, Crown, Star, Award, TrendingUp } from 'lucide-react'

const DEPT_FILTER = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as const

function BadgeIcon({ badge }: { badge: string }) {
  if (badge === 'gold') return <Crown className="w-4 h-4 text-yellow-500" />
  if (badge === 'silver') return <Medal className="w-4 h-4 text-slate-400" />
  if (badge === 'bronze') return <Medal className="w-4 h-4 text-orange-400" />
  return null
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-yellow-200">1</div>
  )
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200">2</div>
  )
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-200">3</div>
  )
  return (
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">{rank}</div>
  )
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('All')

  const filtered = useMemo(() => {
    let data = [...leaderboard]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(f => f.name.toLowerCase().includes(q))
    }
    if (deptFilter !== 'All') {
      data = data.filter(f => f.department === deptFilter)
    }
    return data
  }, [search, deptFilter])

  const topThree = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Faculty Leaderboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Top performers ranked by achievement points</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DEPT_FILTER.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                deptFilter === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {topThree.length >= 3 && !search && deptFilter === 'All' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* 2nd place */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sm:mt-8 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg shadow-slate-200">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[1].name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{topThree[1].department}</p>
            <p className="text-2xl font-bold text-slate-800 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {topThree[1].points}
            </p>
            <p className="text-[10px] text-slate-400">{topThree[1].activities} activities</p>
          </div>

          {/* 1st place */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 p-6 text-center hover:shadow-lg transition-all duration-200 relative">
            <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg shadow-yellow-200">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[0].name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{topThree[0].department}</p>
            <p className="text-3xl font-bold text-amber-700 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {topThree[0].points}
            </p>
            <p className="text-[10px] text-slate-400">{topThree[0].activities} activities</p>
          </div>

          {/* 3rd place */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sm:mt-12 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg shadow-orange-200">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[2].name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{topThree[2].department}</p>
            <p className="text-2xl font-bold text-slate-800 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {topThree[2].points}
            </p>
            <p className="text-[10px] text-slate-400">{topThree[2].activities} activities</p>
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Complete Rankings</h3>
        </div>

        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-50 bg-slate-50/50">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Faculty</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2 text-center">Activities</div>
          <div className="col-span-2 text-center">Points</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {filtered.map((f) => (
            <div key={f.rank} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex-shrink-0">
                <RankBadge rank={f.rank} />
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <BadgeIcon badge={f.badge} />
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-400">{f.department}</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{f.activities} activities</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{f.points}</span>
                <p className="text-[10px] text-slate-400">pts</p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No faculty found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
