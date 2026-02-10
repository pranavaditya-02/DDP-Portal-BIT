'use client'

import React from 'react'
import {
  deanStats, departmentStats, monthlyTrends,
  yearlyComparisonData, collegeActivityTypeData, facultyGrowthData,
  deptActivityVolumeData,
} from '@/lib/mock-data'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  MultiLineChart, ComposedBarLineChart,
} from '@/components/charts'
import {
  GraduationCap, Building2, Users, Activity, Award,
  TrendingUp, FileText, BarChart3, ArrowUpRight,
} from 'lucide-react'

export default function CollegePage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">College Overview</h1>
            <p className="text-sm text-slate-500">Bannari Amman Institute of Technology — Dean Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Departments', value: deanStats.totalDepartments, icon: Building2, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Faculty', value: deanStats.totalFaculty, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total Activities', value: deanStats.totalActivities, sub: `${deanStats.totalPending} pending`, icon: Activity, color: 'bg-purple-50 text-purple-600' },
          { label: 'Research Papers', value: deanStats.researchOutput, sub: `${deanStats.patentsFiled} patents`, icon: FileText, color: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                {'sub' in s && s.sub && <p className="text-xs text-slate-400 mt-1">{s.sub}</p>}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Year-over-Year Comparison" subtitle="Points by month" className="lg:col-span-2">
          <MultiLineChart data={yearlyComparisonData} xKey="month"
            lines={[
              { key: 'thisYear', color: '#3b82f6', name: '2025-26' },
              { key: 'lastYear', color: '#94a3b8', name: '2024-25', dashed: true },
            ]} />
        </ChartCard>
        <ChartCard title="Activity Types" subtitle="Across all departments">
          <DonutChart data={collegeActivityTypeData.slice(0, 5).map(t => ({ name: t.type, value: t.count, color: t.color }))} innerRadius={50} outerRadius={75} showLabel={false} />
          <div className="mt-3 space-y-1.5">
            {collegeActivityTypeData.slice(0, 6).map(t => (
              <div key={t.type} className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <span className="truncate flex-1">{t.type}</span>
                <span className="font-semibold">{t.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Faculty Growth" subtitle="Active faculty & new joiners by semester">
          <ComposedBarLineChart data={facultyGrowthData} xKey="semester"
            bars={[{ key: 'new', color: '#6366f1', name: 'New Joiners' }]}
            lines={[{ key: 'active', color: '#10b981', name: 'Active Faculty' }]} />
        </ChartCard>
        <ChartCard title="Department Activity Volume" subtitle="Total activities by department">
          <ComparisonBarChart data={deptActivityVolumeData} xKey="dept"
            bars={[{ key: 'activities', color: '#3b82f6', name: 'Activities' }]} />
        </ChartCard>
      </div>

      {/* Department cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Department Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map((dept) => {
            const maxActivities = Math.max(...departmentStats.map(d => d.totalActivities))
            const pct = ((dept.totalActivities / maxActivities) * 100).toFixed(0)
            return (
              <div key={dept.shortName} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {dept.shortName}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{dept.shortName}</p>
                      <p className="text-[10px] text-slate-400">{dept.name}</p>
                    </div>
                  </div>
                  {dept.pendingApprovals > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                      {dept.pendingApprovals} pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Faculty</p>
                    <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dept.facultyCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Activities</p>
                    <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dept.totalActivities}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Avg Pts</p>
                    <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dept.avgPoints}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Top: <span className="font-medium text-slate-600">{dept.topPerformer}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly trends */}
      <ChartCard title="Monthly Activity Trends" subtitle="Submissions, approvals, and pending across college">
        <TrendAreaChart data={monthlyTrends} xKey="month"
          areas={[
            { key: 'activities', color: '#3b82f6', name: 'Submitted' },
            { key: 'approved', color: '#10b981', name: 'Approved' },
            { key: 'pending', color: '#f59e0b', name: 'Pending' },
          ]}
          height={280} />
      </ChartCard>
    </div>
  )
}
