import { type User } from '../types'
import { type SupabaseUser } from '../lib/supabase/types'

export const convertUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser?.email) return null
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email
  }
}