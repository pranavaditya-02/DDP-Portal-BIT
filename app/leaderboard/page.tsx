'use client'

import React, { useState, useMemo } from 'react'
import { leaderboard } from '@/lib/mock-data'
import { Trophy, Search } from 'lucide-react'
import LeaderboardWidget from '@/components/LeaderboardWidget'

const DEPT_FILTER = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as const

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
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

      <LeaderboardWidget
        data={filtered}
        title="Complete Rankings"
        showDepartment={deptFilter === 'All'}
      />
    </div>
  )
}
