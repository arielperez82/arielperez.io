import { AuthService, AuthResponse, User } from '../types'

export class TestAuthService implements AuthService {
  private user: User | null = null
  private error: Error | null = null
  private unsubscribe = jest.fn()

  constructor(initialUser: User | null = null) {
    this.user = initialUser
  }

  setUser(user: User | null) {
    this.user = user
  }

  setError(error: Error | null) {
    this.error = error
  }

  async getSession(): Promise<AuthResponse> {
    return {
      data: {
        user: this.user,
        session: this.user ? { user: this.user } : null
      },
      error: null
    }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    return {
      data: {
        user: this.user,
        session: this.user ? { user: this.user } : null
      },
      error: this.error
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return {
      data: {
        user: this.user,
        session: this.user ? { user: this.user } : null
      },
      error: this.error
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    this.user = null
    return { error: null }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return {
      data: {
        subscription: {
          unsubscribe: this.unsubscribe
        }
      }
    }
  }
} 