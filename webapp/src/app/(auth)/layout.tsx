'use client'

import { AuthProvider } from '../../modules/auth/ui/AuthProvider'
import { SupabaseBrowserAuthService } from '../../modules/auth/application/SupabaseBrowserAuthService'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authService = new SupabaseBrowserAuthService()
  return (
    <AuthProvider authService={authService}>
      {children}
    </AuthProvider>
  )
} 