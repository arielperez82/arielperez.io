'use client'

import { createContext } from 'react'
import { type User } from '../../domain/user'

interface AuthContextType {
  user: User | null
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
export const AuthContextProvider = AuthContext.Provider
export const AuthConsumer = AuthContext.Consumer
