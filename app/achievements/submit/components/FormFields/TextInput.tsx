/**
 * TextInput Component - Reusable text input field
 * Uses design system classes for consistent styling
 */

import React from 'react'

interface TextInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'number'
  helpText?: string
  error?: string
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, name, value, onChange, placeholder, required = false, type = 'text', helpText, error }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'border-red-500' : ''}`}
          required={required}
        />
        {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
