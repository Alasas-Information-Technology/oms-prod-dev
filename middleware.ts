import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// internal routes for internal portal and vendor routes for vendor portal
const INTERNAL_ROUTES = ['/api/internal']
const VENDOR_ROUTES = ['/api/vendor']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('oms_access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const isApiRoute = pathname.startsWith('/api/')

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    // For non-API routes, if they are not on /login, redirect to /login
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    const { payload } = await jwtVerify(
      token,
      JWT_SECRET
    )

    const userType = payload.userType as string

    // If logged in and trying to access login page, redirect to dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    /*
     * Internal Portal Protection
     */
    if (
      INTERNAL_ROUTES.some(route =>
        pathname.startsWith(route)
      )
    ) {
      if (userType !== 'INTERNAL') {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    /*
     * Vendor Portal Protection
     */
    if (
      VENDOR_ROUTES.some(route =>
        pathname.startsWith(route)
      )
    ) {
      if (userType !== 'VENDOR') {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const requestHeaders = new Headers(
      request.headers
    )

    requestHeaders.set(
      'x-user-id',
      String(payload.userId)
    )

    requestHeaders.set(
      'x-user-type',
      String(payload.userType)
    )

    requestHeaders.set(
      'x-email',
      String(payload.email)
    )

    requestHeaders.set(
      'x-department-id',
      String(payload.departmentId || '')
    )

    requestHeaders.set(
      'x-business-unit-id',
      String(payload.businessUnitId || '')
    )

    requestHeaders.set(
      'x-vendor-id',
      String(payload.vendorId || '')
    )

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch {
    if (isApiRoute) {
      return NextResponse.json(
        { message: 'Invalid Token' },
        { status: 401 }
      )
    }

    // Invalid token on UI routes -> clear cookie & redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('oms_access_token')
    return response
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/app/:path*',
    '/vendor/:path*',
    '/login',
  ],
}