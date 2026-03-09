'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  monthlyTrends,
  approvalFunnelData, leaderboard,
  getPersonalizedHodData,
  facultyKpiData, departmentTargets, deptPerformanceIndex,
} from '@/lib/mock-data'
import {
  cseActivityIndexing, cseTotalWeightage, cseTotalIndex, cseAdditionalIndex,
  cseMonthlyDDPStatus, cseMonthlyActivities,
  cseDDPMonthlyBreakdown, ddpOverallIndexing,
} from '@/lib/ddp-data'
import {
  ChartCard, TrendAreaChart,
  ComposedBarLineChart, StackedBarChart,
} from '@/components/charts'
import {
  Users, Building2, Target, AlertTriangle,
  CheckCircle2, ArrowUpRight, Pencil, Activity,
  ChevronDown, BarChart3, TrendingUp, Trophy, Award, Zap,
} from 'lucide-react'
import Link from 'next/link'
import LeaderboardWidget from '@/components/LeaderboardWidget'

/* ================================================================
   CONSTANTS & HELPERS
   ================================================================ */

const MONO_FONT = { fontFamily: "'JetBrains Mono', monospace" }

const DEPT_OPTIONS = [
  { id: 1, short: 'CSE' },
  { id: 2, short: 'IT' },
  { id: 3, short: 'ECE' },
  { id: 4, short: 'EEE' },
  { id: 5, short: 'MECH' },
  { id: 6, short: 'CIVIL' },
]

const KPI_KEYS = ['research', 'publications', 'teaching', 'events', 'innovation', 'engagement'] as const

const HEATMAP_LEGEND = [
  { label: 'Exceeding (80+)', cls: 'bg-green-500' },
  { label: 'Meeting (60-79)', cls: 'bg-green-300' },
  { label: 'Approaching (40-59)', cls: 'bg-yellow-300' },
  { label: 'Below (20-39)', cls: 'bg-orange-400' },
  { label: 'Critical (<20)', cls: 'bg-red-500' },
]

function heatBg(v: number) {
  if (v >= 80) return { bg: 'rgba(34,197,94,0.85)', text: '#fff' }
  if (v >= 60) return { bg: 'rgba(134,239,172,0.7)', text: '#14532d' }
  if (v >= 40) return { bg: 'rgba(253,224,71,0.7)', text: '#713f12' }
  if (v >= 20) return { bg: 'rgba(251,146,60,0.8)', text: '#fff' }
  if (v > 0) return { bg: 'rgba(239,68,68,0.85)', text: '#fff' }
  return { bg: '#f1f5f9', text: '#94a3b8' }
}

function avgColor(v: number) {
  if (v >= 80) return 'text-green-600'
  if (v >= 60) return 'text-emerald-600'
  if (v >= 40) return 'text-yellow-600'
  if (v >= 20) return 'text-orange-600'
  return 'text-red-600'
}

function indexColor(v: number) {
  if (v >= 0.8) return 'text-emerald-600 bg-emerald-50'
  if (v >= 0.5) return 'text-yellow-700 bg-yellow-50'
  if (v > 0) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

function progressColor(pct: number) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 60) return '#eab308'
  if (pct >= 40) return '#f97316'
  return '#ef4444'
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

/** Section divider with icon, title, subtitle and a horizontal rule */
function SectionDivider({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-2">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="hidden sm:block flex-1 h-px bg-slate-200" />
    </div>
  )
}

/** Big KPI number card */
function KpiCard({ label, value, gradient, borderColor }: {
  label: string
  value: string | number
  gradient: string
  borderColor: string
}) {
  return (
    <div className={`${gradient} border ${borderColor} rounded-xl p-4 sm:p-6 text-center`}>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-4xl font-black" style={MONO_FONT}>{value}</p>
    </div>
  )
}

/** Stat card with left colored border */
function StatCard({ label, value, extra, borderAccent }: {
  label: string
  value: string | number
  extra?: React.ReactNode
  borderAccent: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 border-l-4 ${borderAccent}`}>
      <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1" style={MONO_FONT}>{value}</p>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  )
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function DepartmentPage() {
  const { user } = useAuthStore()
  const { isDean } = useRoles()
  const isDeanUser = isDean()

  const defaultDeptId = user?.departmentId || 1
  const [selectedDeptId, setSelectedDeptId] = useState<number>(defaultDeptId)
  const activeDeptId = isDeanUser ? selectedDeptId : defaultDeptId
  const [showAllActivities, setShowAllActivities] = useState(false)

  /* ---- Derived data ---- */
  const hodData = getPersonalizedHodData(user?.id || 2, user?.name || 'Dr. Rajesh Kumar', activeDeptId)
  const { stats, leaderboard: deptLeaderboard, pendingActivities: deptPending, faculty: deptFaculty } = hodData
  const perf = deptPerformanceIndex

  const deptShort = DEPT_OPTIONS.find(d => d.id === activeDeptId)?.short || 'CSE'
  const ddpRanking = ddpOverallIndexing.find(d => d.shortName === deptShort) || ddpOverallIndexing[1]
  const ddpAchievementPct = Math.round((ddpRanking.achieved / ddpRanking.totalTarget) * 100)

  const activities = cseActivityIndexing
  const criticalActivities = activities.filter(a => a.attained === 0)
  const exceedingActivities = activities.filter(a => a.attained > a.totalTarget)

  const monthlyChartData = cseDDPMonthlyBreakdown.map(m => ({
    month: m.month,
    'Journal SCI': m.journalSCI,
    'Journal Scopus': m.journalScopus,
    Conferences: m.conferences,
    Patents: m.patents,
    Events: Math.round(m.events / 10),
  }))

  const critical = facultyKpiData.filter(f => {
    const avg = KPI_KEYS.reduce((s, k) => s + f[k], 0) / KPI_KEYS.length
    return avg < 45
  })
  const attention = facultyKpiData.filter(f => {
    const avg = KPI_KEYS.reduce((s, k) => s + f[k], 0) / KPI_KEYS.length
    return avg >= 45 && avg < 65
  })
  const topPerformers = facultyKpiData.filter(f => {
    const avg = KPI_KEYS.reduce((s, k) => s + f[k], 0) / KPI_KEYS.length
    return avg >= 85
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">

      {/* ================================================================
         SECTION 1: HEADER
         ================================================================ */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
            {stats.departmentShort}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{stats.departmentName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              DDP Indicator &amp; Department Analytics {isDeanUser ? '\u00b7 Dean View' : `\u00b7 HOD: ${user?.name}`}
            </p>
          </div>
        </div>

        {/* Dean department selector */}
        {isDeanUser && (
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1 gap-0.5 min-w-max">
              {DEPT_OPTIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptId(d.id)}
                  className={`relative px-4 sm:px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedDeptId === d.id
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ================================================================
         SECTION 2: DEPARTMENT PERFORMANCE OVERVIEW
         ================================================================ */}
      <section>
        <SectionDivider icon={BarChart3} title="Department Performance" subtitle="Key metrics and performance index at a glance" />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Dept Performance Index" borderAccent="border-l-indigo-500"
            value={perf.score}
            extra={
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />{perf.trend}%
                </span>
                <span className="text-xs text-slate-400">Rank #{perf.rank} \u00b7 /{perf.maxScore}</span>
              </div>
            }
          />
          <StatCard label="Faculty Count" borderAccent="border-l-blue-500"
            value={perf.facultyCount}
            extra={<p className="text-xs text-slate-400">{perf.activeFaculty}/{perf.facultyCount + 2} Active</p>}
          />
          <StatCard label="Achievements" borderAccent="border-l-emerald-500"
            value={perf.achievements}
            extra={
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />{perf.achievementsGrowth}% YoY
              </span>
            }
          />
          <StatCard label="Pending Approvals" borderAccent="border-l-amber-500"
            value={perf.pendingApprovals}
            extra={
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-red-600 font-medium">{perf.urgentPending} Urgent</span>
              </div>
            }
          />
          <StatCard label="Target Rate" borderAccent="border-l-green-500"
            value={`${perf.targetRate}%`}
            extra={
              <svg width="40" height="40" viewBox="0 0 40 40" className="mt-1">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#10b981" strokeWidth="5"
                  strokeDasharray={`${perf.targetRate * 1.005} ${100.5 - perf.targetRate * 1.005}`}
                  strokeDashoffset="25" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ================================================================
         SECTION 3: DDP INDEX SUMMARY
         ================================================================ */}
      <section>
        <SectionDivider icon={Award} title="DDP Index Summary" subtitle="Weightage, indexing, and college-wide ranking" />

        {/* Index KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Total Weightage" value={cseTotalWeightage}
            gradient="bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700" borderColor="border-violet-200" />
          <KpiCard label="Total Index (weightage)" value={cseTotalIndex.toFixed(3)}
            gradient="bg-gradient-to-br from-green-50 to-emerald-50 text-green-700" borderColor="border-green-200" />
          <KpiCard label="Additional Index (weightage)" value={cseAdditionalIndex.toFixed(4)}
            gradient="bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700" borderColor="border-teal-200" />
        </div>

        {/* DDP Ranking card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-white ${
                ddpRanking.rank <= 3 ? 'bg-yellow-500' : ddpRanking.rank <= 6 ? 'bg-blue-500' : 'bg-slate-500'
              }`}>
                #{ddpRanking.rank}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">DDP Rank</p>
                <p className="text-lg font-bold text-slate-900">{ddpRanking.department}</p>
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Total Target</p>
                <p className="text-xl font-bold text-slate-800 font-mono">{ddpRanking.totalTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Achieved</p>
                <p className="text-xl font-bold text-emerald-600 font-mono">{ddpRanking.achieved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Base Index</p>
                <p className="text-xl font-bold text-blue-600 font-mono">{ddpRanking.baseIndex.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Normalized Bonus</p>
                <p className="text-xl font-bold text-indigo-600 font-mono">{ddpRanking.normalizedBonus.toFixed(3)}</p>
              </div>
            </div>
          </div>
          {/* Achievement progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Overall Achievement</span>
              <span className="text-xs font-bold text-slate-700">{ddpAchievementPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${Math.min(ddpAchievementPct, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 4: DDP ACTIVITY INDEXING
         ================================================================ */}
      <section>
        <SectionDivider icon={Zap} title="Activity Indexing" subtitle="Activity-wise performance indexing with weightage" />

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Total Indexing ({stats.departmentShort})</h3>
            <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {showAllActivities ? 'Show Less' : 'View All'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllActivities ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-violet-700 text-white">
                  {['S.No', 'Activity Name', 'Weightage', 'Total Target', 'Attained', 'Actual Index', 'Permitted Index'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : i === 2 ? 'text-center' : 'text-right'} px-3 py-2.5 font-semibold`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showAllActivities ? activities : activities.slice(0, 12)).map(a => {
                  return (
                    <tr key={a.sNo} className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                      a.attained === 0 ? 'bg-red-50/40' : a.attained >= a.totalTarget ? 'bg-emerald-50/30' : ''
                    }`}>
                      <td className="px-3 py-2.5 text-slate-500">{a.sNo}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[250px]">
                        <span className="truncate block">{a.activityName}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">{a.weightage}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-700">{a.totalTarget}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-bold font-mono ${
                          a.attained === 0 ? 'text-red-500' : a.attained >= a.totalTarget ? 'text-emerald-600' : 'text-slate-800'
                        }`}>{a.attained}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${indexColor(a.actualIndex)}`}>
                          {a.actualIndex.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${indexColor(a.permittedIndex)}`}>
                          {a.permittedIndex.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 5: MONTHLY DDP ATTAINMENT
         ================================================================ */}
      <section>
        <SectionDivider icon={Target} title="Monthly DDP Attainment" subtitle="Monthly progress tracking for planned vs achieved activities" />

        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <KpiCard label="Planned" value={cseMonthlyDDPStatus.planned}
            gradient="bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700" borderColor="border-violet-200" />
          <KpiCard label="Achieved (Planned)" value={cseMonthlyDDPStatus.achievedPlanned}
            gradient="bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700" borderColor="border-emerald-200" />
          <KpiCard label="Pending" value={cseMonthlyDDPStatus.pending}
            gradient="bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700" borderColor="border-rose-200" />
          <KpiCard label="Achieved (Unplanned)" value={cseMonthlyDDPStatus.achievedUnplanned}
            gradient="bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-700" borderColor="border-amber-200" />
        </div>

        {/* Monthly activities table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-emerald-700 text-white">
                  {['S.No', 'Activity Name', 'Planned', 'Achieved (Planned)', 'Pending', 'Achieved (Unplanned)'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : 'text-right'} px-4 py-2.5 font-semibold`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cseMonthlyActivities.map((a, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${a.pending > 0 ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{a.activityName}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{a.planned}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-bold">{a.achievedPlanned}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-500 font-bold">{a.pending}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{a.achievedUnplanned}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-2.5 font-bold text-slate-700">Total</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-slate-700">{cseMonthlyDDPStatus.planned}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-emerald-700">{cseMonthlyDDPStatus.achievedPlanned}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-rose-600">{cseMonthlyDDPStatus.pending}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-slate-500">{cseMonthlyDDPStatus.achievedUnplanned}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 6: DEPARTMENT TARGETS
         ================================================================ */}
      <section>
        <SectionDivider icon={Target} title="Department Targets" subtitle="Progress towards key departmental goals" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentTargets.map(t => {
            const pct = Math.round((t.current / t.target) * 100)
            const displayCurrent = t.unit === 'Rs' ? (t.current / 100000).toFixed(1) + 'L' : t.current
            const displayTarget = t.unit === 'Rs' ? (t.target / 100000).toFixed(0) + 'L' : t.target
            return (
              <div key={t.label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{t.label}</h4>
                  <Pencil className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: progressColor(pct) }} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{displayCurrent} / {displayTarget} {t.unit === 'Rs' ? '' : t.unit}</p>
                  <span className="text-sm font-bold text-slate-800" style={MONO_FONT}>{pct}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Due: {t.dueDate}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ================================================================
         SECTION 7: PERFORMANCE ANALYTICS (charts)
         ================================================================ */}
      <section>
        <SectionDivider icon={TrendingUp} title="Performance Analytics" subtitle="Activity breakdown, approval pipeline, and submission trends" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Monthly Activity Breakdown" subtitle={`${stats.departmentShort} \u2014 Key activities per month`}>
            <StackedBarChart
              data={monthlyChartData}
              xKey="month"
              bars={[
                { key: 'Journal SCI', color: '#3b82f6', name: 'SCI Journals' },
                { key: 'Journal Scopus', color: '#6366f1', name: 'Scopus Journals' },
                { key: 'Conferences', color: '#8b5cf6', name: 'Conferences' },
                { key: 'Patents', color: '#10b981', name: 'Patents' },
                { key: 'Events', color: '#f59e0b', name: 'Events (\u00f710)' },
              ]}
              height={280}
            />
          </ChartCard>
          <ChartCard title="Approval Funnel" subtitle={`${stats.departmentShort} \u2014 Monthly submission pipeline`}>
            <ComposedBarLineChart data={approvalFunnelData} xKey="month"
              bars={[
                { key: 'submitted', color: '#94a3b8', name: 'Submitted' },
                { key: 'approved', color: '#10b981', name: 'Approved' },
              ]}
              lines={[{ key: 'rejected', color: '#ef4444', name: 'Rejected' }]} />
          </ChartCard>
        </div>

        <ChartCard title="Monthly Trends" subtitle={`${stats.departmentShort} \u2014 Activities & approvals over time`}>
          <TrendAreaChart data={monthlyTrends as unknown as Record<string, unknown>[]} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]} />
        </ChartCard>
      </section>

      {/* ================================================================
         SECTION 8: FACULTY PERFORMANCE (KPI Heatmap)
         ================================================================ */}
      <section>
        <SectionDivider icon={Users} title="Faculty Performance" subtitle="Faculty vs KPI heatmap and diagnostic insights" />

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
            {HEATMAP_LEGEND.map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
                <span className="text-slate-600">{l.label}</span>
              </span>
            ))}
          </div>

          {/* Heatmap table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '160px' }} />
                {KPI_KEYS.map(k => <col key={k} style={{ width: '100px' }} />)}
                <col style={{ width: '90px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wide">Faculty</th>
                  {KPI_KEYS.map(k => (
                    <th key={k} className="text-center px-2 py-3 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wide">
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </th>
                  ))}
                  <th className="text-center px-2 py-3 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wide">Avg</th>
                </tr>
              </thead>
              <tbody>
                {facultyKpiData.map((f, idx) => {
                  const avg = Math.round(KPI_KEYS.reduce((s, k) => s + f[k], 0) / KPI_KEYS.length)
                  return (
                    <tr key={f.name}>
                      <td className={`px-4 py-0 border-b border-slate-100 font-medium text-sm text-slate-800 whitespace-nowrap ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                        {f.name}
                      </td>
                      {KPI_KEYS.map(k => {
                        const c = heatBg(f[k])
                        return (
                          <td key={k} className="p-0 border-b border-slate-100">
                            <div className="flex items-center justify-center h-11 text-xs font-bold transition-colors"
                              style={{ backgroundColor: c.bg, color: c.text }}>
                              {f[k]}
                            </div>
                          </td>
                        )
                      })}
                      <td className={`px-2 py-0 border-b border-slate-100 text-center ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                        <span className={`text-sm font-bold ${avgColor(avg)}`} style={MONO_FONT}>{avg}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="text-base font-bold text-red-800">Critical Areas</h4>
              </div>
              {critical.length > 0 ? critical.map(f => {
                const lowest = KPI_KEYS.reduce((min, k) => f[k] < f[min] ? k : min, KPI_KEYS[0])
                return (
                  <p key={f.name} className="text-sm text-red-700 mt-1.5 leading-relaxed">
                    &bull; {f.name} &ndash; {lowest.charAt(0).toUpperCase() + lowest.slice(1)} needs focus
                  </p>
                )
              }) : <p className="text-sm text-red-600">No critical areas</p>}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-bold text-amber-800">Attention Needed</h4>
              </div>
              {attention.length > 0 ? attention.map(f => {
                const lowest = KPI_KEYS.reduce((min, k) => f[k] < f[min] ? k : min, KPI_KEYS[0])
                return (
                  <p key={f.name} className="text-sm text-amber-700 mt-1.5 leading-relaxed">
                    &bull; {f.name} &ndash; {lowest.charAt(0).toUpperCase() + lowest.slice(1)} score declining
                  </p>
                )
              }) : <p className="text-sm text-amber-600">No concerns</p>}
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="text-base font-bold text-green-800">Top Performers</h4>
              </div>
              {topPerformers.length > 0 ? topPerformers.map(f => (
                <p key={f.name} className="text-sm text-green-700 mt-1.5 leading-relaxed">
                  &bull; {f.name} &ndash; Exceeding in all areas
                </p>
              )) : <p className="text-sm text-green-600">Keep pushing!</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 9: LEADERBOARD & FACULTY LIST
         ================================================================ */}
      <section>
        <SectionDivider icon={Trophy} title="Team & Leaderboard" subtitle="Top performers and full faculty roster" />

        <div className="flex items-center justify-end mb-4">
          <Link href="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View Full Leaderboard &rarr;
          </Link>
        </div>

        <LeaderboardWidget
          data={(deptLeaderboard.length > 0 ? deptLeaderboard : leaderboard)}
          title={`${stats.departmentShort} Rankings`}
          showDepartment={false}
        />
      </section>
    </div>
  )
}
