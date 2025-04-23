'use client'

import { AuthProvider } from '../../modules/auth/ui/AuthProvider'
import { SupabaseAuthService } from '../../modules/auth/application/SupabaseAuthService'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authService = new SupabaseAuthService()
  return (
    <AuthProvider authService={authService}>
      {children}
    </AuthProvider>
  )
} 