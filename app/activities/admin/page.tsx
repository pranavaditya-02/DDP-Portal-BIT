'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRoles } from '@/hooks/useRoles'
import {
  apiClient,
  getApiErrorMessage,
  type DesignationTargetRuleRecord,
  type WorkflowAcademicYearConfigRecord,
  type WorkflowTargetDefinitionRecord,
} from '@/lib/api'
import { getWorkflowSlotKey, WORKFLOW_DEADLINE_ITEMS } from '@/lib/workflow-deadlines'
import { CalendarDays, RotateCcw, Save, ShieldAlert, Settings, CheckCircle, X } from 'lucide-react'

const DEFAULT_ACADEMIC_YEAR = '2026-27'
const FORM_FIELD_CLASS = 'input-base border-violet-300 focus:border-violet-500 focus:ring-violet-200'
const COMPACT_DATE_FIELD_CLASS = `${FORM_FIELD_CLASS} h-9 min-w-[140px]`

const SLOT_LIMIT_TARGET_KEYS = {
  paper: 'paper_target_count',
  proposal: 'funding_proposal_slot_count',
  patent: 'patent_count',
} as const

function toInteger(value: number, min: number, max: number) {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.max(min, Math.min(max, normalized))
}

function WorkflowAdminLoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-pulse">
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-8 w-72 rounded-lg bg-violet-200" />
        <div className="mt-3 h-4 w-[28rem] rounded bg-violet-100" />
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="h-12 rounded-lg bg-violet-100" />
            <div className="h-12 rounded-lg bg-violet-100" />
            <div className="h-12 rounded-lg bg-violet-100" />
          </div>
          <div className="mt-4 h-10 rounded-lg bg-violet-100" />
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 h-6 w-64 rounded bg-violet-200" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-20 rounded-xl border border-violet-200 bg-violet-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  buttonText: string
  isLoading?: boolean
}

function ConfirmationDialog({ isOpen, title, description, onConfirm, onCancel, buttonText, isLoading = false }: ConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-slate-900">{title}</h2>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-slate-600">{description}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? 'Processing...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ActivitiesAdminPage() {
  const { isMaintenance } = useRoles()
  const isAdmin = isMaintenance()

  const [loading, setLoading] = useState(true)
  const [savingDeadlines, setSavingDeadlines] = useState(false)
  const [savingTargets, setSavingTargets] = useState(false)
  const [savingSlots, setSavingSlots] = useState(false)
  const [academicYears, setAcademicYears] = useState<WorkflowAcademicYearConfigRecord[]>([])
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR)
  const [newAcademicYear, setNewAcademicYear] = useState('')
  const [creatingAcademicYear, setCreatingAcademicYear] = useState(false)
  const [activatingAcademicYear, setActivatingAcademicYear] = useState(false)
  const [slotLimits, setSlotLimits] = useState({ paperSlots: 4, proposalSlots: 2, patentSlots: 1 })
  const [deadlineMap, setDeadlineMap] = useState<Record<string, string>>({})
  const [rules, setRules] = useState<DesignationTargetRuleRecord[]>([])
  const [targetDefinitions, setTargetDefinitions] = useState<WorkflowTargetDefinitionRecord[]>([])
  const [targetDrafts, setTargetDrafts] = useState<Record<number, Record<string, number>>>({})
  const [selectedDesignationId, setSelectedDesignationId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; description: string; onConfirm: () => void; buttonText: string }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    buttonText: 'Confirm',
  })

  const grouped = useMemo(
    () => ({
      paper: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'paper'),
      proposal: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'proposal'),
      patent: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'patent'),
    }),
    [],
  )

  const targetDefinitionMap = useMemo(
    () => new Map(targetDefinitions.map((target) => [target.code, target])),
    [targetDefinitions],
  )

  const selectedRule = useMemo(() => {
    if (!selectedDesignationId) return null
    return rules.find((rule) => rule.designationId === selectedDesignationId) || null
  }, [rules, selectedDesignationId])

  const selectedDraftTargets = selectedDesignationId ? (targetDrafts[selectedDesignationId] || {}) : {}

  const maxPaperTargets = toInteger(slotLimits.paperSlots, 1, 12)
  const maxProposalSlots = toInteger(slotLimits.proposalSlots, 1, 8)

  const filteredPaper = grouped.paper
  const filteredProposal = grouped.proposal
  const filteredPatent = grouped.patent

  const targetKeys = selectedRule ? Object.keys(selectedRule.targets) : []
  const sortedTargetKeys = targetKeys
    .slice()
    .sort((a, b) => {
      const left = targetDefinitionMap.get(a)?.name || a
      const right = targetDefinitionMap.get(b)?.name || b
      return left.localeCompare(right)
    })

  const loadAcademicYears = async () => {
    const response = await apiClient.getWorkflowAcademicYears()
    const years = response.years || []
    setAcademicYears(years)

    const activeYear = response.activeAcademicYear || years.find((item) => item.isActive)?.academicYear || DEFAULT_ACADEMIC_YEAR
    return { years, activeYear }
  }

  const loadData = async (year: string, yearConfigs?: WorkflowAcademicYearConfigRecord[]) => {
    setLoading(true)
    try {
      const [deadlineResponse, ruleResponse, targetMasterResponse] = await Promise.all([
        apiClient.getWorkflowDeadlines(year),
        apiClient.getWorkflowDesignationRules(year),
        apiClient.getWorkflowTargetDefinitions(),
      ])

      const configs = yearConfigs || academicYears
      const yearConfig = configs.find((item) => item.academicYear === year)
      setSlotLimits({
        paperSlots: yearConfig?.paperSlots || 4,
        proposalSlots: yearConfig?.proposalSlots || 2,
        patentSlots: yearConfig?.patentSlots ?? 1,
      })

      setDeadlineMap(deadlineResponse.settings || {})
      setRules(ruleResponse.rules || [])
      setTargetDefinitions(targetMasterResponse.targets || [])

      const drafts: Record<number, Record<string, number>> = {}
      for (const rule of ruleResponse.rules || []) {
        drafts[rule.designationId] = { ...rule.targets }
      }
      setTargetDrafts(drafts)

      if ((ruleResponse.rules || []).length > 0) {
        setSelectedDesignationId((prev) => prev || ruleResponse.rules[0].designationId)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load workflow settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    const bootstrap = async () => {
      try {
        const { activeYear } = await loadAcademicYears()
        setAcademicYear(activeYear)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load workflow settings'))
        setLoading(false)
      }
    }

    void bootstrap()
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || !academicYear) return
    void loadData(academicYear)
  }, [academicYear, isAdmin, academicYears])

  useEffect(() => {
    setTargetDrafts((prev) => {
      const next = { ...prev }
      for (const [designationKey, targets] of Object.entries(next)) {
        const paperValue = Number(targets[SLOT_LIMIT_TARGET_KEYS.paper] || 0)
        const proposalValue = Number(targets[SLOT_LIMIT_TARGET_KEYS.proposal] || 0)
        const patentValue = Number(targets[SLOT_LIMIT_TARGET_KEYS.patent] || 0)

        next[Number(designationKey)] = {
          ...targets,
          [SLOT_LIMIT_TARGET_KEYS.paper]: Math.min(Math.max(paperValue, 0), slotLimits.paperSlots),
          [SLOT_LIMIT_TARGET_KEYS.proposal]: Math.min(Math.max(proposalValue, 0), slotLimits.proposalSlots),
          [SLOT_LIMIT_TARGET_KEYS.patent]: Math.min(Math.max(patentValue, 0), slotLimits.patentSlots),
        }
      }
      return next
    })
  }, [slotLimits])

  const handleTargetChange = (targetCode: string, value: string) => {
    if (!selectedDesignationId) return
    const next = Number(value)
    setTargetDrafts((prev) => ({
      ...prev,
      [selectedDesignationId]: {
        ...(prev[selectedDesignationId] || {}),
        [targetCode]: Number.isFinite(next) && next >= 0 ? next : 0,
      },
    }))
  }

  const handleSaveDesignationTargets = async () => {
    if (!selectedDesignationId) return

    setSavingTargets(true)
    try {
      await apiClient.updateWorkflowDesignationTargets(selectedDesignationId, {
        academicYear,
        targets: selectedDraftTargets,
      })
      await loadData(academicYear)
      toast.success('FAP targets updated and assignments rebuilt')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update FAP targets'))
    } finally {
      setSavingTargets(false)
    }
  }

  const saveDeadlines = async (successMessage: string, fallbackMessage: string) => {
    setSavingDeadlines(true)
    try {
      await apiClient.updateWorkflowDeadlines({
        academicYear,
        settings: deadlineMap,
      })
      toast.success(successMessage)
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallbackMessage))
    } finally {
      setSavingDeadlines(false)
    }
  }

  const handleSlotChange = (key: 'paperSlots' | 'proposalSlots' | 'patentSlots', delta: number) => {
    setSlotLimits((prev) => {
      const nextValue = prev[key] + delta
      if (key === 'paperSlots') {
        return { ...prev, paperSlots: toInteger(nextValue, 1, 12) }
      }
      if (key === 'proposalSlots') {
        return { ...prev, proposalSlots: toInteger(nextValue, 1, 8) }
      }
      return { ...prev, patentSlots: toInteger(nextValue, 0, 4) }
    })
  }

  const handleSaveSlotLimits = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Save Slot Limits',
      description: 'Are you sure you want to save the slot limit changes for this academic year?',
      buttonText: 'Save',
      onConfirm: async () => {
        setSavingSlots(true)
        try {
          await apiClient.updateWorkflowAcademicYearSlots(academicYear, slotLimits)
          await loadAcademicYears()
          await loadData(academicYear)
          toast.success('Slot limits updated successfully')
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Failed to update slot limits'))
        } finally {
          setSavingSlots(false)
        }
      },
    })
  }

  const handleCreateAcademicYear = async () => {
    const normalized = newAcademicYear.trim()
    if (!/^\d{4}-\d{2}$/.test(normalized)) {
      toast.error('Academic year must be in YYYY-YY format')
      return
    }

    setCreatingAcademicYear(true)
    try {
      await apiClient.createWorkflowAcademicYear({
        academicYear: normalized,
        copyFromAcademicYear: academicYear,
      })
      const { years } = await loadAcademicYears()
      setAcademicYear(normalized)
      await loadData(normalized, years)
      setNewAcademicYear('')
      toast.success('Academic year created successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create academic year'))
    } finally {
      setCreatingAcademicYear(false)
    }
  }

  const handleActivateAcademicYear = async () => {
    if (!academicYear) return
    setConfirmDialog({
      isOpen: true,
      title: 'Activate Academic Year',
      description: `Activate academic year ${academicYear}? This will deactivate all other years and set this as the active academic year.`,
      buttonText: 'Activate',
      onConfirm: async () => {
        setActivatingAcademicYear(true)
        try {
          await apiClient.activateWorkflowAcademicYear(academicYear)
          const { years } = await loadAcademicYears()
          await loadData(academicYear, years)
          toast.success(`Academic year ${academicYear} activated successfully`)
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Failed to activate academic year'))
        } finally {
          setActivatingAcademicYear(false)
        }
      },
    })
  }

  if (loading) {
    return <WorkflowAdminLoadingSkeleton />
  }

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Only admin users can manage workflow deadlines.</p>
        </div>
      </div>
    )
  }

  const renderDeadlineInput = (taskId: string, slotNo: number) => {
    const key = getWorkflowSlotKey(taskId, slotNo)
    return (
      <input
        type="date"
        value={deadlineMap[key] || deadlineMap[taskId] || ''}
        onChange={(e) => setDeadlineMap((prev) => ({ ...prev, [key]: e.target.value }))}
        className={COMPACT_DATE_FIELD_CLASS}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-600" />
          Workflow Deadline Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Action Plan - Time Lines (Jun 2026 to Dec 2026) managed from backend configuration.</p>
        <p className="text-xs text-slate-500 mt-1">Designation source is resolved from faculty table and mapped to master designation rules.</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Academic Year</p>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-violet-300 bg-white px-2 text-sm text-slate-900"
              >
                {academicYears.map((year) => (
                  <option key={year.academicYear} value={year.academicYear}>
                    {year.academicYear}{year.isActive ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Paper Slots</p>
              <div className="mt-1 flex items-center gap-2">
                <button type="button" onClick={() => handleSlotChange('paperSlots', -1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">-</button>
                <span className="text-base font-semibold text-slate-900">{slotLimits.paperSlots}</span>
                <button type="button" onClick={() => handleSlotChange('paperSlots', 1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">+</button>
              </div>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Proposal Slots</p>
              <div className="mt-1 flex items-center gap-2">
                <button type="button" onClick={() => handleSlotChange('proposalSlots', -1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">-</button>
                <span className="text-base font-semibold text-slate-900">{slotLimits.proposalSlots}</span>
                <button type="button" onClick={() => handleSlotChange('proposalSlots', 1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">+</button>
              </div>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Patent Slots</p>
              <div className="mt-1 flex items-center gap-2">
                <button type="button" onClick={() => handleSlotChange('patentSlots', -1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">-</button>
                <span className="text-base font-semibold text-slate-900">{slotLimits.patentSlots}</span>
                <button type="button" onClick={() => handleSlotChange('patentSlots', 1)} className="h-8 w-8 rounded border border-violet-300 text-violet-700">+</button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <input
              type="text"
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
              placeholder="Create year (e.g. 2027-28)"
              className={FORM_FIELD_CLASS}
            />
            <button type="button" onClick={() => void handleCreateAcademicYear()} disabled={creatingAcademicYear} className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 disabled:opacity-60">
              {creatingAcademicYear ? 'Creating...' : 'Create Year'}
            </button>
            <button type="button" onClick={() => void handleSaveSlotLimits()} disabled={savingSlots} className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60">
              {savingSlots ? 'Saving...' : 'Save Slot Limits'}
            </button>
            {academicYears.find((y) => y.academicYear === academicYear)?.isActive ? null : (
              <button type="button" onClick={() => void handleActivateAcademicYear()} disabled={activatingAcademicYear} className="inline-flex items-center justify-center rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60">
                {activatingAcademicYear ? 'Activating...' : 'Activate Year'}
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Select a year, tune slot counts, create next year setup, and activate it when the year starts.</p>
            <div className="flex gap-2 sm:ml-auto">
              <button type="button" onClick={() => void loadData(academicYear)} className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50">
                <RotateCcw className="h-4 w-4" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">FAP Target Management</h2>
              <p className="text-xs text-slate-500">View and edit all designation targets by category.</p>
            </div>
            <button
              type="button"
              onClick={() => void handleSaveDesignationTargets()}
              disabled={!selectedDesignationId || savingTargets}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save All Targets
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-violet-200">
            <table className="min-w-full divide-y divide-violet-100 text-sm">
              <thead className="bg-violet-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Target Category</th>
                  {rules.map((rule) => (
                    <th key={rule.designationId} className="px-3 py-2 text-left font-semibold text-slate-700">
                      {rule.designationName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100 bg-white">
                {sortedTargetKeys.map((targetCode) => {
                  const target = targetDefinitionMap.get(targetCode)
                  return (
                    <tr key={targetCode}>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {target?.name || targetCode}
                        {target?.unit ? ` (${target.unit})` : ''}
                      </td>
                      {rules.map((rule) => {
                        const currentValue = targetDrafts[rule.designationId]?.[targetCode] ?? 0
                        const maxValue = targetCode === SLOT_LIMIT_TARGET_KEYS.paper
                          ? slotLimits.paperSlots
                          : (targetCode === SLOT_LIMIT_TARGET_KEYS.proposal
                            ? slotLimits.proposalSlots
                            : (targetCode === SLOT_LIMIT_TARGET_KEYS.patent ? slotLimits.patentSlots : undefined))
                        return (
                          <td key={`${rule.designationId}-${targetCode}`} className="px-3 py-3">
                            <input
                              type="number"
                              min={0}
                              max={Number.isFinite(maxValue) ? maxValue : undefined}
                              step={(target?.unit || '').includes('lakh') ? '0.1' : '1'}
                              value={currentValue}
                              onChange={(e) => {
                                const next = Number(e.target.value)
                                const bounded = Number.isFinite(maxValue) && typeof maxValue === 'number'
                                  ? Math.min(Number.isFinite(next) ? next : 0, maxValue)
                                  : (Number.isFinite(next) ? next : 0)
                                setTargetDrafts((prev) => ({
                                  ...prev,
                                  [rule.designationId]: {
                                    ...(prev[rule.designationId] || {}),
                                    [targetCode]: bounded >= 0 ? bounded : 0,
                                  },
                                }))
                                setSelectedDesignationId(rule.designationId)
                              }}
                              className={FORM_FIELD_CLASS}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Journal Publications - Individual Faculty Action Plan</h2>
              <p className="text-xs text-slate-500">Update all paper timelines across {maxPaperTargets} configured slots.</p>
            </div>
            <button
              type="button"
              onClick={() => void saveDeadlines('Paper deadlines saved successfully', 'Failed to save paper deadlines')}
              disabled={savingDeadlines}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Paper Dates
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-violet-200">
            <table className="min-w-full divide-y divide-violet-100 text-sm">
              <thead className="bg-violet-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Task</th>
                  {Array.from({ length: maxPaperTargets }, (_, index) => (
                    <th key={`paper-slot-${index + 1}`} className="px-3 py-2 text-left font-semibold text-slate-700">Paper {index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100 bg-white">
                {filteredPaper.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 font-medium text-slate-900">{item.title}</td>
                    {Array.from({ length: maxPaperTargets }, (_, index) => (
                      <td key={`${item.id}-paper-${index + 1}`} className="px-3 py-3">{renderDeadlineInput(item.id, index + 1)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Funding Proposal Submission - Individual Faculty Action Plan</h2>
              <p className="text-xs text-slate-500">Update proposal timelines across {maxProposalSlots} configured slots.</p>
            </div>
            <button
              type="button"
              onClick={() => void saveDeadlines('Funding proposal deadlines saved successfully', 'Failed to save funding proposal deadlines')}
              disabled={savingDeadlines}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Proposal Dates
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-violet-200">
            <table className="min-w-full divide-y divide-violet-100 text-sm">
              <thead className="bg-violet-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Task</th>
                  {Array.from({ length: maxProposalSlots }, (_, index) => (
                    <th key={`proposal-slot-${index + 1}`} className="px-3 py-2 text-left font-semibold text-slate-700">Slot {index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100 bg-white">
                {filteredProposal.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 font-medium text-slate-900">{item.title}</td>
                    {Array.from({ length: maxProposalSlots }, (_, index) => (
                      <td key={`${item.id}-proposal-${index + 1}`} className="px-3 py-3">{renderDeadlineInput(item.id, index + 1)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Patent Submission - Individual Faculty Action Plan</h2>
              <p className="text-xs text-slate-500">Update patent timelines across {slotLimits.patentSlots} configured slots.</p>
            </div>
            <button
              type="button"
              onClick={() => void saveDeadlines('Patent deadlines saved successfully', 'Failed to save patent deadlines')}
              disabled={savingDeadlines || slotLimits.patentSlots === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Patent Dates
            </button>
          </div>
          {slotLimits.patentSlots === 0 ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-sm text-slate-700">
              Patent slots disabled for this academic year.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-violet-200">
              <table className="min-w-full divide-y divide-violet-100 text-sm">
                <thead className="bg-violet-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Task</th>
                    {Array.from({ length: slotLimits.patentSlots }, (_, index) => (
                      <th key={`patent-slot-${index + 1}`} className="px-3 py-2 text-left font-semibold text-slate-700">Patent {index + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-100 bg-white">
                  {filteredPatent.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 font-medium text-slate-900">{item.title}</td>
                      {Array.from({ length: slotLimits.patentSlots }, (_, index) => (
                        <td key={`${item.id}-patent-${index + 1}`} className="px-3 py-3">{renderDeadlineInput(item.id, index + 1)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        buttonText={confirmDialog.buttonText}
        isLoading={savingSlots || activatingAcademicYear}
      />
    </div>
  )
}
