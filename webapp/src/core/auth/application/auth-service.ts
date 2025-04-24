import { AuthResponse } from "../domain/auth-response"
import { User } from "../domain/user"

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