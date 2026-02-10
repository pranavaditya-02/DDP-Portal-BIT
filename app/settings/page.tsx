'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  Settings, User, Bell, Shield, Palette, Database,
  Save, Moon, Sun, Monitor, Globe, Clock, Mail,
  Key, Eye, EyeOff, ToggleLeft, ToggleRight,
} from 'lucide-react'

function SettingSection({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()

  // Profile settings
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [activityAlerts, setActivityAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  // System prefs
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [autoApprove, setAutoApprove] = useState(false)

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and system settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <SettingSection title="Profile" description="Update your personal information" icon={User}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Roles</label>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles.map(role => (
                <span key={role} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">Roles are managed by the administrator</p>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security" description="Password and authentication settings" icon={Shield}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input type="password" placeholder="Enter new password" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <input type="password" placeholder="Confirm new password" className="input-base" />
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications" description="Choose what you want to be notified about" icon={Bell}>
          <Toggle enabled={emailNotifs} onChange={setEmailNotifs} label="Email Notifications" description="Receive notifications via email" />
          <Toggle enabled={pushNotifs} onChange={setPushNotifs} label="Push Notifications" description="Browser push notifications" />
          <Toggle enabled={activityAlerts} onChange={setActivityAlerts} label="Activity Alerts" description="Get notified when activities are approved/rejected" />
          <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} label="Weekly Digest" description="Receive a weekly summary of activities" />
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance" description="Customize the look and feel" icon={Palette}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
            <div className="flex gap-2">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    theme === t.value
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-base">
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-base">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* System (Admin only) */}
        {user?.roles.includes('maintenance') && (
          <SettingSection title="System" description="Administrative system settings" icon={Database}>
            <Toggle enabled={autoApprove} onChange={setAutoApprove} label="Auto-Approve Low-Risk Activities" description="Automatically approve activities with < 15 points" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year</label>
              <select className="input-base">
                <option>2025-2026</option>
                <option>2024-2025</option>
                <option>2023-2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max File Upload Size</label>
              <select className="input-base">
                <option>5 MB</option>
                <option>10 MB</option>
                <option>25 MB</option>
              </select>
            </div>
          </SettingSection>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
