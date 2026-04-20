'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { apiClient, getApiErrorMessage, type RoleAccessSummary } from '@/lib/api'
import { getPostLoginRoute } from '@/lib/auth-session'
import { pickFirstAccessibleRoute } from '@/lib/route-access'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser, allowedRoutes, allowedResources, setAllowedRoutes, setAllowedResources } = useAuthStore()
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const accessFromStore: RoleAccessSummary = {
        resources: allowedResources,
        routePaths: allowedRoutes,
      }
      const targetRoute = pickFirstAccessibleRoute({
        resources: accessFromStore.resources,
        routePaths: accessFromStore.routePaths?.length ? accessFromStore.routePaths : allowedRoutes,
      })
      router.replace(targetRoute || getPostLoginRoute(user.roles))
    }
  }, [allowedResources, allowedRoutes, router, user])

  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity-script="true"]')

    const setupButton = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const google = window.google
      if (!google || !buttonRef.current) return
      if (!clientId) {
        setGoogleButtonRendered(false)
        setGoogleError('Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.')
        return
      }

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) return

            try {
              setIsLoading(true)
              const response = await apiClient.loginWithGoogle(credential)
              setUser(response.user)
              const access = response.access || null
              if (access) {
                setAllowedRoutes(access.routePaths || [])
                setAllowedResources(access.resources || [])
              }
              toast.success('Signed in successfully')

              const targetRoute = response.defaultRoute || pickFirstAccessibleRoute({
                resources: access?.resources,
                routePaths: access?.routePaths?.length ? access.routePaths : allowedRoutes,
              })
              setIsLoading(false)
              router.replace(targetRoute || getPostLoginRoute(response.user.roles || []))
              return
            } catch (error: any) {
              const message = getApiErrorMessage(error, 'Google sign-in failed')
              toast.error(message)
              console.error('Google login error:', error)
            } finally {
              setIsLoading(false)
            }
          },
        })

        buttonRef.current.innerHTML = ''
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 370,
          text: 'signin_with',
        })
        setGoogleError(null)
        setGoogleButtonRendered(true)
      } catch (error: any) {
        const currentOrigin = window.location.origin
        console.error('Google identity initialization failed:', error)
        setGoogleButtonRendered(false)
        setGoogleError(
          `Google sign-in failed to initialize for origin ${currentOrigin}. Verify the client ID and make sure this exact origin is allowed in Google Cloud Console.`,
        )
      }
    }

    if (window.google) {
      setupButton()
      setScriptReady(true)
      return
    }

    const script = existingScript || document.createElement('script')
    if (!existingScript) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentityScript = 'true'
      script.onload = () => {
        setupButton()
        setScriptReady(true)
      }
      script.onerror = () => {
        setScriptReady(false)
        setGoogleButtonRendered(false)
        setGoogleError('Unable to load Google sign-in script. Check your network and try again.')
      }
      document.head.appendChild(script)
    }

    return () => {
      void script
    }
  }, [router, setUser])

  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-[448px] rounded-[16px] border border-white/80 bg-white px-6 py-9 shadow-[0_6px_18px_rgba(15,23,42,0.12)] sm:px-10">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">DDP</h1>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600">Sign in with your approved Google account to access the portal.</p>

            <div className="space-y-3">
              <div className="min-h-[46px] rounded-[8px] border border-[#edf0f7] bg-white px-2 py-1">
                <div ref={buttonRef} className="flex justify-center" />
                {!scriptReady ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#edf0f7] bg-white text-sm font-medium text-slate-500"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading Google sign-in...
                  </button>
                ) : !googleButtonRendered ? (
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#d9e0f2] bg-white text-sm font-medium text-slate-700"
                    onClick={() => window.google?.accounts.id.prompt()}
                  >
                    Continue with Google
                  </button>
                ) : null}
              </div>

              {googleError ? (
                <p className="text-center text-xs text-amber-700">{googleError}</p>
              ) : null}

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing you in...
                </div>
              ) : null}


            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
