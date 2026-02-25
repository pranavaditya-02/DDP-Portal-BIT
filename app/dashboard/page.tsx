'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import { RoleGuard } from '@/components/RoleGuard'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  MultiLineChart, RadarChartComponent, ComposedBarLineChart,
  PerformanceScatter, InsightCard, Sparkline,
} from '@/components/charts'
import {
  facultyStats, hodStats, deanStats, verificationStats, adminStats,
  myActivities, pendingActivities, monthlyTrends, categoryBreakdown,
  departmentStats, leaderboard, recentNotifications,
  weeklyPointsData, activityStatusData, pointsGoalData, facultyRadarData,
  approvalFunnelData, dailyReviewData, reviewTimeData, categoryPendingData,
  yearlyComparisonData, collegeActivityTypeData, facultyGrowthData,
  userGrowthData, roleDistributionData, deptActivityVolumeData, loginStatsData,
  getPersonalizedFacultyData, getPersonalizedHodData,
  roles as initialRoles, availableResources,
  type Role, type Resource,
} from '@/lib/mock-data'
import toast from 'react-hot-toast'
import {
  TrendingUp, TrendingDown, Award, FileText, Clock, CheckCircle2,
  XCircle, Users, Building2, GraduationCap, ShieldCheck, Activity,
  BarChart3, Target, AlertTriangle, Star, ArrowUpRight, ArrowDownRight,
  Zap, Eye, Calendar, Bell, Shield, Search, Plus, Edit3, Trash2, X, Check,
  ChevronDown, ChevronRight, Copy, CheckSquare, Square, MinusSquare, Info,
  Clipboard, Trophy, Settings, LayoutDashboard,
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
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {value}
          </p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
          {(user?.name || 'U').charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user?.name || 'Faculty'}</p>
          <p className="text-xs text-slate-500">{designation} &middot; {department} Department</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">Rank #{stats.rank}</span>
        </div>
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
/* HOD DASHBOARD                                                       */
/* ------------------------------------------------------------------ */
function HodDashboard() {
  const { user } = useAuthStore()
  const hodData = getPersonalizedHodData(user?.id || 2, user?.name || 'Dr. Rajesh Kumar', user?.departmentId)
  const { stats, leaderboard: deptLeaderboard, categoryBreakdown: deptCategories, pendingActivities: deptPending } = hodData

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Department info bar */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
          {stats.departmentShort}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{stats.departmentName}</p>
          <p className="text-xs text-slate-500">Head of Department &middot; {user?.name || 'HOD'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Faculty" value={stats.totalFaculty} icon={Users} description={`${stats.activeFaculty} active`} color="bg-blue-50 text-blue-600" />
        <StatCard label="Activities" value={stats.totalActivities} icon={FileText} description={stats.departmentName} trend={stats.activitiesGrowth} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} description="Need review" color="bg-amber-50 text-amber-600" />
        <StatCard label="Avg Points" value={stats.avgPointsPerFaculty} icon={BarChart3} description={`Top: ${stats.topPerformer}`} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Approval Funnel" subtitle={`${stats.departmentShort} – Monthly submission pipeline`} className="lg:col-span-2">
          <ComposedBarLineChart data={approvalFunnelData} xKey="month"
            bars={[
              { key: 'submitted', color: '#94a3b8', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]}
            lines={[{ key: 'rejected', color: '#ef4444', name: 'Rejected' }]} />
        </ChartCard>
        <ChartCard title="Category Breakdown" subtitle={`${stats.departmentShort} activity categories`}>
          <DonutChart data={deptCategories.length > 0 ? deptCategories : categoryBreakdown.map(c => ({ name: c.category, value: c.count, color: c.color }))} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Trends" subtitle={`${stats.departmentShort} – Activities & approvals over time`}>
          <TrendAreaChart data={monthlyTrends as unknown as Record<string, unknown>[]} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Activities' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]} />
        </ChartCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Top Performers</h3>
              <p className="text-xs text-slate-500">{stats.departmentName}</p>
            </div>
            <Link href="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {(deptLeaderboard.length > 0 ? deptLeaderboard : leaderboard).slice(0, 5).map((f) => (
              <div key={f.rank} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  f.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  f.rank === 2 ? 'bg-slate-100 text-slate-600' :
                  f.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                }`}>{f.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400">{f.department} &middot; {f.activities} activities</p>
                </div>
                <span className="text-sm font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{f.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending queue for this department */}
      {deptPending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Pending Approvals</h3>
              <p className="text-xs text-slate-500">{deptPending.length} submissions from {stats.departmentShort} faculty</p>
            </div>
            <Link href="/verification" className="text-xs font-medium text-blue-600 hover:text-blue-700">Review All &rarr;</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {deptPending.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.facultyName} &middot; {act.type} &middot; {act.date}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 ml-4">
                  +{act.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* DEAN DASHBOARD                                                      */
/* ------------------------------------------------------------------ */
function DeanDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Departments" value={deanStats.totalDepartments} icon={Building2} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Faculty" value={deanStats.totalFaculty} icon={Users} description="Across all departments" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Activities" value={deanStats.totalActivities} icon={Activity} description={`${deanStats.totalPending} pending`} color="bg-purple-50 text-purple-600" />
        <StatCard label="Research Output" value={deanStats.researchOutput} icon={GraduationCap} description={`${deanStats.patentsFiled} patents filed`} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Department cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Department Overview</h3>
            <p className="text-xs text-slate-500">Performance summary</p>
          </div>
          <Link href="/college" className="text-xs font-medium text-blue-600 hover:text-blue-700">View Full Dashboard &rarr;</Link>
        </div>
        <div className="space-y-3">
          {departmentStats.map((d) => (
            <div key={d.shortName} className="flex items-center gap-3 py-2">
              <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{d.shortName}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{d.name}</p>
                <p className="text-[11px] text-slate-400">{d.facultyCount} faculty &middot; {d.totalActivities} activities</p>
              </div>
              <span className="text-sm font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.avgPoints}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt to college page */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-purple-900 text-sm">DDP Indicator Dashboard</h3>
          <p className="text-xs text-purple-600 mt-0.5">View complete institutional analytics, heatmaps, scorecards &amp; DDP tracking</p>
        </div>
        <Link href="/college" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          Open College Dashboard &rarr;
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VERIFICATION DASHBOARD                                              */
/* ------------------------------------------------------------------ */
function VerificationDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={verificationStats.pendingReview} icon={Clock} description="Needs action" color="bg-amber-50 text-amber-600" />
        <StatCard label="Reviewed Today" value={verificationStats.reviewedToday} icon={Eye} description="Completed today" color="bg-blue-50 text-blue-600" />
        <StatCard label="This Week" value={verificationStats.reviewedThisWeek} icon={Calendar} description="18 reviewed" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Approval Rate" value={`${verificationStats.approvalRate}%`} icon={CheckCircle2} description={`${verificationStats.rejectionRate}% rejected`} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Daily Review Volume" subtitle="This week" className="lg:col-span-2">
          <ComparisonBarChart data={dailyReviewData} xKey="day"
            bars={[
              { key: 'approved', color: '#10b981', name: 'Approved' },
              { key: 'rejected', color: '#ef4444', name: 'Rejected' },
            ]} />
        </ChartCard>
        <ChartCard title="Pending by Category" subtitle="Awaiting review">
          <DonutChart data={categoryPendingData.filter(c => c.pending > 0).map(c => ({ name: c.category, value: c.pending, color: c.color }))} innerRadius={45} outerRadius={70} />
        </ChartCard>
      </div>

      <ChartCard title="Review Time Distribution" subtitle="Hours to review completion">
        <ComparisonBarChart data={reviewTimeData} xKey="range"
          bars={[{ key: 'count', color: '#6366f1', name: 'Reviews' }]} height={200} />
      </ChartCard>

      {/* Pending queue preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Pending Queue</h3>
            <p className="text-xs text-slate-500">{pendingActivities.length} items awaiting review</p>
          </div>
          <Link href="/verification" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            Open Queue &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingActivities.slice(0, 4).map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{act.facultyName} &middot; {act.department} &middot; {act.date}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 ml-4">
                +{act.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ROLES MANAGEMENT HELPERS                                            */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Award, Clipboard, Building2,
  Trophy, GraduationCap, ShieldCheck, Users, Shield, Settings,
}

function groupResources(resources: Resource[]) {
  const groups: Record<string, Resource[]> = {}
  resources.forEach(r => {
    if (!groups[r.group]) groups[r.group] = []
    groups[r.group].push(r)
  })
  return groups
}

const groupIcons: Record<string, React.ElementType> = {
  Overview: LayoutDashboard, Faculty: FileText, Department: Building2,
  College: GraduationCap, Management: Shield,
}
const groupColors: Record<string, string> = {
  Overview: 'text-blue-600 bg-blue-50', Faculty: 'text-emerald-600 bg-emerald-50',
  Department: 'text-purple-600 bg-purple-50', College: 'text-amber-600 bg-amber-50',
  Management: 'text-red-600 bg-red-50',
}

/* ====== Resource Tree Component ====== */
function ResourceTree({ selected, onToggle }: { selected: Set<string>; onToggle: (id: string) => void }) {
  const grouped = groupResources(availableResources)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(grouped).map(g => [g, true]))
  )
  const toggleGroup = (group: string) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }))
  const toggleAllInGroup = (group: string) => {
    const items = grouped[group]
    const allSelected = items.every(r => selected.has(r.id))
    items.forEach(r => {
      if (allSelected && selected.has(r.id)) onToggle(r.id)
      if (!allSelected && !selected.has(r.id)) onToggle(r.id)
    })
  }
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assign Resources</span>
        <span className="text-[11px] text-slate-400">Selected: {selected.size} of {availableResources.length}</span>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {Object.entries(grouped).map(([group, resources]) => {
          const selectedInGroup = resources.filter(r => selected.has(r.id)).length
          const allSelected = selectedInGroup === resources.length
          const someSelected = selectedInGroup > 0 && !allSelected
          const GroupIcon = groupIcons[group] || Shield
          const isExpanded = expanded[group]
          const color = groupColors[group] || 'text-slate-600 bg-slate-50'
          return (
            <div key={group} className="border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 cursor-pointer select-none" onClick={() => toggleGroup(group)}>
                <button onClick={(e) => { e.stopPropagation(); toggleAllInGroup(group) }} className="text-slate-400 hover:text-blue-600 transition-colors">
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : someSelected ? <MinusSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                </button>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <div className={`w-5 h-5 rounded flex items-center justify-center ${color}`}><GroupIcon className="w-3 h-3" /></div>
                <span className="text-xs font-semibold text-slate-700 flex-1">{group}</span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedInGroup}/{resources.length}</span>
              </div>
              {isExpanded && (
                <div className="pb-1">
                  {resources.map(r => {
                    const Icon = iconMap[r.icon] || FileText
                    const isSelected = selected.has(r.id)
                    return (
                      <label key={r.id} className={`flex items-center gap-2.5 px-3 py-2 ml-6 mr-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => onToggle(r.id)} className="sr-only" />
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className={`text-xs ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{r.label}</span>
                        <span className="text-[10px] text-slate-300 ml-auto font-mono">{r.href}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ====== Add/Edit Role Modal ====== */
function RoleModal({ role, onClose, onSave }: {
  role: Role | null
  onClose: () => void
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'usersCount'> & { id?: number }) => void
}) {
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set(role?.resources || []))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const handleToggle = (id: string) => {
    setSelectedResources(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Role name is required'
    if (selectedResources.size === 0) errs.resources = 'Select at least one resource'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  const handleSubmit = () => {
    if (!validate()) return
    onSave({ id: role?.id, name: name.trim(), description: description.trim(), passwordPrefix: role?.passwordPrefix || '', editAccess: role?.editAccess ?? true, deleteAccess: role?.deleteAccess ?? false, status: role?.status ?? true, resources: Array.from(selectedResources), isSystem: role?.isSystem || false })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{role ? 'Edit Role' : 'Add New Role'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{role ? `Editing "${role.name}" role configuration` : 'Create a new role and assign resources'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }} placeholder="Enter role name" className={`input-base ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this role" className="input-base" />
          </div>
          <div>
            {errors.resources && <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> {errors.resources}</p>}
            <ResourceTree selected={selectedResources} onToggle={handleToggle} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary"><Check className="w-4 h-4" />{role ? 'Save Changes' : 'Add Role'}</button>
        </div>
      </div>
    </div>
  )
}

/* ====== Delete Confirmation Modal ====== */
function DeleteConfirm({ role, onClose, onConfirm }: { role: Role; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><Trash2 className="w-5 h-5 text-red-600" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Role</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-1">Are you sure you want to delete the <span className="font-bold">&quot;{role.name}&quot;</span> role?</p>
        {role.usersCount > 0 && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700"><span className="font-bold">{role.usersCount} users</span> are currently assigned this role. They&apos;ll lose these permissions.</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Delete Role</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ADMIN DASHBOARD                                                     */
/* ------------------------------------------------------------------ */
function AdminDashboard() {
  const [rolesList, setRolesList] = useState<Role[]>(initialRoles)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (!search) return rolesList
    const q = search.toLowerCase()
    return rolesList.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
  }, [rolesList, search])

  const handleSave = (data: Omit<Role, 'id' | 'createdAt' | 'usersCount'> & { id?: number }) => {
    if (data.id) {
      setRolesList(prev => prev.map(r => r.id === data.id ? { ...r, name: data.name, description: data.description, passwordPrefix: data.passwordPrefix, editAccess: data.editAccess, deleteAccess: data.deleteAccess, status: data.status, resources: data.resources } : r))
      toast.success(`Role "${data.name}" updated successfully`)
    } else {
      const newId = Math.max(...rolesList.map(r => r.id)) + 1
      setRolesList(prev => [...prev, { id: newId, name: data.name, description: data.description, passwordPrefix: data.passwordPrefix, editAccess: data.editAccess, deleteAccess: data.deleteAccess, status: data.status, resources: data.resources, isSystem: false, createdAt: new Date().toISOString().split('T')[0], usersCount: 0 }])
      toast.success(`Role "${data.name}" created successfully`)
    }
    setShowAddModal(false)
    setEditingRole(null)
  }

  const handleDelete = () => {
    if (!deletingRole) return
    setRolesList(prev => prev.filter(r => r.id !== deletingRole.id))
    toast.success(`Role "${deletingRole.name}" deleted`)
    setDeletingRole(null)
  }

  const handleDuplicate = (role: Role) => {
    const newId = Math.max(...rolesList.map(r => r.id)) + 1
    setRolesList(prev => [...prev, { ...role, id: newId, name: `${role.name} (Copy)`, isSystem: false, createdAt: new Date().toISOString().split('T')[0], usersCount: 0 }])
    toast.success(`Role duplicated as "${role.name} (Copy)"`)
  }

  const totalUsers = rolesList.reduce((s, r) => s + r.usersCount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={adminStats.totalUsers} icon={Users} description={`${adminStats.activeUsers} active`} color="bg-blue-50 text-blue-600" />
        <StatCard label="New This Month" value={adminStats.newUsersThisMonth} icon={Zap} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="System Uptime" value={adminStats.systemUptime} icon={Activity} description="Last 30 days" color="bg-green-50 text-green-600" />
        <StatCard label="Storage" value={adminStats.storageUsed} icon={BarChart3} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="User Growth" subtitle="Total vs Active users" className="lg:col-span-2">
          <TrendAreaChart data={userGrowthData} xKey="month"
            areas={[
              { key: 'users', color: '#3b82f6', name: 'Total' },
              { key: 'active', color: '#10b981', name: 'Active' },
            ]} />
        </ChartCard>
        <ChartCard title="Role Distribution" subtitle="Users by role">
          <DonutChart data={roleDistributionData.map(r => ({ name: r.role, value: r.count, color: r.color }))} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Dept Activity Volume" subtitle="Activities & points by dept">
          <ComparisonBarChart data={deptActivityVolumeData} xKey="dept"
            bars={[
              { key: 'activities', color: '#6366f1', name: 'Activities' },
            ]} />
        </ChartCard>
        <ChartCard title="Login Statistics" subtitle="Monthly logins vs unique users">
          <ComposedBarLineChart data={loginStatsData} xKey="month"
            bars={[{ key: 'logins', color: '#94a3b8', name: 'Total Logins' }]}
            lines={[{ key: 'unique', color: '#3b82f6', name: 'Unique Users' }]} />
        </ChartCard>
      </div>

      {/* ---- Roles Management Section ---- */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Manage Roles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Create and manage user roles with specific resource access</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary w-fit">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Roles', value: rolesList.length, color: 'text-blue-600' },
            { label: 'System Roles', value: rolesList.filter(r => r.isSystem).length, color: 'text-emerald-600' },
            { label: 'Custom Roles', value: rolesList.filter(r => !r.isSystem).length, color: 'text-purple-600' },
            { label: 'Users Assigned', value: totalUsers, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">S.No</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Role Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Resources</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Users</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400"><Shield className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No roles found</p></td></tr>
                ) : (
                  filtered.map((role, idx) => (
                    <React.Fragment key={role.id}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-sm text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              role.name === 'Faculty' ? 'bg-blue-50 text-blue-600' :
                              role.name === 'HOD' ? 'bg-emerald-50 text-emerald-600' :
                              role.name === 'Dean' ? 'bg-purple-50 text-purple-600' :
                              role.name === 'Verification' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>{role.name.charAt(0)}</div>
                            <span className="text-sm font-medium text-slate-800">{role.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500 max-w-[240px] truncate">{role.description}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => setExpandedRow(expandedRow === role.id ? null : role.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            {role.resources.length} pages
                            {expandedRow === role.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center"><span className="text-sm text-slate-600">{role.usersCount}</span></td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${role.isSystem ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            {role.isSystem ? 'System' : 'Custom'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setEditingRole(role)} title="Edit role" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDuplicate(role)} title="Duplicate role" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => !role.isSystem && setDeletingRole(role)} title={role.isSystem ? 'System roles cannot be deleted' : 'Delete role'} disabled={role.isSystem} className={`p-2 rounded-lg transition-colors ${role.isSystem ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === role.id && (
                        <tr><td colSpan={7} className="px-5 py-3 bg-slate-50/80">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned Resources ({role.resources.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {role.resources.map(resId => {
                              const res = availableResources.find(r => r.id === resId)
                              if (!res) return null
                              const Icon = iconMap[res.icon] || FileText
                              return (
                                <span key={resId} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                                  <Icon className="w-3 h-3 text-slate-400" />{res.label}
                                  <span className="text-[10px] text-slate-300 font-mono">{res.href}</span>
                                </span>
                              )
                            })}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {filtered.length} of {rolesList.length} roles</p>
            <p className="text-[10px] text-slate-400">System roles cannot be deleted but can be edited</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || editingRole) && (
        <RoleModal role={editingRole} onClose={() => { setShowAddModal(false); setEditingRole(null) }} onSave={handleSave} />
      )}
      {deletingRole && (
        <DeleteConfirm role={deletingRole} onClose={() => setDeletingRole(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MAIN DASHBOARD PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles()

  // Determine greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Pick primary role for the dashboard view
  // HOD sees their personal faculty dashboard here; department data is on /department
  const primaryRole = isMaintenance() ? 'admin'
    : isDean() ? 'dean'
    : isVerification() ? 'verification'
    : 'faculty'

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your {primaryRole === 'admin' ? 'system' : primaryRole === 'dean' ? 'college' : primaryRole === 'verification' ? 'review queue' : 'achievements'} today.
        </p>
      </div>

      {/* Notifications bar */}
      {recentNotifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">{recentNotifications[0].message}</p>
            <p className="text-xs text-blue-500 mt-0.5">{recentNotifications[0].time}</p>
          </div>
        </div>
      )}

      {/* Role-specific dashboards — HOD & Faculty both see the personal faculty view */}
      {primaryRole === 'faculty' && <FacultyDashboard />}
      {primaryRole === 'dean' && <DeanDashboard />}
      {primaryRole === 'verification' && <VerificationDashboard />}
      {primaryRole === 'admin' && <AdminDashboard />}
    </div>
  )
}
