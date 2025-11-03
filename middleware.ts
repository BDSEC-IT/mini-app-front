import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
  '/auth/nationality',
  '/auth/register',
  '/api/user/digipay-login',
  '/api/user/send-registration-number',
  '/api/user/get-registration-number'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths and API routes
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next') || pathname.startsWith('/images/') || pathname.startsWith('/locales/')) {
    return NextResponse.next()
  }

  // Always allow the request to continue
  // The registration check will be handled in the components/pages
  // using the TokenProvider which sets a default token if none exists
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