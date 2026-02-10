'use client'

import React, { useState, useMemo } from 'react'
import { facultyMembers, type FacultyMember } from '@/lib/mock-data'
import toast from 'react-hot-toast'
import {
  Users, Search, Plus, MoreHorizontal, Shield,
  Mail, Building2, Calendar, Edit3, Trash2, UserPlus,
  ChevronDown, X, Check,
} from 'lucide-react'

const ROLES = ['faculty', 'hod', 'dean', 'verification', 'maintenance'] as const
const DEPT_FILTER = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as const

function getRoleBadgeColor(role: string) {
  const map: Record<string, string> = {
    faculty: 'bg-blue-50 text-blue-600',
    hod: 'bg-emerald-50 text-emerald-600',
    dean: 'bg-purple-50 text-purple-600',
    verification: 'bg-amber-50 text-amber-600',
    maintenance: 'bg-red-50 text-red-600',
  }
  return map[role] || 'bg-slate-50 text-slate-600'
}

export default function UserManagementPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRoles, setEditingRoles] = useState<number | null>(null)

  // Expand faculty list with mock roles
  const usersWithRoles = useMemo(() =>
    facultyMembers.map(f => ({
      ...f,
      roles: f.designation.includes('HOD') ? ['faculty', 'hod'] :
             f.designation === 'Professor' ? ['faculty'] :
             ['faculty'],
      status: 'active' as const,
    })), [])

  const filtered = useMemo(() => {
    let data = [...usersWithRoles]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (deptFilter !== 'All') {
      data = data.filter(u => u.department === deptFilter)
    }
    return data
  }, [search, deptFilter, usersWithRoles])

  const handleRoleToggle = (userId: number, role: string) => {
    toast.success(`Role "${role}" updated`)
  }

  const handleDeleteUser = (userId: number, name: string) => {
    toast.success(`User "${name}" deactivated`)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-fit"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: usersWithRoles.length, color: 'text-blue-600' },
          { label: 'Active', value: usersWithRoles.filter(u => u.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Departments', value: new Set(usersWithRoles.map(u => u.department)).size, color: 'text-purple-600' },
          { label: 'With HOD Role', value: usersWithRoles.filter(u => u.roles.includes('hod')).length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="input-base w-full sm:w-44"
        >
          {DEPT_FILTER.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-50 bg-slate-50/50">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2">Designation</div>
          <div className="col-span-3">Roles</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((user) => (
            <div key={user.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
              {/* User info */}
              <div className="lg:col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Department */}
              <div className="lg:col-span-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{user.department}</span>
              </div>

              {/* Designation */}
              <div className="lg:col-span-2">
                <p className="text-sm text-slate-600">{user.designation}</p>
              </div>

              {/* Roles */}
              <div className="lg:col-span-3">
                <div className="flex flex-wrap gap-1">
                  {user.roles.map(role => (
                    <span key={role} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getRoleBadgeColor(role)}`}>
                      {role}
                    </span>
                  ))}
                  <button
                    onClick={() => setEditingRoles(editingRoles === user.id ? null : user.id)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Inline role editor */}
                {editingRoles === user.id && (
                  <div className="mt-2 flex flex-wrap gap-1 animate-fade-in">
                    {ROLES.map(role => {
                      const has = user.roles.includes(role)
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleToggle(user.id, role)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                            has
                              ? 'border-blue-200 bg-blue-50 text-blue-600'
                              : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {has && <Check className="w-3 h-3 inline mr-1" />}
                          {role}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="lg:col-span-2 flex justify-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Deactivate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); toast.success('User created!') }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" placeholder="Dr. John Doe" className="input-base" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" placeholder="john@bit.edu" className="input-base" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select className="input-base">
                    {DEPT_FILTER.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Designation</label>
                  <input type="text" placeholder="Assistant Professor" className="input-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" defaultChecked={role === 'faculty'} className="rounded" />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
