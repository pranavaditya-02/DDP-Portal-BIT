'use client'

import React, { useState, useMemo } from 'react'
import { pendingActivities, type Activity } from '@/lib/mock-data'
import toast from 'react-hot-toast'
import {
  ShieldCheck, Search, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp, User, Building2, Calendar,
  Tag, Award, MessageSquare, ExternalLink, Filter,
} from 'lucide-react'

type ReviewAction = 'approve' | 'reject' | null

function VerificationCard({
  activity,
  onAction,
}: {
  activity: Activity
  onAction: (id: number, action: 'approve' | 'reject', reason?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  return (
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
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? 'Less details' : 'More details'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100 mt-0 animate-fade-in">
          <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">Category</p>
              <p className="font-medium text-slate-700">{activity.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Faculty ID</p>
              <p className="font-medium text-slate-700">#{activity.facultyId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Submission Date</p>
              <p className="font-medium text-slate-700">{activity.date}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Points Requested</p>
              <p className="font-medium text-slate-700">{activity.points}</p>
            </div>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-3 gap-4 mb-6">
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
