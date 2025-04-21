'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, User } from './types'
import { SupabaseAuthAdapter } from './SupabaseAuthAdapter'

const defaultAuthService = new SupabaseAuthAdapter()

interface AuthContextType {
  user: User | null
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  authService?: AuthService
}

export function AuthProvider({ children, authService = defaultAuthService }: AuthProviderProps) {
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
    <AuthContext.Provider value={{ user, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 