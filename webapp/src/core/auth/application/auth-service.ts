import { type AuthResponse } from "@/core/auth/domain/auth-response"
import { type User } from "@/core/auth/domain/user"

export interface AuthService {
  signInWithPassword: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: Error | null }>
} 

export interface BrowserAuthService extends AuthService {
  getSession: () => Promise<AuthResponse>
  onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } }
} 

export interface ServerAuthService {
  getSession: () => Promise<AuthResponse>,
  getUser: () => Promise<User | null>
}