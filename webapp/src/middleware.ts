import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './core/auth/infrastructure/middleware'
import { SupabaseServerAuthService } from './core/auth/infrastructure/supabase/SupabaseServerAuthService'

export async function middleware(request: NextRequest) {
  let authResponse = NextResponse.next({
    request,
  })
  
  const authService = new SupabaseServerAuthService({
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      authResponse = NextResponse.next({
        request,
      })
      cookiesToSet.forEach(({ name, value, options }) =>
        authResponse.cookies.set(name, value, options)
      )
    },
  });

  return await updateSession(request, authResponse, authService)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 