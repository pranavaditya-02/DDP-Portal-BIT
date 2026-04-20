'use client'

import React from "react"

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-session'
import { Toaster } from 'react-hot-toast'

const PUBLIC_PATHS = ['/', '/login', '/register']
const AUTH_SYNC_INTERVAL_MS = 30000

export function Providers({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser | null }) {
  useEffect(() => {
    const syncRoleAccess = async () => {
      try {
        const access = await apiClient.getMyRoleAccess()
        const routes = access.routePaths || []
        const resources = access.resources || []
        useAuthStore.getState().setAllowedRoutes(routes)
        useAuthStore.getState().setAllowedResources(resources)
      } catch {
        useAuthStore.getState().setAllowedRoutes([])
        useAuthStore.getState().setAllowedResources([])
      }
    }

    const state = useAuthStore.getState()
    const currentUser = state.user

    if (state._hasHydrated && (state.isAuthenticated || PUBLIC_PATHS.includes(window.location.pathname))) {
      return
    }

    if (initialUser) {
      useAuthStore.setState({
        user: initialUser,
        isAuthenticated: true,
        _hasHydrated: true,
      })
      void syncRoleAccess()
      return
    }

    if (currentUser) {
      useAuthStore.setState({
        isAuthenticated: true,
        _hasHydrated: true,
      })
      void syncRoleAccess()
      return
    }

    if (PUBLIC_PATHS.includes(window.location.pathname)) {
      useAuthStore.setState({
        _hasHydrated: true,
        allowedRoutes: [],
        allowedResources: [],
      })
      return
    }

    const verifyAuth = async () => {
      try {
        const response = await apiClient.getMe()
        if (!response?.user) {
          throw new Error('No active user session')
        }
        useAuthStore.setState({
          user: response.user,
          isAuthenticated: true,
          _hasHydrated: true,
        })
        await syncRoleAccess()
      } catch (error) {
        console.error('Auth verification failed:', error)
        useAuthStore.getState().logout()
      }
    }

    void verifyAuth()
  }, [initialUser])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (PUBLIC_PATHS.includes(window.location.pathname)) return

    const syncAuthAndAccess = async () => {
      try {
        const verifyResponse = await apiClient.verify()
        const verifiedUser = verifyResponse?.user as AuthUser | null

        if (!verifiedUser) {
          throw new Error('No active verified user')
        }

        const current = useAuthStore.getState().user
        const hasChanged = !current
          || current.id !== verifiedUser.id
          || current.roleId !== verifiedUser.roleId
          || current.roleName !== verifiedUser.roleName
          || JSON.stringify(current.roles || []) !== JSON.stringify(verifiedUser.roles || [])

        if (hasChanged) {
          useAuthStore.getState().setUser(verifiedUser)
        }

        const access = await apiClient.getMyRoleAccess()
        useAuthStore.getState().setAllowedRoutes(access.routePaths || [])
        useAuthStore.getState().setAllowedResources(access.resources || [])
      } catch (error) {
        console.error('Live auth sync failed:', error)
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    void syncAuthAndAccess()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncAuthAndAccess()
      }
    }

    const timer = window.setInterval(() => {
      void syncAuthAndAccess()
    }, AUTH_SYNC_INTERVAL_MS)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
