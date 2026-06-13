import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { errors } from 'jose'
import { authService } from './lib/services'
import { detectDeviceType } from './lib/utils/deviceDetector'
import { detectBrowser } from './lib/utils/browserDetector'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

const JWT_ISSUER = process.env.JWT_ISSUER || 'OMS'
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'OMS_USERS'

// internal routes for internal portal and vendor routes for vendor portal
const INTERNAL_ROUTES = ['/api/internal']
const VENDOR_ROUTES = ['/api/vendor'];



export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userAgent =
    request.headers.get(
      "user-agent"
    ) ?? "UNKNOWN";

  const deviceType =
    detectDeviceType(
      userAgent ?? ""
    );

  const browserName =
    detectBrowser(
      userAgent ?? ""
    );

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/refresh'
  ) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('oms_access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const device_id =
    request.cookies.get("oms_device_id")?.value || "";

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
    // Validate JWT signature, expiration, issuer, and audience
    const { payload } = await jwtVerify(
      token,
      JWT_SECRET,
      {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    )

    const userId = payload.userId as string
    const loginSessionId = payload.loginSessionId as string

    if (!userId || !loginSessionId) {
      throw new Error('Invalid JWT payload: missing userId or loginSessionId')
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    // ─────────────────────────────────────────────────────
    // Validate Login Session against database
    // LoginSessions is the source of truth, NOT the JWT
    // ─────────────────────────────────────────────────────
    const { SessionService } = await import('@/lib/services/SessionService')
    const sessionService = new SessionService()
    const validSession = await sessionService.validateSession(loginSessionId)

    if (!validSession) {
      if (isApiRoute) {
        return NextResponse.json(
          { message: 'Session expired or revoked' },
          { status: 401 }
        )
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('oms_access_token')
      response.cookies.delete('oms_refresh_token')
      return response
    }


    const { securitySettingsService } = await import('@/lib/services/SecuritySettingsService');
    const requireFingerprint = await securitySettingsService.requireSessionFingerprinting();

    if (requireFingerprint) {
      const fingerprintValid =
        await authService
          .validateFingerprint(
            loginSessionId,
            device_id
          );

      console.log(
        "Fingerprint Valid:",
        fingerprintValid
      );

      if (!fingerprintValid) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('oms_access_token');
        response.cookies.delete('oms_refresh_token');
        return response;
      }
    }

    // ─────────────────────────────────────────────────────
    // Load fresh RBAC data from database
    // Never trust authorization data inside the JWT
    // ─────────────────────────────────────────────────────
    const { AuthRepository } = await import('@/lib/repositories/AuthRepository')
    const authRepository = new AuthRepository()
    const user = await authRepository.getUserSessionData(userId)

    if (!user) {
      if (isApiRoute) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 401 }
        )
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('oms_access_token')
      response.cookies.delete('oms_refresh_token')
      return response
    }

    /*
     * Internal Portal Protection
     */
    if (
      INTERNAL_ROUTES.some(route =>
        pathname.startsWith(route)
      )
    ) {
      if (user.userType !== 'INTERNAL') {
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
      if (user.userType !== 'VENDOR') {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // ─────────────────────────────────────────────────────
    // Inject User Context Headers
    // All downstream handlers read from these headers
    // ─────────────────────────────────────────────────────
    const requestHeaders = new Headers(
      request.headers
    )

    requestHeaders.set(
      'x-user-id',
      String(user.userId)
    )

    requestHeaders.set(
      'x-user-type',
      String(user.userType)
    )

    requestHeaders.set(
      'x-email',
      String(user.email)
    )

    requestHeaders.set(
      'x-login-session-id',
      String(loginSessionId)
    )

    requestHeaders.set(
      'x-roles',
      JSON.stringify(user.roles)
    )

    requestHeaders.set(
      'x-permissions',
      JSON.stringify(user.permissions)
    )

    requestHeaders.set(
      'x-scopes',
      JSON.stringify(user.scopes)
    )


    // Update last activity asynchronously (fire-and-forget, don't block the request)
    sessionService.updateLastActivity(loginSessionId).catch(() => {
      // Silently ignore — non-critical
    })

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {

    // ─────────────────────────────────────────────────────
    // Access Token Expired
    // Frontend must call /api/auth/refresh
    // DO NOT redirect to login here
    // DO NOT clear refresh token here
    // ─────────────────────────────────────────────────────
    if (error instanceof errors.JWTExpired) {

      if (isApiRoute) {

        return NextResponse.json(
          {
            code: "TOKEN_EXPIRED",
            message: "Access token expired"
          },
          {
            status: 401
          }
        );

      }

      const response = NextResponse.next();

      response.headers.set(
        "x-token-expired",
        "true"
      );

      return response;
    }

    // ─────────────────────────────────────────────────────
    // Invalid JWT
    // Signature Tampering
    // Wrong Issuer
    // Wrong Audience
    // Malformed Token
    // ─────────────────────────────────────────────────────
    if (
      error instanceof errors.JWTInvalid ||
      error instanceof errors.JWSSignatureVerificationFailed
    ) {

      if (isApiRoute) {

        return NextResponse.json(
          {
            code: "INVALID_TOKEN",
            message: "Invalid token"
          },
          {
            status: 401
          }
        );
      }

      const response =
        NextResponse.redirect(
          new URL(
            "/login",
            request.url
          )
        );

      response.cookies.delete(
        "oms_access_token"
      );

      response.cookies.delete(
        "oms_refresh_token"
      );

      return response;
    }

    // ─────────────────────────────────────────────────────
    // Unknown Auth Error
    // Fail Secure
    // ─────────────────────────────────────────────────────
    console.error(
      "Proxy Authentication Error:",
      error
    );

    if (isApiRoute) {

      return NextResponse.json(
        {
          code: "AUTH_ERROR",
          message: "Authentication failed"
        },
        {
          status: 401
        }
      );
    }

    const response =
      NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );

    response.cookies.delete(
      "oms_access_token"
    );

    response.cookies.delete(
      "oms_refresh_token"
    );


    return response;
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