import { type BrowserAuthService, type AuthResponse, type User } from '../types'
import { browserClient as supabase } from '../lib/supabase/client'
import { convertUser } from './convert-user'


export class SupabaseBrowserAuthService implements BrowserAuthService {
  async getSession(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.getSession()
    return {
      data: {
        user: convertUser(data.session?.user ?? null),
        session: data.session
      },
      error
    }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return {
      data: {
        user: convertUser(data.user),
        session: data.session
      },
      error
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return {
      data: {
        user: convertUser(data.user),
        session: data.session
      },
      error
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    return supabase.auth.signOut()
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 