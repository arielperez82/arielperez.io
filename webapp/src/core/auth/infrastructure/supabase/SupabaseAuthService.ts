import { type AuthService } from '@/core/auth/application/auth-service'
import { type AuthResponse } from '@/core/auth/domain/auth-response'
import { type CookieMethodsServer, type SupabaseClient, createClient } from '@/shared/infrastructure/supabase/client'
import { convertUser } from './convert-user'
import { stringToBase64URL } from '@supabase/ssr';

export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient;
  private cookies: CookieMethodsServer;

  constructor(cookies: CookieMethodsServer) {
    this.supabase = createClient;
    this.cookies = cookies
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const defaultStorageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`;
    const session = JSON.stringify(data?.session);
    const encodedCookieValue = `base64-${stringToBase64URL(session)}`;
    
    await this.cookies.setAll?.([{
      name: defaultStorageKey,
      value: encodedCookieValue,
      options: {}
    }])

    return {
      data: {
        user: convertUser(data.user),
        session: data.session
      },
      error
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
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
} 