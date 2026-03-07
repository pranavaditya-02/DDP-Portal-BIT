/**
 * FileUpload Component - Reusable file upload field with preview
 * Uses design system classes for consistent styling
 */

import React from 'react'
import { Upload, Trash2 } from 'lucide-react'

interface FileUploadProps {
  label: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  preview?: string
  onRemove?: () => void
  required?: boolean
  accept?: string
  helpText?: string
  error?: string
  multiple?: boolean
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, name, onChange, preview, onRemove, required = false, accept = '*/*', helpText, error, multiple = false }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className={`file-upload-area ${error ? 'border-red-500' : ''}`}>
          <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mt-1">Supported formats: {accept}</p>
          <input
            ref={ref}
            type="file"
            id={name}
            name={name}
            onChange={onChange}
            accept={accept}
            multiple={multiple}
            className="hidden"
            required={required}
          />
        </div>

        {preview && (
          <div className="mt-4 border rounded-lg p-3 bg-gray-50">
            {name.includes('image') || accept.includes('image') ? (
              <div className="flex items-center justify-between">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded"
                />
                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="btn-icon bg-red-100 text-red-500 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">File uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">Click upload button to replace</p>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="btn-icon bg-red-100 text-red-500 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {helpText && !error && preview && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'
