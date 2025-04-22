import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(request.cookies.getAll()).map(({ name, value }) => ({
          name,
          value
        })),
        setAll: (cookies) => {
          cookies.forEach((cookie) => {
            response.cookies.set(cookie)
          })
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check auth condition
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')

  if (isAuthPage) {
    // If logged in and trying to access auth page, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else if (!session && !request.nextUrl.pathname.startsWith('/_next')) {
    // If not logged in and trying to access protected page, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
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