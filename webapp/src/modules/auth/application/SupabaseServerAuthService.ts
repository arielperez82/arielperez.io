import { type AuthResponse, type User, type ServerAuthService } from '../types'
import { convertUser } from './convert-user'
import { SupabaseClient, createServerClient, type CookieMethodsServer  } from '../lib/supabase/client'

export class SupabaseServerAuthService implements ServerAuthService {
  private supabase: SupabaseClient

  constructor(cookies: CookieMethodsServer) {
    this.supabase = createServerClient(cookies)
  }

  async getSession(): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.getSession()
    return {
      data: {
        user: convertUser(data.session?.user ?? null),
        session: data.session
      },
      error
    }
  }

  async getUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser()
    return convertUser(data.user ?? null)
  }
} 