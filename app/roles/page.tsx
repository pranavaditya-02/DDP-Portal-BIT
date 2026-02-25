'use client'

import React, { useState, useMemo } from 'react'
import {
  roles as initialRoles,
  availableResources,
  type Role,
  type Resource,
} from '@/lib/mock-data'
import toast from 'react-hot-toast'
import {
  Shield, Plus, Pencil, Trash2, Search, X, Check,
  ChevronDown, ChevronRight, ChevronLeft, Save,
  LayoutDashboard, FileText, Award, Clipboard,
  Building2, Trophy, GraduationCap, ShieldCheck, Settings,
  Filter, ArrowUpDown,
} from 'lucide-react'

/* ---- Icon mapping for resources ---- */
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Award, Clipboard, Building2, Trophy,
  GraduationCap, ShieldCheck, Shield, Settings,
}
function ResourceIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] || Shield
  return <Icon className="w-4 h-4" />
}

/* ---- Group resources by their group name ---- */
const resourceGroups = availableResources.reduce<Record<string, Resource[]>>((acc, r) => {
  ;(acc[r.group] ??= []).push(r)
  return acc
}, {})

/* ---- Sort column type ---- */
type SortKey = 'id' | 'name' | 'passwordPrefix' | 'editAccess' | 'deleteAccess' | 'status'
type SortDir = 'asc' | 'desc'

/* ---- Pagination ---- */
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

/* ================================================================ */
/*  ADD / EDIT ROLE MODAL                                            */
/* ================================================================ */
function RoleModal({
  role,
  onClose,
  onSave,
}: {
  role: Role | null
  onClose: () => void
  onSave: (role: Role) => void
}) {
  const isNew = !role
  const [name, setName] = useState(role?.name || '')
  const [passwordPrefix, setPasswordPrefix] = useState(role?.passwordPrefix || '')
  const [editAccess, setEditAccess] = useState(role?.editAccess ?? false)
  const [deleteAccess, setDeleteAccess] = useState(role?.deleteAccess ?? false)
  const [selectedResources, setSelectedResources] = useState<string[]>(role?.resources || [])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  const toggleGroupCheck = (group: string) => {
    const groupIds = resourceGroups[group].map((r) => r.id)
    const allSelected = groupIds.every((id) => selectedResources.includes(id))
    if (allSelected) {
      setSelectedResources((prev) => prev.filter((id) => !groupIds.includes(id)))
    } else {
      setSelectedResources((prev) => [...new Set([...prev, ...groupIds])])
    }
  }

  const toggleResource = (id: string) => {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const selectedCountForGroup = (group: string) =>
    resourceGroups[group].filter((r) => selectedResources.includes(r.id)).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Role name is required')
      return
    }
    onSave({
      id: role?.id || Date.now(),
      name: name.trim(),
      description: role?.description || '',
      passwordPrefix: passwordPrefix.trim(),
      editAccess,
      deleteAccess,
      status: role?.status ?? true,
      resources: selectedResources,
      isSystem: role?.isSystem || false,
      createdAt: role?.createdAt || new Date().toISOString().slice(0, 10),
      usersCount: role?.usersCount || 0,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {isNew ? 'Add New Role' : 'Edit Role'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
                className="input-base"
                autoFocus
              />
            </div>

            {/* Password Prefix */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Prefix</label>
              <input
                type="text"
                value={passwordPrefix}
                onChange={(e) => setPasswordPrefix(e.target.value)}
                placeholder='Example: "fc" (password becomes fc + username)'
                className="input-base"
              />
            </div>

            {/* Edit Access */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Edit Access</label>
              <div className="relative">
                <select
                  value={editAccess ? 'Yes' : 'No'}
                  onChange={(e) => setEditAccess(e.target.value === 'Yes')}
                  className="input-base appearance-none pr-10"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Delete Access */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Delete Access</label>
              <div className="relative">
                <select
                  value={deleteAccess ? 'Yes' : 'No'}
                  onChange={(e) => setDeleteAccess(e.target.value === 'Yes')}
                  className="input-base appearance-none pr-10"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Assign Resources */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Assign Resources <span className="text-red-500">*</span>
              </label>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {Object.entries(resourceGroups).map(([group, resources]) => {
                  const isExpanded = expandedGroups[group] || false
                  const groupIds = resources.map((r) => r.id)
                  const allSelected = groupIds.every((id) => selectedResources.includes(id))
                  const someSelected = groupIds.some((id) => selectedResources.includes(id)) && !allSelected
                  const selectedCount = selectedCountForGroup(group)

                  return (
                    <div key={group} className="border-b border-slate-100 last:border-b-0">
                      {/* Group row */}
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleGroupCheck(group)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                            allSelected
                              ? 'bg-blue-600 border-blue-600'
                              : someSelected
                              ? 'bg-blue-200 border-blue-400'
                              : 'border-slate-300'
                          }`}
                        >
                          {(allSelected || someSelected) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>

                        {/* Expand arrow */}
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {/* Group icon & name */}
                        <ResourceIcon name={resources[0]?.icon || 'Shield'} />
                        <span className="text-sm font-medium text-slate-800 flex-1">{group}</span>
                        <span className="text-xs text-slate-400">
                          {selectedCount}/{groupIds.length}
                        </span>
                      </div>

                      {/* Expanded resource items */}
                      {isExpanded && (
                        <div className="bg-slate-50/50 border-t border-slate-100">
                          {resources.map((r) => {
                            const checked = selectedResources.includes(r.id)
                            return (
                              <label
                                key={r.id}
                                className={`flex items-center gap-3 pl-16 pr-4 py-2.5 cursor-pointer transition-colors ${
                                  checked ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                                    checked
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {checked && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <ResourceIcon name={r.icon} />
                                <span className="text-sm text-slate-700">{r.label}</span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleResource(r.id)}
                                  className="sr-only"
                                />
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Selected: {selectedResources.length} menu items
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4">
            <button type="submit" className="w-full btn-primary py-3 text-sm font-semibold">
              <Save className="w-4 h-4" />
              {isNew ? 'Add Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---- Delete Confirmation ---- */
function DeleteModal({
  role,
  onClose,
  onConfirm,
}: {
  role: Role
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Role</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>&ldquo;{role.name}&rdquo;</strong>?{' '}
          {role.usersCount > 0 && (
            <span className="text-red-600">
              {role.usersCount} users currently have this role.
            </span>
          )}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete Role
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================ */
/*  SORTABLE COLUMN HEADER                                           */
/* ================================================================ */
function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
}) {
  const isActive = currentSort === sortKey
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 text-left hover:text-slate-700 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
      />
    </button>
  )
}

/* ================================================================ */
/*  MAIN PAGE                                                        */
/* ================================================================ */
export default function RolesPage() {
  const [rolesList, setRolesList] = useState<Role[]>(initialRoles)
  const [editingRole, setEditingRole] = useState<Role | null | 'new'>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  /* ---- Sort handler ---- */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  /* ---- Filtered + sorted data ---- */
  const processed = useMemo(() => {
    let data = [...rolesList]
    // search
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.passwordPrefix.toLowerCase().includes(q) ||
          String(r.id).includes(q)
      )
    }
    // sort
    data.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'id': cmp = a.id - b.id; break
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'passwordPrefix': cmp = a.passwordPrefix.localeCompare(b.passwordPrefix); break
        case 'editAccess': cmp = Number(a.editAccess) - Number(b.editAccess); break
        case 'deleteAccess': cmp = Number(a.deleteAccess) - Number(b.deleteAccess); break
        case 'status': cmp = Number(a.status) - Number(b.status); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [rolesList, searchTerm, sortKey, sortDir])

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(processed.length / rowsPerPage))
  const paginated = processed.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  /* ---- Handlers ---- */
  const handleSave = (saved: Role) => {
    setRolesList((prev) => {
      const exists = prev.find((r) => r.id === saved.id)
      if (exists) {
        toast.success(`Role "${saved.name}" updated`)
        return prev.map((r) => (r.id === saved.id ? saved : r))
      }
      toast.success(`Role "${saved.name}" created`)
      return [...prev, saved]
    })
    setEditingRole(null)
  }

  const handleDelete = () => {
    if (!deletingRole) return
    setRolesList((prev) => prev.filter((r) => r.id !== deletingRole.id))
    toast.success(`Role "${deletingRole.name}" deleted`)
    setDeletingRole(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-600" />
            Manage Roles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage user roles with specific resource access
          </p>
        </div>
        <button
          onClick={() => setEditingRole('new')}
          className="btn-primary self-start"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3 w-16">S. No</th>
                <th className="text-left px-4 py-3 w-24">
                  <SortHeader label="Role ID" sortKey="id" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-3">
                  <SortHeader label="Role Name" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-3">
                  <SortHeader label="Password Prefix" sortKey="passwordPrefix" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-center px-4 py-3">
                  <SortHeader label="Edit Access" sortKey="editAccess" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-center px-4 py-3">
                  <SortHeader label="Delete Access" sortKey="deleteAccess" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-center px-4 py-3">
                  <SortHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-center px-4 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      {searchTerm ? 'No roles match your search' : 'No roles yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((role, idx) => (
                  <tr
                    key={role.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-slate-500">{(page - 1) * rowsPerPage + idx + 1}</td>
                    <td className="px-4 py-4 text-slate-700 font-medium">{role.id}</td>
                    <td className="px-4 py-4 text-slate-800 font-medium">{role.name}</td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-xs">{role.passwordPrefix || '—'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${role.editAccess ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {role.editAccess ? '1' : '0'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${role.deleteAccess ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {role.deleteAccess ? '1' : '0'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${role.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {role.status ? '1' : '0'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingRole(role)}
                          title="Edit role"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingRole(role)}
                          title="Delete role"
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-slate-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingRole && (
        <RoleModal
          role={editingRole === 'new' ? null : editingRole}
          onClose={() => setEditingRole(null)}
          onSave={handleSave}
        />
      )}
      {deletingRole && (
        <DeleteModal
          role={deletingRole}
          onClose={() => setDeletingRole(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
