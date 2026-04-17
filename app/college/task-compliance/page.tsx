'use client'

import React, { useMemo, useState } from 'react'
import { useRoles } from '@/hooks/useRoles'
import { facultyMembers } from '@/lib/mock-data'
import {
  DEFAULT_WORKFLOW_DEADLINE_MAP,
  DEFAULT_WORKFLOW_SETTINGS,
  getPaperDeadlineKey,
  WORKFLOW_DEADLINES_STORAGE_KEY,
  WORKFLOW_DEADLINE_ITEMS,
  WORKFLOW_SETTINGS_STORAGE_KEY,
} from '@/lib/workflow-deadlines'
import { CheckCircle2, Clock3, RotateCcw, ShieldAlert, Users } from 'lucide-react'

type TabKey = 'pending' | 'completed'

type FacultyCompliance = {
  id: number
  name: string
  email: string
  department: string
  designation: string
  completedTasks: number
  pendingTasks: number
  completionRate: number
}

type TaskOption = {
  key: string
  baseId: string
  targetIndex: number
  label: string
  type: 'paper' | 'patent'
  deadlineISO: string
}

type TaskStatusFilter = 'all' | 'upcoming' | 'near-deadline' | 'overdue'

type CombinedTaskRow = {
  key: string
  task: string
  workflow: string
  type: 'paper' | 'patent'
  targetIndex: number
  deadlineISO: string
  completionRate: number
  completedFaculty: number
  pendingFaculty: number
  statusLabel: 'Upcoming' | 'Near deadline' | 'Overdue'
  statusClass: string
}

function buildTaskOptions(paperTargets: number, deadlineMap: Record<string, string>): TaskOption[] {
  const options: TaskOption[] = []

  WORKFLOW_DEADLINE_ITEMS.forEach((item) => {
    if (item.type === 'paper' && paperTargets > 1) {
      for (let target = 1; target <= paperTargets; target += 1) {
        const deadlineKey = getPaperDeadlineKey(item.id, target)
        options.push({
          key: deadlineKey,
          baseId: item.id,
          targetIndex: target,
          label: `${item.title} (Paper ${target})`,
          type: 'paper',
          deadlineISO: deadlineMap[deadlineKey] || deadlineMap[item.id] || item.defaultDeadlineISO,
        })
      }
      return
    }

    options.push({
      key: item.id,
      baseId: item.id,
      targetIndex: 1,
      label: item.title,
      type: item.type,
      deadlineISO: deadlineMap[item.id] || item.defaultDeadlineISO,
    })
  })

  return options
}

function getDeadlineStatus(deadlineISO: string) {
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

function buildComplianceData(totalTasks: number): FacultyCompliance[] {
  return facultyMembers.map((member) => {
    const completedTasks = Math.min(totalTasks, 6 + (member.id % Math.max(3, totalTasks - 2)))
    const pendingTasks = Math.max(0, totalTasks - completedTasks)
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      department: member.department,
      designation: member.designation,
      completedTasks,
      pendingTasks,
      completionRate,
    }
  })
}

export default function DeanTaskCompliancePage() {
  const { isDean, isAdmin } = useRoles()
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [facultySearch, setFacultySearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all')
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<TaskStatusFilter>('all')
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all')
  const [paperTargets] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_SETTINGS.paperTargets
    try {
      const raw = localStorage.getItem(WORKFLOW_SETTINGS_STORAGE_KEY)
      if (!raw) return DEFAULT_WORKFLOW_SETTINGS.paperTargets
      const parsed = JSON.parse(raw) as { paperTargets?: number }
      const count = parsed.paperTargets || DEFAULT_WORKFLOW_SETTINGS.paperTargets
      return Math.max(1, Math.min(4, count))
    } catch {
      return DEFAULT_WORKFLOW_SETTINGS.paperTargets
    }
  })

  const [deadlineMap] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_DEADLINE_MAP
    try {
      const raw = localStorage.getItem(WORKFLOW_DEADLINES_STORAGE_KEY)
      if (!raw) return DEFAULT_WORKFLOW_DEADLINE_MAP
      const parsed = JSON.parse(raw) as Record<string, string>
      return { ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...parsed }
    } catch {
      return DEFAULT_WORKFLOW_DEADLINE_MAP
    }
  })

  const taskOptions = useMemo(() => buildTaskOptions(paperTargets, deadlineMap), [paperTargets, deadlineMap])

  const departmentOptions = useMemo(
    () => ['all', ...Array.from(new Set(facultyMembers.map((member) => member.department))).sort((a, b) => a.localeCompare(b))],
    [],
  )

  const designationOptions = useMemo(
    () => ['all', ...Array.from(new Set(facultyMembers.map((member) => member.designation))).sort((a, b) => a.localeCompare(b))],
    [],
  )

  const compliance = useMemo(() => buildComplianceData(taskOptions.length), [taskOptions.length])

  const scopedCompliance = useMemo(() => {
    return compliance.filter((member) => {
      const departmentOk = selectedDepartment === 'all' || member.department === selectedDepartment
      const designationOk = selectedDesignation === 'all' || member.designation === selectedDesignation
      return departmentOk && designationOk
    })
  }, [compliance, selectedDepartment, selectedDesignation])

  const facultyTaskRows = useMemo(() => {
    if (selectedTaskFilter === 'all') return scopedCompliance

    const taskIndex = taskOptions.findIndex((task) => task.key === selectedTaskFilter)
    const safeTaskIndex = taskIndex < 0 ? 0 : taskIndex

    return scopedCompliance.map((member) => {
      const isCompleted = ((member.id * 17 + safeTaskIndex * 13) % 100) < member.completionRate
      return {
        ...member,
        completedTasks: isCompleted ? 1 : 0,
        pendingTasks: isCompleted ? 0 : 1,
        completionRate: isCompleted ? 100 : 0,
      }
    })
  }, [scopedCompliance, selectedTaskFilter, taskOptions])

  const pendingFaculty = useMemo(
    () => facultyTaskRows.filter((f) => f.pendingTasks > 0),
    [facultyTaskRows],
  )

  const completedFaculty = useMemo(
    () => facultyTaskRows.filter((f) => f.pendingTasks === 0),
    [facultyTaskRows],
  )

  const filteredTaskOptions = useMemo(() => {
    return taskOptions.filter((task) => {
      const status = getDeadlineStatus(task.deadlineISO)
      const statusOk = selectedStatusFilter === 'all' || status.key === selectedStatusFilter
      const taskOk = selectedTaskFilter === 'all' || task.key === selectedTaskFilter
      const targetOk = selectedTargetFilter === 'all' || task.targetIndex === Number(selectedTargetFilter)

      return statusOk && taskOk && targetOk
    })
  }, [selectedStatusFilter, selectedTargetFilter, selectedTaskFilter, taskOptions])

  const selectedTask = useMemo(() => {
    if (selectedTaskFilter === 'all') return null
    return taskOptions.find((task) => task.key === selectedTaskFilter) || null
  }, [selectedTaskFilter, taskOptions])

  const visibleRows = useMemo(() => {
    const source = activeTab === 'pending' ? pendingFaculty : completedFaculty
    const term = facultySearch.trim().toLowerCase()

    if (!term) return source
    return source.filter((item) => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
      )
    })
  }, [activeTab, completedFaculty, pendingFaculty, facultySearch])

  const averageCompletion = useMemo(() => {
    if (facultyTaskRows.length === 0) return 0
    const total = facultyTaskRows.reduce((sum, item) => sum + item.completionRate, 0)
    return Math.round(total / facultyTaskRows.length)
  }, [facultyTaskRows])

  const scopedFacultyCount = facultyTaskRows.length

  const clearAllFilters = () => {
    setSelectedDepartment('all')
    setSelectedDesignation('all')
    setSelectedTargetFilter('all')
    setSelectedStatusFilter('all')
    setSelectedTaskFilter('all')
  }

  if (!isDean() && !isAdmin()) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Only dean users can access task compliance analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          Activities Task Compliance
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monitor faculty completion against the same task workflow used in the Activities page.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Essential Filters</h2>
            <p className="mt-1 text-xs text-slate-500">Use only key filters to monitor tasks quickly.</p>
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
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
              {taskOptions.map((task) => (
                <option key={task.key} value={task.key}>{task.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Paper Target</span>
            <select value={selectedTargetFilter} onChange={(e) => setSelectedTargetFilter(e.target.value)} className="input-base">
              <option value="all">All Targets</option>
              <option value="1">Paper 1</option>
              <option value="2" disabled={paperTargets < 2}>Paper 2</option>
              <option value="3" disabled={paperTargets < 3}>Paper 3</option>
              <option value="4" disabled={paperTargets < 4}>Paper 4</option>
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

      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="inline-flex rounded-xl border border-violet-200 bg-violet-50 p-1">
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
            value={facultySearch}
            onChange={(e) => setFacultySearch(e.target.value)}
            placeholder="Search faculty by name, department, or email"
            className="input-base max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left">Faculty</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Designation</th>
                <th className="px-3 py-2 text-left">Pending Task / Deadline</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{row.department}</td>
                  <td className="px-3 py-3 text-slate-700">{row.designation}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {selectedTask ? (
                      <div>
                        <p className="font-medium text-slate-900">{selectedTask.label}</p>
                        <p className="text-xs text-amber-700">Status: Pending</p>
                        <p className="text-xs text-slate-500">Deadline: {new Date(selectedTask.deadlineISO).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-900">Pending Task</p>
                        <p className="text-xs text-slate-500">Select a task to view the exact deadline</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    No faculty found for this filter.
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
