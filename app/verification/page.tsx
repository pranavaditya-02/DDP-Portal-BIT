'use client'

import React, { useState, useMemo } from 'react'
import { pendingActivities, type Activity } from '@/lib/mock-data'
import toast from 'react-hot-toast'
import {
  ShieldCheck, Search, CheckCircle2, XCircle, Clock,
  User, Building2, Calendar,
  Tag, ExternalLink,
  Eye, X, Hash, FileText, Layers, Star,
} from 'lucide-react'

type ReviewAction = 'approve' | 'reject' | null

/* ── Detail Dialog ── */
function ActivityDetailDialog({
  activity,
  open,
  onClose,
}: {
  activity: Activity
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            Activity Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Title</p>
            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<User className="w-3.5 h-3.5" />}   label="Faculty Name" value={activity.facultyName || '—'} />
            <DetailItem icon={<Hash className="w-3.5 h-3.5" />}   label="Faculty ID"   value={activity.facultyId ? `#${activity.facultyId}` : '—'} />
            <DetailItem icon={<Building2 className="w-3.5 h-3.5" />} label="Department" value={activity.department || '—'} />
            <DetailItem icon={<FileText className="w-3.5 h-3.5" />}  label="Type"       value={activity.type} />
            <DetailItem icon={<Layers className="w-3.5 h-3.5" />}    label="Category"   value={activity.category} />
            <DetailItem icon={<Calendar className="w-3.5 h-3.5" />}  label="Date"       value={activity.date} />
            <DetailItem icon={<Star className="w-3.5 h-3.5" />}      label="Points"     value={`${activity.points} pts`} highlight />
            <DetailItem icon={<Clock className="w-3.5 h-3.5" />}     label="Status"     value={activity.status.charAt(0).toUpperCase() + activity.status.slice(1)} statusColor={
              activity.status === 'approved' ? 'text-emerald-600' : activity.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
            } />
          </div>

          {activity.proofUrl && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Proof / Document</p>
              <a
                href={activity.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View attached proof
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
  highlight,
  statusColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  statusColor?: string
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-sm font-semibold ${statusColor || (highlight ? 'text-blue-700' : 'text-slate-800')}`}>
        {value}
      </p>
    </div>
  )
}

/* ── Verification Card ── */
function VerificationCard({
  activity,
  onAction,
}: {
  activity: Activity
  onAction: (id: number, action: 'approve' | 'reject', reason?: string) => void
}) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
    <ActivityDetailDialog activity={activity} open={showDetail} onClose={() => setShowDetail(false)} />
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-all duration-200">
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{activity.title}</h3>
            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{activity.facultyName}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{activity.department}</span>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{activity.type}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{activity.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              +{activity.points}
            </span>
            <button
              onClick={() => setShowDetail(true)}
              title="View full details"
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onAction(activity.id, 'approve')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-red-600 border border-red-200 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>

      {/* Rejection form */}
      {showRejectForm && (
        <div className="px-5 pb-5 border-t border-slate-100 animate-fade-in">
          <div className="pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Rejection *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Please provide a reason for rejecting this activity..."
              className="input-base resize-none text-sm"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setShowRejectForm(false); setRejectionReason('') }}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) { toast.error('Please provide a reason'); return }
                  onAction(activity.id, 'reject', rejectionReason)
                  setShowRejectForm(false)
                  setRejectionReason('')
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default function VerificationPage() {
  const [search, setSearch] = useState('')
  const [queue, setQueue] = useState(pendingActivities)

  const filtered = useMemo(() => {
    if (!search) return queue
    const q = search.toLowerCase()
    return queue.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.facultyName?.toLowerCase().includes(q) ||
      a.department?.toLowerCase().includes(q)
    )
  }, [search, queue])

  const handleAction = (id: number, action: 'approve' | 'reject', reason?: string) => {
    setQueue(prev => prev.filter(a => a.id !== id))
    if (action === 'approve') {
      toast.success('Activity approved successfully')
    } else {
      toast.success('Activity rejected')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          Verification Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve faculty activity submissions</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-xl font-bold text-amber-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{queue.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Reviewed Today</p>
          <p className="text-xl font-bold text-emerald-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>4</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Approval Rate</p>
          <p className="text-xl font-bold text-blue-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>87%</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, faculty name, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending activities to review</p>
          </div>
        ) : (
          filtered.map((act) => (
            <VerificationCard key={act.id} activity={act} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  )
}
