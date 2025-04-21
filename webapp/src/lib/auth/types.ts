export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  data: {
    user: User | null
    session?: any
  } | null
  error: Error | null
}

export interface AuthService {
  getSession: () => Promise<AuthResponse>
  signInWithPassword: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: Error | null }>
  onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } }
} 