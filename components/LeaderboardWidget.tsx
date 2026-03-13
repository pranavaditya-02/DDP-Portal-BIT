'use client'

import React from 'react'
import { Crown, Medal, Trophy } from 'lucide-react'

export interface LeaderboardEntry {
  rank: number
  name: string
  department: string
  points: number
  activities?: number
  badge: string
}

interface LeaderboardWidgetProps {
  data: LeaderboardEntry[]
  title?: string
  showDepartment?: boolean
}

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

const MONO = { fontFamily: "'JetBrains Mono', monospace" }

export default function LeaderboardWidget({
  data,
  title = 'Complete Rankings',
  showDepartment = true,
}: LeaderboardWidgetProps) {
  const topThree = data.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Podium – top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 2nd place */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sm:mt-8 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg shadow-slate-200">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[1].name}</h3>
            {showDepartment && <p className="text-xs text-slate-400 mt-0.5">{topThree[1].department}</p>}
            <p className="text-2xl font-bold text-slate-800 mt-2" style={MONO}>
              {topThree[1].points}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">pts</p>
          </div>

          {/* 1st place */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 p-6 text-center hover:shadow-lg transition-all duration-200 relative">
            <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg shadow-yellow-200">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[0].name}</h3>
            {showDepartment && <p className="text-xs text-slate-400 mt-0.5">{topThree[0].department}</p>}
            <p className="text-3xl font-bold text-amber-700 mt-2" style={MONO}>
              {topThree[0].points}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">pts</p>
          </div>

          {/* 3rd place */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sm:mt-12 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg shadow-orange-200">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">{topThree[2].name}</h3>
            {showDepartment && <p className="text-xs text-slate-400 mt-0.5">{topThree[2].department}</p>}
            <p className="text-2xl font-bold text-slate-800 mt-2" style={MONO}>
              {topThree[2].points}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">pts</p>
          </div>
        </div>
      )}

      {/* Rankings table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        </div>

        {/* Header */}
        <div className={`hidden sm:grid ${showDepartment ? 'grid-cols-12' : 'grid-cols-8'} gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-50 bg-slate-50/50`}>
          <div className="col-span-1 text-center">Rank</div>
          <div className={showDepartment ? 'col-span-5' : 'col-span-5'}>Faculty</div>
          {showDepartment && <div className="col-span-4">Department</div>}
          <div className={`${showDepartment ? 'col-span-2' : 'col-span-2'} text-center`}>Points</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {data.map((f) => (
            <div key={f.rank} className={`grid ${showDepartment ? 'grid-cols-12' : 'grid-cols-8'} gap-4 items-center px-5 py-4 hover:bg-slate-50/50 transition-colors`}>
              <div className="col-span-1 flex justify-center">
                <RankBadge rank={f.rank} />
              </div>
              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                    <BadgeIcon badge={f.badge} />
                  </div>                    {f.activities !== undefined && (
                      <p className="text-[10px] text-slate-400">{f.activities} activities</p>
                    )}                </div>
              </div>
              {showDepartment && (
                <div className="col-span-4">
                  <span className="text-sm text-slate-500">{f.department}</span>
                </div>
              )}
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-slate-800" style={MONO}>{f.points}</span>
                <p className="text-[10px] text-slate-400">pts</p>
              </div>
            </div>
          ))}

          {data.length === 0 && (
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
