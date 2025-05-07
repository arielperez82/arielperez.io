import { NextResponse, type NextRequest } from 'next/server'
import { SupabaseServerAuthService } from '@/core/auth/infrastructure/supabase/SupabaseServerAuthService'

const PUBLIC_PATHS = ['/login', '/register', '/favicon.ico', '/_next', '/api', '/public']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard and future protected routes
  const isProtected = pathname.startsWith('/dashboard')

  if (isProtected) {
    const authService = new SupabaseServerAuthService({
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {},
    })
    const session = await authService.getSession()
    if (!session.data.user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
} 