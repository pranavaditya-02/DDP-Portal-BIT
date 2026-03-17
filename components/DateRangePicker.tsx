'use client'

import React from 'react'
import { CalendarDays, X } from 'lucide-react'

export interface DateRange {
  from: string // YYYY-MM-DD or ''
  to: string   // YYYY-MM-DD or ''
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  /** Optional label shown before the inputs. Defaults to "Date Range" */
  label?: string
}

export default function DateRangePicker({ value, onChange, label = 'Date Range' }: DateRangePickerProps) {
  const hasFilter = value.from || value.to

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={e => onChange({ ...value, from: e.target.value })}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-slate-300 transition-colors"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={e => onChange({ ...value, to: e.target.value })}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-slate-300 transition-colors"
        />
      </div>

      {hasFilter && (
        <button
          onClick={() => onChange({ from: '', to: '' })}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 border border-slate-200
                     hover:border-red-300 rounded-lg px-2 py-1.5 bg-white transition-colors"
          title="Clear date filter"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}

      {hasFilter && (
        <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
          Filtered
        </span>
      )}
    </div>
  )
}
