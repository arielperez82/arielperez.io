import { AuthResponse } from "@/core/auth/domain/auth-response"
import { User } from "@/core/auth/domain/user"

export interface BrowserAuthService {
    getSession: () => Promise<AuthResponse>
    signInWithPassword: (email: string, password: string) => Promise<AuthResponse>
    signUp: (email: string, password: string) => Promise<AuthResponse>
    signOut: () => Promise<{ error: Error | null }>
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } }
  } 
  
  export interface ServerAuthService {
    getSession: () => Promise<AuthResponse>,
    getUser: () => Promise<User | null>
  }