'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Mail, Lock, Loader2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Faculty', email: 'faculty@bit.edu', name: 'Dr. Priya Sharma', roles: ['faculty'], departmentId: 1, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { label: 'HOD', email: 'hod@bit.edu', name: 'Dr. Rajesh Kumar', roles: ['faculty', 'hod'], departmentId: 1, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { label: 'Dean', email: 'dean@bit.edu', name: 'Dr. Anitha Devi', roles: ['faculty', 'dean'], departmentId: undefined, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  { label: 'Verification', email: 'verify@bit.edu', name: 'Prof. Suresh Babu', roles: ['faculty', 'verification'], departmentId: 1, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { label: 'Admin', email: 'admin@bit.edu', name: 'Admin User', roles: ['maintenance'], departmentId: undefined, color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiClient.login(email, password)
      setToken(response.token)
      setUser(response.user)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    setIsLoading(true)
    // Simulate a demo token for client-side navigation
    const demoToken = `demo-${account.roles[0]}-${Date.now()}`
    setToken(demoToken)
    setUser({
      id: DEMO_ACCOUNTS.indexOf(account) + 1,
      email: account.email,
      name: account.name,
      roles: account.roles,
      departmentId: account.departmentId,
    })
    toast.success(`Logged in as ${account.label} (Demo)`)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fadeInUp">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow duration-300 hover-scale">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Faculty Achievement Tracking System</p>
        </div>

        {/* Login Form Card - Glassmorphism */}
        <div className="card-modern-glass dark:card-modern-glass p-8 space-y-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern pl-12"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern pl-12"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm animate-fadeInUp" style={{ animationDelay: '250ms' }}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 cursor-pointer accent-blue-600" />
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
              </label>
              <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gradient py-3 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed animate-fadeInUp"
              style={{ animationDelay: '300ms' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
            <div className="divider-gradient" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
              Or try a demo
            </span>
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-2 gap-3 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            {DEMO_ACCOUNTS.map((account, idx) => (
              <button
                key={account.label}
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin(account)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:-translate-y-1 active:scale-95 font-medium text-xs animate-fadeInUp ${account.color}`}
                style={{ animationDelay: `${450 + idx * 50}ms` }}
              >
                <UserCheck className="w-4 h-4" />
                <div className="text-center">
                  <div className="font-semibold">{account.label}</div>
                  <div className="opacity-70 font-normal text-[10px]">{account.name.split(' ')[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8 animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
