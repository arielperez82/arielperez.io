'use client'
import { ReactNode } from 'react'
import { AuthProvider } from '../../core/auth/infrastructure/ui/AuthProvider'
import { SupabaseBrowserAuthService } from '@/core/auth/infrastructure/supabase/SupabaseBrowserAuthService'

interface Props {
  children: ReactNode
}

export function AppProvider({ children }: Props) {
  const authService = new SupabaseBrowserAuthService()
  return (
    <AuthProvider authService={authService}>
      {children}
    </AuthProvider>
  )
} 