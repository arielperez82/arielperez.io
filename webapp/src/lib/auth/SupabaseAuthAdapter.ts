import { AuthService, AuthResponse, User } from './types'
import { supabase } from '../supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

function convertUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser || !supabaseUser.email) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email
  }
}

export class SupabaseAuthAdapter implements AuthService {
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