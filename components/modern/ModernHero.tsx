import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export const ModernHero: React.FC = () => {
  const features = [
    'Real-time Achievement Tracking',
    'Role-based Analytics Dashboard',
    'Automated Workflow Management',
    'Advanced Reporting & Insights',
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-950 relative overflow-hidden pt-20 pb-32">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pre-header */}
        <div className="flex justify-center mb-8 animate-fadeInDown">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Introducing Modern Design v2.0
            </span>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-4 animate-fadeInUp">
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                <span className="block text-slate-900 dark:text-white">Faculty Achievement</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Tracking Reimagined
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg">
                Experience the future of faculty achievement management with our
                modern, intuitive platform built for excellence.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              {features.map((feature, idx) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-slate-700 dark:text-slate-300 animate-slideInLeft"
                  style={{ animationDelay: `${400 + idx * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover-lift active:scale-95"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                type="button"
                className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover-lift active:scale-95"
              >
                See Features
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-700/50 animate-fadeInUp" style={{ animationDelay: '1000ms' }}>
              {[
                { value: '500+', label: 'Active Users' },
                { value: '50K+', label: 'Achievements' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.value} className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-float" style={{ animationDelay: '500ms' }}>
            {/* Gradient background card */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-2xl opacity-20" />

            {/* Main showcase card - Glassmorphism */}
            <div className="relative glass dark:glass-dark rounded-3xl p-8 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/30">
              {/* Dashboard preview content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                      Dashboard Preview
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Real-time analytics</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total', value: '42', color: 'from-blue-400 to-blue-600' },
                    { label: 'Pending', value: '8', color: 'from-amber-400 to-orange-600' },
                    { label: 'Approved', value: '34', color: 'from-emerald-400 to-cyan-600' },
                    { label: 'Avg Score', value: '8.5', color: 'from-purple-400 to-pink-600' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
                    >
                      <p className="text-xs font-medium opacity-80">{stat.label}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                    Monthly Trend
                  </p>
                  <div className="flex items-end justify-between h-16 gap-1">
                    {[40, 55, 70, 65, 80, 75, 90, 85].map((height, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✨ Modern Design
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
