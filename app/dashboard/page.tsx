'use client'

import React from 'react'
import { useAuthStore } from '@/lib/store'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  MultiLineChart, RadarChartComponent,
} from '@/components/charts'
import {
  recentNotifications,
  getPersonalizedFacultyData,
} from '@/lib/mock-data'
import {
  Award, FileText, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/* Helper: Stat card                                                   */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, icon: Icon, description, trend, color }: {
  label: string; value: string | number; icon: React.ElementType
  description?: string; trend?: number; color: string
}) {
  const isPositive = trend && trend > 0
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {value}
          </p>
          {description && <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{description}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FACULTY DASHBOARD                                                   */
/* ------------------------------------------------------------------ */
function FacultyDashboard() {
  const { user } = useAuthStore()
  const data = getPersonalizedFacultyData(user?.id || 1, user?.name || 'Dr. Priya Sharma')
  const { stats, activities, statusData, weeklyData, goalData, radarData, department, designation } = data
  const recentActs = activities.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal info bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
          {(user?.name || 'U').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Faculty'}</p>
          <p className="text-xs text-slate-500 truncate">{designation} &middot; {department} Department</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 flex-shrink-0">Rank #{stats.rank}</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Activities" value={stats.totalActivities} icon={FileText} description="All time" trend={stats.pointsTrend} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Points" value={stats.totalPoints} icon={Award} description={`Rank #${stats.rank} of ${stats.totalFaculty}`} trend={stats.pointsTrend} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} description="Awaiting verification" color="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} description={`${stats.totalActivities > 0 ? ((stats.approved / stats.totalActivities) * 100).toFixed(0) : 0}% approval rate`} color="bg-green-50 text-green-600" />
      </div>

      {/* Chart row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Weekly Points" subtitle="Last 8 weeks" className="lg:col-span-2">
          <TrendAreaChart data={weeklyData} xKey="week" areas={[{ key: 'points', color: '#3b82f6', name: 'Points' }]} />
        </ChartCard>
        <ChartCard title="Status Breakdown" subtitle="Activity outcomes">
          <DonutChart data={statusData} />
        </ChartCard>
      </div>

      {/* Chart row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Target vs Actual" subtitle="Monthly points goal">
          <MultiLineChart data={goalData} xKey="month"
            lines={[
              { key: 'actual', color: '#3b82f6', name: 'Actual' },
              { key: 'target', color: '#94a3b8', name: 'Target', dashed: true },
            ]} />
        </ChartCard>
        <ChartCard title="Skill Dimensions" subtitle="Activity distribution by area">
          <RadarChartComponent data={radarData} dataKey="value" nameKey="subject" color="#6366f1" />
        </ChartCard>
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Activities</h3>
            <p className="text-xs text-slate-500">Your latest submissions</p>
          </div>
          <Link href="/activities" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View All &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActs.map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{act.type} &middot; {act.date}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  +{act.points}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  act.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                  act.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



/* ------------------------------------------------------------------ */
/* MAIN DASHBOARD PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user } = useAuthStore()

  // Determine greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'



  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your achievements today.
        </p>
      </div>

      {/* Notifications bar */}
      {recentNotifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">{recentNotifications[0].message}</p>
            <p className="text-xs text-blue-500 mt-0.5">{recentNotifications[0].time}</p>
          </div>
        </div>
      )}

      <FacultyDashboard />
    </div>
  )
}
