import { User } from "./user"

export interface AuthResponse {
    data: {
      user: User | null
      session?: any
    } | null
    error: Error | null
  }
  