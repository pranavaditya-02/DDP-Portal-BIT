'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  apiClient,
  getApiErrorMessage,
  type AdminFacultyComplianceRecord,
  type AdminTaskComplianceRecord,
} from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'
import { CheckCircle2, Clock3, Gauge, RefreshCcw, ShieldAlert, Target } from 'lucide-react'

type TabKey = 'pending' | 'completed'
type TaskStatusFilter = 'all' | 'upcoming' | 'near-deadline' | 'overdue'

type FacultyComplianceRow = {
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  completedTasks: number
  pendingTasks: number
  completionRate: number
  completedTaskIds: Set<string>
}

type TaskAggregateRow = {
  key: string
  task: string
  workflow: string
  type: 'paper' | 'patent' | 'proposal'
  targetIndex: number
  deadlineISO: string
  completionRate: number
  completedFaculty: number
  pendingFaculty: number
  statusLabel: 'Upcoming' | 'Near deadline' | 'Overdue'
  statusClass: string
}

type RawComplianceSnapshot = {
  rows?: AdminFacultyComplianceRecord[]
  tasks?: AdminTaskComplianceRecord[]
  pagination?: { total?: number }
}

type SnapshotFilters = {
  search: string
  department: string
  designation: string
}

type PersistedComplianceSnapshot = {
  snapshot: RawComplianceSnapshot
  lastServerUpdate: number
  filters: SnapshotFilters
  savedAt: number
}

const DEFAULT_ACADEMIC_YEAR = '2026-27'
const COMPLIANCE_CACHE_MAX_AGE_MS = 10 * 60 * 1000

const getDeadlineStatus = (deadlineISO: string) => {
  if (!deadlineISO) {
    return {
      key: 'upcoming' as const,
      label: 'Upcoming' as const,
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    }
  }

  const now = new Date()
  const deadline = new Date(deadlineISO)
  const msInDay = 1000 * 60 * 60 * 24
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / msInDay)

  if (diffDays < 0) {
    return {
      key: 'overdue' as const,
      label: 'Overdue' as const,
      className: 'border-red-200 bg-red-50 text-red-700',
    }
  }

  if (diffDays <= 14) {
    return {
      key: 'near-deadline' as const,
      label: 'Near deadline' as const,
      className: 'border-orange-200 bg-orange-50 text-orange-700',
    }
  }

  return {
    key: 'upcoming' as const,
    label: 'Upcoming' as const,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  }
}

const formatDate = (value: string) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not set'
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const transformSnapshot = (response: RawComplianceSnapshot) => {
  const nextFacultyRows: FacultyComplianceRow[] = (response.rows || []).map((row: AdminFacultyComplianceRecord) => ({
    facultyId: row.facultyId,
    name: row.name,
    email: row.email,
    department: row.department,
    designation: row.designation,
    completedTasks: row.completedTasks,
    pendingTasks: row.pendingTasks,
    completionRate: row.completionRate,
    completedTaskIds: new Set(row.completedTaskIds || []),
  }))

  const nextTaskRows: TaskAggregateRow[] = (response.tasks || []).map((task: AdminTaskComplianceRecord) => {
    const status = getDeadlineStatus(task.deadlineISO)
    return {
      ...task,
      statusClass: status.className,
    }
  })

  return {
    facultyRows: nextFacultyRows,
    taskRows: nextTaskRows,
    total: Number(response.pagination?.total || 0),
  }
}

export default function DeanTaskCompliancePage() {
  const { isDean, isAdmin } = useRoles()

  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [academicYear, setAcademicYear] = useState<string>(DEFAULT_ACADEMIC_YEAR)
  const [facultySearchInput, setFacultySearchInput] = useState('')
  const [facultySearch, setFacultySearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<TaskStatusFilter>('all')
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all')

  const [facultyRows, setFacultyRows] = useState<FacultyComplianceRow[]>([])
  const [taskRows, setTaskRows] = useState<TaskAggregateRow[]>([])
  const [totalFacultyCount, setTotalFacultyCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const cacheRef = useRef<{
    snapshot: RawComplianceSnapshot | null
    lastServerUpdate: number
    filters: SnapshotFilters | null
  }>({
    snapshot: null,
    lastServerUpdate: 0,
    filters: null,
  })
  const isLoadInFlightRef = useRef(false)
  const complianceCacheKey = useMemo(() => `task-compliance-snapshot:${academicYear}`, [academicYear])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFacultySearch(facultySearchInput.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [facultySearchInput])

  useEffect(() => {
    const loadActiveYear = async () => {
      try {
        const config = await apiClient.getActiveWorkflowAcademicYear()
        setAcademicYear(config?.academicYear || DEFAULT_ACADEMIC_YEAR)
      } catch {
        setAcademicYear(DEFAULT_ACADEMIC_YEAR)
      }
    }

    void loadActiveYear()
  }, [])

  const applySnapshotToState = useCallback((snapshot: RawComplianceSnapshot) => {
    const transformed = transformSnapshot(snapshot)
    setFacultyRows(transformed.facultyRows)
    setTaskRows(transformed.taskRows)
    setTotalFacultyCount(transformed.total)
  }, [])

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(complianceCacheKey)
      if (!raw) return

      const parsed = JSON.parse(raw) as PersistedComplianceSnapshot
      if (!parsed?.snapshot || !parsed?.filters || !parsed?.savedAt) return

      if (Date.now() - Number(parsed.savedAt) > COMPLIANCE_CACHE_MAX_AGE_MS) {
        window.sessionStorage.removeItem(complianceCacheKey)
        return
      }

      setFacultySearchInput(parsed.filters.search || '')
      setFacultySearch(parsed.filters.search || '')
      setSelectedDepartment(parsed.filters.department || 'all')
      setSelectedDesignation(parsed.filters.designation || 'all')

      cacheRef.current.snapshot = parsed.snapshot
      cacheRef.current.lastServerUpdate = Number(parsed.lastServerUpdate || 0)
      cacheRef.current.filters = {
        search: parsed.filters.search || '',
        department: parsed.filters.department || 'all',
        designation: parsed.filters.designation || 'all',
      }

      applySnapshotToState(parsed.snapshot)
      setIsLoading(false)
    } catch {
      // Ignore malformed cached snapshot and proceed with network fetch.
    }
  }, [applySnapshotToState])

  const loadComplianceData = useCallback(async (silent = false, forceRefresh = false) => {
    if (isLoadInFlightRef.current) {
      return
    }
    isLoadInFlightRef.current = true

    if (!silent && facultyRows.length === 0 && !cacheRef.current.snapshot) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    const currentFilters: SnapshotFilters = {
      search: facultySearch,
      department: selectedDepartment,
      designation: selectedDesignation,
    }

    const filtersChanged =
      !cacheRef.current.filters ||
      cacheRef.current.filters.search !== currentFilters.search ||
      cacheRef.current.filters.department !== currentFilters.department ||
      cacheRef.current.filters.designation !== currentFilters.designation

    try {
      if (!forceRefresh && !filtersChanged && cacheRef.current.snapshot) {
        const check = await apiClient.checkComplianceUpdates(academicYear)
        const hasChanges = Number(check.lastUpdate || 0) > Number(cacheRef.current.lastServerUpdate || 0)

        if (!hasChanges) {
          applySnapshotToState(cacheRef.current.snapshot)
          return
        }
      }

      const response = await apiClient.getAdminComplianceSummary({
        academicYear: academicYear,
        fetchAll: true,
        search: facultySearch || undefined,
        department: selectedDepartment === 'all' ? undefined : selectedDepartment,
        designation: selectedDesignation === 'all' ? undefined : selectedDesignation,
      })

      applySnapshotToState(response)

      cacheRef.current.snapshot = response
      cacheRef.current.filters = currentFilters

      const check = await apiClient.checkComplianceUpdates(academicYear)
      cacheRef.current.lastServerUpdate = Number(check.lastUpdate || 0)

      const toPersist: PersistedComplianceSnapshot = {
        snapshot: response,
        lastServerUpdate: cacheRef.current.lastServerUpdate,
        filters: currentFilters,
        savedAt: Date.now(),
      }
      window.sessionStorage.setItem(complianceCacheKey, JSON.stringify(toPersist))
    } catch (error) {
      if (!silent) {
        toast.error(getApiErrorMessage(error, 'Failed to load task compliance data'))
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      isLoadInFlightRef.current = false
    }
  }, [applySnapshotToState, facultyRows.length, facultySearch, selectedDepartment, selectedDesignation])

  useEffect(() => {
    void loadComplianceData(false)
  }, [loadComplianceData])

  useEffect(() => {
    let active = true

    const watchForDbChanges = async () => {
      while (active) {
        try {
          const response = await apiClient.awaitComplianceUpdate({
            academicYear,
            since: cacheRef.current.lastServerUpdate,
            timeoutMs: 30000,
          })

          if (!active) {
            return
          }

          if (response.changed) {
            cacheRef.current.lastServerUpdate = Number(response.lastUpdate || 0)
            await loadComplianceData(true, true)
          }
        } catch {
          if (!active) {
            return
          }
        }
      }
    }

    void watchForDbChanges()

    return () => {
      active = false
    }
  }, [loadComplianceData])

  const departmentOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(facultyRows.map((member) => member.department))).sort((a, b) => a.localeCompare(b))]
  }, [facultyRows])

  const designationOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(facultyRows.map((member) => member.designation))).sort((a, b) => a.localeCompare(b))]
  }, [facultyRows])

  const scopedFaculty = useMemo(() => facultyRows, [facultyRows])

  const filteredTaskRows = useMemo(() => {
    return taskRows.filter((task) => {
      const status = getDeadlineStatus(task.deadlineISO)
      const statusOk = selectedStatusFilter === 'all' || status.key === selectedStatusFilter
      const taskOk = selectedTaskFilter === 'all' || task.key === selectedTaskFilter
      return statusOk && taskOk
    })
  }, [taskRows, selectedStatusFilter, selectedTaskFilter])

  const selectedTask = useMemo(() => {
    if (selectedTaskFilter === 'all') return null
    return taskRows.find((task) => task.key === selectedTaskFilter) || null
  }, [selectedTaskFilter, taskRows])

  const visibleRows = useMemo(() => {
    const source = selectedTask
      ? (activeTab === 'pending'
          ? scopedFaculty.filter((member) => !member.completedTaskIds.has(selectedTask.key))
          : scopedFaculty.filter((member) => member.completedTaskIds.has(selectedTask.key)))
      : (activeTab === 'pending'
          ? scopedFaculty.filter((member) => member.pendingTasks > 0)
          : scopedFaculty.filter((member) => member.pendingTasks === 0))

    return source
  }, [activeTab, scopedFaculty, selectedTask])

  const averageCompletion = useMemo(() => {
    if (scopedFaculty.length === 0) return 0
    const total = scopedFaculty.reduce((sum, item) => sum + item.completionRate, 0)
    return Math.round(total / scopedFaculty.length)
  }, [scopedFaculty])

  const fullyCompletedFacultyCount = useMemo(
    () => scopedFaculty.filter((member) => member.pendingTasks === 0).length,
    [scopedFaculty],
  )

  const needsAttentionCount = useMemo(
    () => scopedFaculty.filter((member) => member.pendingTasks > 0).length,
    [scopedFaculty],
  )

  const averageCompletedPerTask = useMemo(() => {
    if (filteredTaskRows.length === 0) return 0
    const totalCompleted = filteredTaskRows.reduce((sum, task) => sum + task.completedFaculty, 0)
    return Number((totalCompleted / filteredTaskRows.length).toFixed(1))
  }, [filteredTaskRows])

  const clearAllFilters = () => {
    setSelectedDepartment('all')
    setSelectedDesignation('all')
    setSelectedStatusFilter('all')
    setSelectedTaskFilter('all')
    setFacultySearchInput('')
    setFacultySearch('')
  }

  if (!isDean() && !isAdmin()) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Only dean and admin users can access task compliance analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="rounded-3xl border border-violet-100 bg-gradient-to-r from-white via-violet-50 to-fuchsia-50 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-violet-600" />
              Activities Task Compliance
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void loadComplianceData(false, true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faculties Monitored</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalFacultyCount}</p>
            <p className="mt-1 text-xs text-slate-500">Faculty records in filtered result</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Average Completion</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{averageCompletion}%</p>
            <p className="mt-1 text-xs text-emerald-700">Current result average (DB-triggered live updates)</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Avg Completed / Task</p>
            <p className="mt-1 text-2xl font-bold text-violet-800">{averageCompletedPerTask}</p>
            <p className="mt-1 text-xs text-violet-700">Per-task average faculty completion</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Needs Attention</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{needsAttentionCount}</p>
            <p className="mt-1 text-xs text-amber-700">Fully completed: {fullyCompletedFacultyCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Essential Filters</h2>
            <p className="mt-1 text-xs text-slate-500">Server-side filtering for faster loads on large faculty datasets.</p>
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Department</span>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="input-base">
              {departmentOptions.map((dep) => (
                <option key={dep} value={dep}>{dep === 'all' ? 'All Departments' : dep}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Designation</span>
            <select value={selectedDesignation} onChange={(e) => setSelectedDesignation(e.target.value)} className="input-base">
              {designationOptions.map((designation) => (
                <option key={designation} value={designation}>{designation === 'all' ? 'All Designations' : designation}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Task</span>
            <select value={selectedTaskFilter} onChange={(e) => setSelectedTaskFilter(e.target.value)} className="input-base">
              <option value="all">All Tasks</option>
              {taskRows.map((task) => (
                <option key={task.key} value={task.key}>{task.task} ({task.workflow} {task.targetIndex})</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
            <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value as TaskStatusFilter)} className="input-base">
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="near-deadline">Near deadline</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pending' ? 'bg-violet-600 text-white' : 'text-violet-700 hover:bg-violet-100'
              }`}
            >
              <Clock3 className="inline-block mr-1 h-4 w-4" />
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'completed' ? 'bg-violet-600 text-white' : 'text-violet-700 hover:bg-violet-100'
              }`}
            >
              <CheckCircle2 className="inline-block mr-1 h-4 w-4" />
              Completed
            </button>
          </div>

          <input
            type="text"
            value={facultySearchInput}
            onChange={(e) => setFacultySearchInput(e.target.value)}
            placeholder="Search faculty by name, department, email, or ID"
            className="input-base max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
            Loading live compliance data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Faculty</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Designation</th>
                  <th className="px-3 py-2 text-left">Progress</th>
                  <th className="px-3 py-2 text-left">Selected Task</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const selectedTaskCompleted = selectedTask ? row.completedTaskIds.has(selectedTask.key) : null

                  return (
                    <tr key={row.facultyId} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.email || row.facultyId}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{row.department}</td>
                      <td className="px-3 py-3 text-slate-700">{row.designation}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.completionRate}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{row.completionRate}%</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{row.completedTasks} completed / {row.pendingTasks} pending</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {selectedTask ? (
                          <div>
                            <p className="font-medium text-slate-900">{selectedTask.task}</p>
                            <p className="text-xs text-slate-500">Deadline: {formatDate(selectedTask.deadlineISO)}</p>
                            <p className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${selectedTaskCompleted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                              {selectedTaskCompleted ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-900">No task selected</p>
                            <p className="text-xs text-slate-500">Choose a task filter to inspect per-faculty status.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                      No faculty found for this filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-violet-600" />
            Task Completion Snapshot
          </h2>
          <p className="text-xs text-slate-500">Average completed per task: {averageCompletedPerTask}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left">Task</th>
                <th className="px-3 py-2 text-left">Workflow</th>
                <th className="px-3 py-2 text-left">Deadline</th>
                <th className="px-3 py-2 text-left">Completed</th>
                <th className="px-3 py-2 text-left">Pending</th>
                <th className="px-3 py-2 text-left">Completion</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaskRows.map((task) => (
                <tr key={task.key} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3 text-slate-900 font-medium">{task.task} (Slot {task.targetIndex})</td>
                  <td className="px-3 py-3 text-slate-700">{task.workflow}</td>
                  <td className="px-3 py-3 text-slate-700">{formatDate(task.deadlineISO)}</td>
                  <td className="px-3 py-3 text-emerald-700 font-semibold">{task.completedFaculty}</td>
                  <td className="px-3 py-3 text-amber-700 font-semibold">{task.pendingFaculty}</td>
                  <td className="px-3 py-3 text-slate-700">{task.completionRate}%</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${task.statusClass}`}>
                      {task.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTaskRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No task rows available for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
