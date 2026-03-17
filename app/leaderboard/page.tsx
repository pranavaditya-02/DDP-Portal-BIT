'use client'

import React, { useState, useMemo } from 'react'
import { Trophy, Search } from 'lucide-react'
import LeaderboardWidget from '@/components/LeaderboardWidget'
import { useRealData } from '@/hooks/useRealData'

type ScopeFilter = 'overall' | 'department'

export default function LeaderboardPage() {
  const { deptFacultyRankings } = useRealData()
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('overall')
  const [deptFilter, setDeptFilter] = useState<string>('All Departments')

  const allFaculty = useMemo(() => {
    const rows = Object.entries(deptFacultyRankings).flatMap(([dept, entries]) =>
      entries.map(entry => ({
        ...entry,
        department: dept,
      })),
    )

    return rows
      .sort((a, b) => b.points - a.points)
      .map((row, idx) => ({
        ...row,
        rank: idx + 1,
      }))
  }, [deptFacultyRankings])

  const departmentOptions = useMemo(() => {
    return ['All Departments', ...Object.keys(deptFacultyRankings).sort()]
  }, [deptFacultyRankings])

  const filtered = useMemo(() => {
    let data = [...allFaculty]

    if (scopeFilter === 'department' && deptFilter !== 'All Departments') {
      data = data
        .filter(f => f.department === deptFilter)
        .sort((a, b) => b.points - a.points)
        .map((f, idx) => ({ ...f, rank: idx + 1 }))
    }

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(f =>
        f.name.toLowerCase().includes(q)
        || f.facultyId.toLowerCase().includes(q),
      )
    }

    return data
  }, [allFaculty, search, scopeFilter, deptFilter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          Faculty Leaderboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">All faculty ranked by weighted achievement points</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScopeFilter('overall')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              scopeFilter === 'overall'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Overall College
          </button>
          <button
            onClick={() => setScopeFilter('department')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              scopeFilter === 'department'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Department
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by faculty name or faculty ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            disabled={scopeFilter !== 'department'}
            className="input-base sm:w-64 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {departmentOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {scopeFilter === 'department' && deptFilter === 'All Departments' && (
          <div className="text-xs text-slate-500">Select a department to view department-level ranking.</div>
        )}

        {scopeFilter === 'department' && deptFilter !== 'All Departments' && (
          <div className="text-xs text-slate-500">Showing department ranking for {deptFilter}.</div>
        )}
      </div>

      {scopeFilter === 'department' && deptFilter === 'All Departments' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          Choose a department filter to display faculty rankings.
        </div>
      ) : (
        <LeaderboardWidget
          data={filtered}
          title={scopeFilter === 'overall' ? 'Overall College Rankings' : `Department Rankings - ${deptFilter}`}
          showDepartment={scopeFilter === 'overall'}
        />
      )}
    </div>
  )
}
