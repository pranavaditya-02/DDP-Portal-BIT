'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react'
import { systemUsers, type SystemUser } from '@/lib/mock-data'
import { roles } from '@/lib/mock-data'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import {
  Users, Search, Plus, Edit3, Trash2, X, Check,
  UserCheck, UserX, ChevronDown, Info, Mail,
  Building2, Shield, User, KeyRound, Upload,
  FileSpreadsheet, AlertCircle, Download, Hash,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────
const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Admin']

const roleColors: Record<string, string> = {
  faculty: 'bg-blue-50 text-blue-700 border-blue-200',
  hod: 'bg-purple-50 text-purple-700 border-purple-200',
  dean: 'bg-amber-50 text-amber-700 border-amber-200',
  verification: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  maintenance: 'bg-red-50 text-red-700 border-red-200',
}

const roleLabel: Record<string, string> = {
  faculty: 'Faculty',
  hod: 'HOD',
  dean: 'Dean',
  verification: 'Verification',
  maintenance: 'Maintenance',
}

function RoleBadge({ role }: { role: string }) {
  const color = roleColors[role] ?? 'bg-slate-50 text-slate-700 border-slate-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
      <Shield className="w-2.5 h-2.5" />
      {roleLabel[role] ?? role}
    </span>
  )
}

// ─── Add / Edit Modal ────────────────────────────────────────
interface UserFormData {
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  role: string
  status: 'active' | 'inactive'
}

function UserModal({
  user, onClose, onSave,
}: {
  user: SystemUser | null
  onClose: () => void
  onSave: (data: UserFormData) => void
}) {
  const [form, setForm] = useState<UserFormData>({
    facultyId: user?.facultyId ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    department: user?.department ?? 'CSE',
    designation: user?.designation ?? '',
    role: user?.role ?? 'faculty',
    status: user?.status ?? 'active',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

  const set = (field: keyof UserFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs: Partial<Record<keyof UserFormData, string>> = {}
    if (!form.facultyId.trim()) errs.facultyId = 'Faculty ID is required'
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.designation.trim()) errs.designation = 'Designation is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSave(form)
  }

  const currentRole = roles.find(r => r.name.toLowerCase() === form.role)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user ? 'Edit User' : 'Add New User'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {user ? `Editing ${user.name}` : 'Create a new user account'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Faculty ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Faculty ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.facultyId}
                onChange={e => set('facultyId', e.target.value.toUpperCase())}
                placeholder="e.g. BIT-CSE-001"
                className={`input-base pl-9 ${errors.facultyId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
            </div>
            {errors.facultyId && <p className="text-xs text-red-500 mt-1">{errors.facultyId}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Dr. John Smith"
                className={`input-base pl-9 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="user@bit.edu"
                className={`input-base pl-9 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.designation}
              onChange={e => set('designation', e.target.value)}
              placeholder="e.g. Associate Professor"
              className={`input-base ${errors.designation ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>}
          </div>

          {/* Department + Role row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  className="input-base pl-9 appearance-none pr-8"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={form.role}
                  onChange={e => set('role', e.target.value)}
                  className="input-base pl-9 appearance-none pr-8"
                >
                  {Object.entries(roleLabel).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Role info */}
          {currentRole && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">{currentRole.description} — access to {currentRole.resources.length} resource{currentRole.resources.length !== 1 ? 's' : ''}.</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <div className="flex gap-3">
              {(['active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.status === s
                      ? s === 'active' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s === 'active' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Password hint for new users */}
          {!user && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <KeyRound className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                A temporary password will be auto-generated based on the selected role prefix and sent to the user&apos;s email.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">
            <Check className="w-4 h-4" />
            {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirm({ user, onClose, onConfirm }: { user: SystemUser; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete User</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-1">
          Are you sure you want to delete <span className="font-bold">{user.name}</span>?
        </p>
        <p className="text-xs text-slate-400">{user.email}</p>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />Delete User
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Bulk Import Modal ────────────────────────────────────────
interface ParsedRow {
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  role: string
  status: string
  _errors: string[]
}

const REQUIRED_COLS = ['facultyId', 'name', 'email', 'department', 'designation', 'role']
const VALID_ROLES = Object.keys(roleLabel)
const VALID_STATUS = ['active', 'inactive']

function validateRow(row: Record<string, string>): ParsedRow {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const val = (row[k] ?? '').toString().trim()
      if (val) return val
    }
    return ''
  }
  const errs: string[] = []

  const facultyId = get('facultyId', 'faculty_id', 'Faculty ID', 'FacultyID', 'faculty id')
  const name = get('name', 'Name', 'full_name', 'Full Name')
  const email = get('email', 'Email')
  const department = get('department', 'Department', 'dept', 'Dept')
  const designation = get('designation', 'Designation')
  const role = get('role', 'Role').toLowerCase()
  const status = get('status', 'Status').toLowerCase() || 'active'

  if (!facultyId) errs.push('Faculty ID missing')
  if (!name) errs.push('Name missing')
  if (!email) errs.push('Email missing')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Invalid email')
  if (!department) errs.push('Department missing')
  else if (!DEPARTMENTS.map(d => d.toLowerCase()).includes(department.toLowerCase())) errs.push(`Unknown dept "${department}"`)
  if (!designation) errs.push('Designation missing')
  if (!role) errs.push('Role missing')
  else if (!VALID_ROLES.includes(role)) errs.push(`Unknown role "${role}"`)
  if (status && !VALID_STATUS.includes(status)) errs.push(`Unknown status "${status}"`)

  return { facultyId, name, email, department, designation, role, status: VALID_STATUS.includes(status) ? status : 'active', _errors: errs }
}

function BulkImportModal({ existingUsers, onClose, onImport }: {
  existingUsers: SystemUser[]
  onClose: () => void
  onImport: (users: Omit<SystemUser, 'id' | 'joinedDate'>[]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [parsed, setParsed] = useState(false)

  const parseData = useCallback((data: Record<string, string>[]) => {
    const result = data.map(r => validateRow(r))
    setRows(result)
    setParsed(true)
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    setFileName(file.name)
    setParsed(false)
    setRows([])

    if (ext === 'csv') {
      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) { toast.error('CSV is empty or has no data rows'); return }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const dataRows = lines.slice(1)
          .map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
            return obj
          })
          .filter(r => Object.values(r).some(v => v))
        parseData(dataRows)
      }
      reader.readAsText(file)
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = e => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
        parseData(json)
      }
      reader.readAsArrayBuffer(file)
    } else {
      toast.error('Only CSV, XLSX or XLS files are supported')
    }
  }, [parseData])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const validRows = rows.filter(r => r._errors.length === 0)
  const errorRows = rows.filter(r => r._errors.length > 0)

  const existingIds = new Set(existingUsers.map(u => u.facultyId.toLowerCase()))
  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()))
  const duplicates = validRows.filter(r =>
    existingIds.has(r.facultyId.toLowerCase()) || existingEmails.has(r.email.toLowerCase())
  )
  const importable = validRows.filter(r =>
    !existingIds.has(r.facultyId.toLowerCase()) && !existingEmails.has(r.email.toLowerCase())
  )

  const handleImport = () => {
    if (importable.length === 0) { toast.error('No new users to import'); return }
    onImport(importable.map(r => ({
      facultyId: r.facultyId,
      name: r.name,
      email: r.email,
      department: r.department,
      designation: r.designation,
      role: r.role,
      status: r.status as 'active' | 'inactive',
    })))
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['facultyId', 'name', 'email', 'department', 'designation', 'role', 'status'],
      ['BIT-CSE-099', 'Dr. Sample Name', 'sample@bit.edu', 'CSE', 'Assistant Professor', 'faculty', 'active'],
      ['BIT-IT-099', 'Prof. Another User', 'another@bit.edu', 'IT', 'Associate Professor', 'hod', 'active'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')
    XLSX.writeFile(wb, 'users_import_template.xlsx')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bulk Import Users</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV or Excel file to add multiple users at once</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-600 font-medium">Download the template to ensure correct column format</span>
            </div>
            <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
              <Download className="w-3.5 h-3.5" />Template
            </button>
          </div>

          {/* Column info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p>Required columns: <span className="font-semibold">{REQUIRED_COLS.join(', ')}</span></p>
              <p>Valid roles: {VALID_ROLES.join(', ')} &nbsp;|&nbsp; Valid departments: {DEPARTMENTS.join(', ')}</p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-slate-300'}`} />
            {fileName ? (
              <p className="text-sm font-medium text-slate-700">{fileName}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-600">Drop your file here, or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx, .xls</p>
              </>
            )}
          </div>

          {/* Parse results */}
          {parsed && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-lg font-bold text-slate-900">{rows.length}</p>
                  <p className="text-[11px] text-slate-500">Total Rows</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-lg font-bold text-emerald-700">{importable.length}</p>
                  <p className="text-[11px] text-emerald-600">Ready to Import</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-lg font-bold text-red-600">{errorRows.length + duplicates.length}</p>
                  <p className="text-[11px] text-red-500">Skipped</p>
                </div>
              </div>

              {/* Duplicates */}
              {duplicates.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">{duplicates.length} duplicate(s) skipped</p>
                    <p className="text-xs text-amber-600 mt-0.5">{duplicates.map(d => `${d.facultyId} (${d.email})`).join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Row errors */}
              {errorRows.length > 0 && (
                <div className="border border-red-100 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600">{errorRows.length} row(s) with errors — will be skipped</span>
                  </div>
                  <div className="divide-y divide-red-50 max-h-36 overflow-y-auto">
                    {errorRows.map((r, i) => (
                      <div key={i} className="px-3 py-2">
                        <p className="text-xs font-medium text-slate-700">{r.name || r.email || `Row ${i + 1}`}</p>
                        <p className="text-[11px] text-red-500">{r._errors.join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {importable.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Preview — {importable.length} user{importable.length !== 1 ? 's' : ''} will be added
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {importable.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">{r.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{r.name}</p>
                          <p className="text-[11px] text-slate-400">{r.email}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:block">{r.facultyId}</span>
                        <RoleBadge role={r.role} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button
            onClick={handleImport}
            disabled={!parsed || importable.length === 0}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import {parsed && importable.length > 0 ? `${importable.length} User${importable.length !== 1 ? 's' : ''}` : 'Users'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
  const [userList, setUserList] = useState<SystemUser[]>(systemUsers)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editUser, setEditUser] = useState<SystemUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<SystemUser | null>(null)

  const filtered = useMemo(() => {
    return userList.filter(u => {
      const matchSearch = search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase()) ||
        u.facultyId.toLowerCase().includes(search.toLowerCase())
      const matchRole = filterRole === 'all' || u.role === filterRole
      const matchStatus = filterStatus === 'all' || u.status === filterStatus
      return matchSearch && matchRole && matchStatus
    })
  }, [userList, search, filterRole, filterStatus])

  const stats = useMemo(() => ({
    total: userList.length,
    active: userList.filter(u => u.status === 'active').length,
    inactive: userList.filter(u => u.status === 'inactive').length,
    byRole: Object.entries(roleLabel).map(([key, label]) => ({
      key, label, count: userList.filter(u => u.role === key).length,
    })),
  }), [userList])

  const handleSave = (data: UserFormData) => {
    if (editUser) {
      setUserList(prev => prev.map(u => u.id === editUser.id ? { ...u, ...data } : u))
      toast.success('User updated successfully')
      setEditUser(null)
    } else {
      const newUser: SystemUser = {
        ...data,
        id: Math.max(0, ...userList.map(u => u.id)) + 1,
        joinedDate: new Date().toISOString().split('T')[0],
      }
      setUserList(prev => [newUser, ...prev])
      toast.success('User added successfully')
      setShowAddModal(false)
    }
  }

  const handleDelete = () => {
    if (!deleteUser) return
    setUserList(prev => prev.filter(u => u.id !== deleteUser.id))
    toast.success(`${deleteUser.name} has been removed`)
    setDeleteUser(null)
  }

  const handleBulkImport = (newUsers: Omit<SystemUser, 'id' | 'joinedDate'>[]) => {
    const today = new Date().toISOString().split('T')[0]
    let nextId = Math.max(0, ...userList.map(u => u.id)) + 1
    const usersToAdd: SystemUser[] = newUsers.map(u => ({
      ...u,
      id: nextId++,
      joinedDate: today,
    }))
    setUserList(prev => [...usersToAdd, ...prev])
    toast.success(`${usersToAdd.length} user${usersToAdd.length !== 1 ? 's' : ''} imported successfully`)
    setShowBulkModal(false)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage all system users and their roles</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={() => setShowBulkModal(true)} className="btn-outline">
            <Upload className="w-4 h-4" />Bulk Import
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Inactive</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Roles in Use</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.byRole.filter(r => r.count > 0).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, faculty ID or department…"
            className="input-base pl-9"
          />
        </div>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="input-base pl-9 pr-8 appearance-none min-w-[140px]">
            <option value="all">All Roles</option>
            {Object.entries(roleLabel).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base pl-9 pr-8 appearance-none min-w-[130px]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Faculty ID</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Department</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No users match your search.
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{u.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm leading-tight">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{u.facultyId}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div>
                      <p className="text-slate-700 font-medium">{u.department}</p>
                      <p className="text-xs text-slate-400">{u.designation}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit user"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteUser(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
            Showing {filtered.length} of {userList.length} users
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowAddModal(false); setEditUser(null) }}
          onSave={handleSave}
        />
      )}
      {deleteUser && (
        <DeleteConfirm user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} />
      )}
      {showBulkModal && (
        <BulkImportModal
          existingUsers={userList}
          onClose={() => setShowBulkModal(false)}
          onImport={handleBulkImport}
        />
      )}
    </div>
  )
}
