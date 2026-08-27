import { errors, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a'
);

const JWT_ISSUER = process.env.JWT_ISSUER || 'OMS';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'OMS_USERS';

// Portal protection route patterns
const INTERNAL_ROUTES = ['/api/internal', '/app', '/api/organization'];
const VENDOR_ROUTES = ['/api/vendor', '/vendor'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public / static asset bypass
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname === '/api/auth/login' ||
        pathname === '/api/auth/refresh'
    ) {
        return NextResponse.next();
    }

    const token =
        request.cookies.get('oms_access_token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    const isApiRoute = pathname.startsWith('/api/');

    if (!token) {
        if (isApiRoute) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        // Validate JWT signature, expiration, issuer, and audience in-memory
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        });

        const userId = (payload.userId || payload.sub) as string;
        const loginSessionId = payload.loginSessionId as string;
        const userType = (payload.userType as string) || 'INTERNAL';
        const email = (payload.email as string) || '';
        const roles = Array.isArray(payload.roles) ? payload.roles : [];
        const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
        const scopes = Array.isArray(payload.scopes) ? payload.scopes : [];

        if (!userId) {
            throw new Error('Invalid JWT payload: missing userId');
        }

        // If logged in and accessing login page, redirect to main application portal
        if (pathname === '/login') {
            return NextResponse.redirect(new URL(userType === 'VENDOR' ? '/vendor' : '/app', request.url));
        }

        // Internal Portal Protection
        if (INTERNAL_ROUTES.some((route) => pathname.startsWith(route))) {
            if (userType !== 'INTERNAL') {
                if (isApiRoute) {
                    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/vendor', request.url));
            }
        }

        // Vendor Portal Protection
        if (VENDOR_ROUTES.some((route) => pathname.startsWith(route))) {
            if (userType !== 'VENDOR') {
                if (isApiRoute) {
                    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/app', request.url));
            }
        }

        // Inject User Context Headers for downstream BFF proxy handlers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', String(userId));
        requestHeaders.set('x-user-type', String(userType));
        requestHeaders.set('x-email', String(email));
        if (loginSessionId) {
            requestHeaders.set('x-login-session-id', String(loginSessionId));
        }
        requestHeaders.set('x-roles', JSON.stringify(roles));
        requestHeaders.set('x-permissions', JSON.stringify(permissions));
        requestHeaders.set('x-scopes', JSON.stringify(scopes));

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            if (isApiRoute) {
                return NextResponse.json(
                    { code: 'TOKEN_EXPIRED', message: 'Access token expired' },
                    { status: 401 }
                );
            }

            const response = NextResponse.next();
            response.headers.set('x-token-expired', 'true');
            return response;
        }

        if (
            error instanceof errors.JWTInvalid ||
            error instanceof errors.JWSSignatureVerificationFailed
        ) {
            if (isApiRoute) {
                return NextResponse.json(
                    { code: 'INVALID_TOKEN', message: 'Invalid token' },
                    { status: 401 }
                );
            }

            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('oms_access_token');
            response.cookies.delete('oms_refresh_token');
            return response;
        }

        console.error('[Proxy Authentication Error]:', error);

        if (isApiRoute) {
            return NextResponse.json(
                { code: 'AUTH_ERROR', message: 'Authentication failed' },
                { status: 401 }
            );
        }

        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('oms_access_token');
        response.cookies.delete('oms_refresh_token');
        return response;
    }
}

export const config = {
    matcher: ['/api/:path*', '/app/:path*', '/vendor/:path*', '/login'],
};