import { type AuthResponse } from '../../domain/auth-response'
import { type User } from '../../domain/user'
import { ServerAuthService } from '../../application/auth-service'
import { convertUser } from './convert-user'
import { SupabaseClient, createServerClient, type CookieMethodsServer  } from './client'

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