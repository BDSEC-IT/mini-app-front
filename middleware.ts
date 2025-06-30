import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
  '/auth/nationality',
  '/auth/register',
  '/api/user/digipay-login',
  '/api/user/send-registration-number'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths and API routes
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next') || pathname.startsWith('/images/') || pathname.startsWith('/locales/')) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth_token')?.value
  
  // If no token, redirect to nationality selection
  if (!token) {
    const url = new URL('/auth/nationality', request.url)
    return NextResponse.redirect(url)
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure paths that should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images|locales).*)',
  ],
} 