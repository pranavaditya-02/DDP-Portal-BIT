/**
 * DateInput Component - Reusable date input field
 * Uses design system classes for consistent styling
 */

import React from 'react'
import { Calendar } from 'lucide-react'

interface DateInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
  helpText?: string
  error?: string
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, name, value, onChange, placeholder, required = false, min, max, helpText, error }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={ref}
            type="date"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`form-input pl-10 ${error ? 'border-red-500' : ''}`}
            required={required}
          />
        </div>
        {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
