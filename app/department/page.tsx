'use client'

import React from 'react'
import {
  hodStats, facultyMembers, monthlyTrends, categoryBreakdown,
  approvalFunnelData, deptCategoryData,
} from '@/lib/mock-data'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  ComposedBarLineChart, StackedBarChart,
} from '@/components/charts'
import {
  Users, FileText, Award, TrendingUp, Building2,
  Clock, Star, BarChart3, Search,
} from 'lucide-react'
import Link from 'next/link'

export default function DepartmentPage() {
  const cseFaculty = facultyMembers.filter(f => f.department === 'CSE')

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{hodStats.departmentName}</h1>
            <p className="text-sm text-slate-500">Department Overview & Analytics</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Faculty Members', value: hodStats.totalFaculty, sub: `${hodStats.activeFaculty} active`, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Activities', value: hodStats.totalActivities, sub: `+${hodStats.activitiesGrowth}% growth`, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Approvals', value: hodStats.pendingApprovals, sub: 'Need review', icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Avg Points/Faculty', value: hodStats.avgPointsPerFaculty, sub: `Top: ${hodStats.topPerformer}`, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Monthly Trends" subtitle="Activities & approvals" className="lg:col-span-2">
          <TrendAreaChart data={monthlyTrends} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]} />
        </ChartCard>
        <ChartCard title="Activity Categories" subtitle="Distribution by type">
          <DonutChart data={categoryBreakdown.map(c => ({ name: c.category, value: c.count, color: c.color }))} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Approval Pipeline" subtitle="Monthly submission funnel">
          <ComposedBarLineChart data={approvalFunnelData} xKey="month"
            bars={[
              { key: 'submitted', color: '#94a3b8', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]}
            lines={[{ key: 'rejected', color: '#ef4444', name: 'Rejected' }]} />
        </ChartCard>
        <ChartCard title="Category Performance" subtitle="Cross-department comparison">
          <StackedBarChart data={deptCategoryData} xKey="category"
            bars={[
              { key: 'CSE', color: '#3b82f6', name: 'CSE' },
              { key: 'IT', color: '#10b981', name: 'IT' },
              { key: 'ECE', color: '#f59e0b', name: 'ECE' },
            ]} />
        </ChartCard>
      </div>

      {/* Faculty list */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Faculty Members</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cseFaculty.length} members in CSE department</p>
            </div>
            <Link href="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View Leaderboard &rarr;
            </Link>
          </div>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-50">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Designation</div>
          <div className="col-span-2 text-center">Activities</div>
          <div className="col-span-2 text-center">Points</div>
          <div className="col-span-2 text-center">Joined</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {cseFaculty.map((f) => (
            <div key={f.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{f.email}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600 truncate">{f.designation}</p>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {f.activitiesCount}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {f.totalPoints}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-xs text-slate-400">{f.joinedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
