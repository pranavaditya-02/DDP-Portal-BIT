/**
 * TextArea Component - Reusable textarea field
 * Uses design system classes for consistent styling
 */

import React from 'react'

interface TextAreaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  rows?: number
  helpText?: string
  error?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, name, value, onChange, placeholder, required = false, rows = 4, helpText, error }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`form-input resize-vertical ${error ? 'border-red-500' : ''}`}
          required={required}
        />
        {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
