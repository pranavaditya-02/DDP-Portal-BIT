"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Users, Mail, XCircle, CheckCircle2 } from 'lucide-react'
import { apiClient, type EventMasterRecord, type EventRegistrationRecord } from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'

type RegistrationStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

type ReportRecord = {
  id: number
  student_id?: number
  student_name?: string | null
  title_of_event: string
  level_of_event?: string | null
  individual_or_batch?: string | null
  number_of_participants?: number | null
  status?: string | null
}

const statusClass = (status: string | null | undefined) => {
  const value = status?.toLowerCase()
  if (value === 'approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (value === 'rejected') return 'bg-rose-100 text-rose-700 border-rose-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

export default function VerificationEventPage() {
  const params = useParams()
  const router = useRouter()
  const roleUtils = useRoles()
  const canVerify = roleUtils.canAccessResource('/student/activity/verification-panel')

  const eventId = Number(params?.id)

  const [event, setEvent] = useState<EventMasterRecord | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([])
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'registrations' | 'reports'>('registrations')
  const [eventRegistrationFilter, setEventRegistrationFilter] = useState<RegistrationStatusFilter>('all')
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const eventSummary = useMemo(() => {
    const eventName = event?.eventName || registrations[0]?.eventName || 'Untitled Event'
    const eventCode = event?.eventCode || registrations[0]?.eventCode || 'N/A'
    const eventCategory = event?.eventCategory || registrations[0]?.eventCategory || 'General'
    const eventLevel = event?.eventLevel || registrations[0]?.eventLevel || 'N/A'
    const imageUrl = event?.imgLink?.trim() || '/placeholder.jpg'
    const pending = registrations.filter((r) => r.status === 'pending').length
    const approved = registrations.filter((r) => r.status === 'approved').length
    const rejected = registrations.filter((r) => r.status === 'rejected').length
    return { eventName, eventCode, eventCategory, eventLevel, imageUrl, pending, approved, rejected }
  }, [event, registrations])

  const filteredRegistrations = useMemo(() => {
    if (eventRegistrationFilter === 'all') return registrations
    return registrations.filter((record) => record.status === eventRegistrationFilter)
  }, [registrations, eventRegistrationFilter])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!Number.isInteger(eventId) || eventId <= 0) {
          throw new Error('Invalid event id')
        }
        const [regsResp, eventsResp] = await Promise.all([
          apiClient.getRegistrationsByEventId(eventId),
          apiClient.getEvents({ sort: 'desc' }),
        ])
        setRegistrations(regsResp.registrations || [])
        const found = (eventsResp.events || []).find((e: EventMasterRecord) => e.id === eventId) || null
        setEvent(found)
      } catch (err: any) {
        setError(err?.message || 'Failed to load event details')
        setRegistrations([])
        setEvent(null)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [eventId])

  useEffect(() => {
    const controller = new AbortController()
    const loadReports = async () => {
      setReportsLoading(true)
      setReportsError(null)
      try {
        const query = new URLSearchParams({ eventId: String(eventId) })
        const res = await fetch(`/api/competition/competition-reports?${query.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load competition reports')
        const data = await res.json()
        const items = Array.isArray(data.reports) ? data.reports : Array.isArray(data.data) ? data.data : []
        setReports(items)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setReportsError(err?.message || 'Failed to load reports')
        setReports([])
      } finally {
        if (!controller.signal.aborted) setReportsLoading(false)
      }
    }
    void loadReports()
    return () => controller.abort()
  }, [eventId])

  const handleApprove = async (registrationId: number) => {
    try {
      setUpdatingId(registrationId)
      const response = await apiClient.approveRegistration(registrationId)
      setRegistrations((prev) => prev.map((r) => (r.id === registrationId ? response.registration : r)))
    } catch (err: any) {
      setError(err?.message || 'Failed to approve')
    } finally {
      setUpdatingId(null)
    }
  }

  const startReject = (registrationId: number) => {
    setRejectingId(registrationId)
    setRejectReason('')
  }

  const cancelReject = () => {
    setRejectingId(null)
    setRejectReason('')
  }

  const submitReject = async (registrationId: number) => {
    if (!rejectReason.trim()) return
    try {
      setUpdatingId(registrationId)
      const response = await apiClient.rejectRegistration(registrationId, rejectReason.trim())
      setRegistrations((prev) => prev.map((r) => (r.id === registrationId ? response.registration : r)))
      setRejectingId(null)
      setRejectReason('')
    } catch (err: any) {
      setError(err?.message || 'Failed to reject')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Verification Panel</h1>
        <p className="text-sm text-slate-500 mt-2">View all events and verify their registrations</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/student/activity/verification-panel')}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E9EF] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('registrations')}
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition ${activeTab === 'registrations' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          Event Registrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          Competition Reports
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.6fr)] gap-6">
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 relative">
              <img src={eventSummary.imageUrl} className="h-48 w-full object-cover" alt="Event" />
              <span className="absolute right-6 top-6 rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Competition</span>
            </div>
            <div className="mt-4 p-4">
              <h2 className="text-2xl font-bold text-slate-900">{eventSummary.eventName}</h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-amber-700">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-900">{eventSummary.pending}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Approved</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">{eventSummary.approved}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-rose-700">Rejected</p>
                  <p className="mt-2 text-2xl font-bold text-rose-900">{eventSummary.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEventRegistrationFilter('pending')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${eventRegistrationFilter === 'pending' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Pending ({eventSummary.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setEventRegistrationFilter('approved')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${eventRegistrationFilter === 'approved' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Approved ({eventSummary.approved})
                </button>
                <button
                  type="button"
                  onClick={() => setEventRegistrationFilter('rejected')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${eventRegistrationFilter === 'rejected' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Rejected ({eventSummary.rejected})
                </button>
              </div>

              <div className="mt-4 rounded-[14px] border border-slate-200 bg-white p-8">
                {activeTab === 'registrations' ? (
                  <div>
                    {loading ? (
                      <div className="text-sm text-slate-500">Loading event details...</div>
                    ) : filteredRegistrations.length === 0 ? (
                      <div className="text-center text-slate-500">
                        <Users className="mx-auto h-10 w-10" />
                        <h4 className="mt-4 text-lg font-semibold text-slate-900">No Matching Registrations</h4>
                        <p className="mt-2 text-sm">No registrations found for the selected status filter.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredRegistrations.map((r) => (
                          <div key={r.id} className={`rounded-[14px] border p-4 ${r.status === 'pending' ? 'bg-amber-50 border-amber-200' : r.status === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{r.studentName || 'N/A'}</p>
                                {r.studentEmail ? <p className="text-sm text-slate-600 mt-1">{r.studentEmail}</p> : null}
                                <p className="text-xs text-slate-500 mt-1">Dept: {r.studentDepartment || 'N/A'}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(r.status)}`}>
                                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={r.status !== 'pending' || updatingId === r.id || !canVerify}
                                    onClick={() => handleApprove(r.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={r.status !== 'pending' || updatingId === r.id || !canVerify}
                                    onClick={() => startReject(r.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-4 h-4" /> Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                            {rejectingId === r.id ? (
                              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">Rejection reason</label>
                                <textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={4}
                                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => submitReject(r.id)}
                                    disabled={!rejectReason.trim() || updatingId === r.id}
                                    className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    Submit Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelReject}
                                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {reportsLoading ? (
                      <div className="text-sm text-slate-500">Loading reports...</div>
                    ) : reportsError ? (
                      <div className="text-sm text-rose-600">{reportsError}</div>
                    ) : reports.length === 0 ? (
                      <div className="text-center text-slate-500">
                        <Users className="mx-auto h-10 w-10" />
                        <h4 className="mt-4 text-lg font-semibold text-slate-900">No Reports Found</h4>
                        <p className="mt-2 text-sm">No competition reports submitted for this event.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div key={report.id || `${report.student_id}-${report.title_of_event}`} className="rounded-[14px] border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{report.student_name || `Student #${report.student_id}`}</p>
                                <p className="text-sm text-slate-600 mt-1">{report.title_of_event}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(report.status)}`}>
                                {(report.status || 'pending')}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                              <p>Level: {report.level_of_event || 'N/A'}</p>
                              <p>Mode: {report.individual_or_batch || 'N/A'}</p>
                              <p>Participants: {report.number_of_participants ?? 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
