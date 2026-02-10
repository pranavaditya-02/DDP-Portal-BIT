'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  FileText, Upload, Calendar, Tag, Award, Info,
  ChevronLeft, Loader2, CheckCircle2, Link2,
} from 'lucide-react'
import Link from 'next/link'

const ACTIVITY_TYPES = [
  { id: 1, label: 'Journal Publication', category: 'Research', points: '30-50' },
  { id: 2, label: 'Conference Paper', category: 'Research', points: '20-35' },
  { id: 3, label: 'Patent', category: 'Research', points: '50-75' },
  { id: 4, label: 'Book Chapter', category: 'Research', points: '25-40' },
  { id: 5, label: 'FDP/Workshop', category: 'Professional Development', points: '15-20' },
  { id: 6, label: 'Certification', category: 'Professional Development', points: '10-20' },
  { id: 7, label: 'Guest Lecture', category: 'Teaching', points: '10-25' },
  { id: 8, label: 'Student Mentoring', category: 'Teaching', points: '15-20' },
  { id: 9, label: 'Event Organized', category: 'Service', points: '20-30' },
  { id: 10, label: 'Consultancy', category: 'Industry', points: '30-45' },
]

export default function SubmitActivityPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    activityTypeId: '',
    title: '',
    description: '',
    activityDate: '',
    proofUrl: '',
  })

  const selectedType = ACTIVITY_TYPES.find(t => t.id === Number(form.activityTypeId))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.activityTypeId || !form.title || !form.activityDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Activity submitted for verification!')
    setIsSubmitting(false)
    router.push('/activities')
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/activities" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Activities
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit New Activity</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the details below. Your submission will be reviewed by the verification team.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            Activity Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Activity Type *</label>
            <select
              name="activityTypeId"
              value={form.activityTypeId}
              onChange={handleChange}
              className="input-base"
              required
            >
              <option value="">Select an activity type…</option>
              {ACTIVITY_TYPES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.category}) — {t.points} pts
                </option>
              ))}
            </select>
          </div>

          {selectedType && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-blue-700">
                <strong>{selectedType.category}</strong> — Expected points: <strong>{selectedType.points}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder='e.g., "Published paper in IEEE Transactions"'
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide additional details about your activity..."
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Activity Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                name="activityDate"
                value={form.activityDate}
                onChange={handleChange}
                className="input-base pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Proof */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-500" />
            Supporting Evidence
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Proof Document URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                name="proofUrl"
                value={form.proofUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="input-base pl-10"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Provide a link to your certificate, publication DOI, or any supporting document.
            </p>
          </div>

          {/* Drop zone placeholder */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">Drag & drop files here</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOC, or images up to 10 MB</p>
            <button type="button" className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700">
              Browse Files
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/activities"
            className="btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Activity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
