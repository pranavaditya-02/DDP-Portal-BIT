/**
 * SelectInput Component - Reusable select/dropdown field
 * Uses design system classes for consistent styling
 */

import React from 'react'

interface SelectOption {
  label: string
  value: string
}

interface SelectInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: readonly SelectOption[] | readonly string[] | SelectOption[] | string[]
  placeholder?: string
  required?: boolean
  helpText?: string
  error?: string
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, name, value, onChange, options, placeholder, required = false, helpText, error }, ref) => {
    // Normalize options to always be SelectOption[]
    const normalizedOptions = options && (options as any).length > 0
      ? typeof (options as any)[0] === 'string'
        ? Array.prototype.slice.call(options).map((opt: any) => ({ label: opt, value: opt }))
        : Array.prototype.slice.call(options) as SelectOption[]
      : []

    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select ${error ? 'border-red-500' : ''}`}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

SelectInput.displayName = 'SelectInput'
