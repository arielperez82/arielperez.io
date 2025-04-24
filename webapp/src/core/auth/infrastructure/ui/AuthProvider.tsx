'use client'

import { useEffect, useState } from 'react'
import { AuthContextProvider } from './auth-context'
import { type BrowserAuthService } from '../../application/auth-service'
import { type User } from '../../domain/user'

interface AuthProviderProps {
  children: React.ReactNode
  authService: BrowserAuthService
}

export function AuthProvider({ children, authService }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await authService.getSession()
      if (error) {
        setError(error.message)
        return
      }
      setUser(data?.user ?? null)
    }

    checkUser()

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [authService])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signInWithPassword(email, password)
    if (error) {
      setError(error.message)
      return
    }
    setUser(data?.user ?? null)
    setError(null)
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await authService.signUp(email, password)
    if (error) {
      setError(error.message)
      return
    }
    setUser(data?.user ?? null)
    setError(null)
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    if (error) {
      setError(error.message)
      return
    }
    setUser(null)
    setError(null)
  }

  return (
    <AuthContextProvider value={{ user, error, signIn, signUp, signOut }}>
      {children}
    </AuthContextProvider>
  )
}