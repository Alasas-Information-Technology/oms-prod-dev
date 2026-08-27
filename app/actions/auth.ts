"use server";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a'
);
const JWT_ISSUER = process.env.JWT_ISSUER || 'OMS';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'OMS_USERS';

/**
 * Clears both auth cookies.
 * Used as a fallback during logout or when the frontend detects auth failure.
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("oms_access_token");
  cookieStore.delete("oms_refresh_token");
}

/**
 * Server-side logout.
 * Calls the logout API endpoint using the current access token,
 * then clears both auth cookies regardless of the API call result.
 */
export async function serverLogout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("oms_access_token")?.value;
  
  if (token) {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    
    try {
      await fetch(`${protocol}://${host}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Cookie": `oms_access_token=${token}`,
          "x-forwarded-for": headersList.get("x-forwarded-for") || "",
          "user-agent": headersList.get("user-agent") || ""
        }
      });
    } catch (e) {
      console.error("Failed to call logout API:", e);
    }
  }
  
  cookieStore.delete("oms_access_token");
  cookieStore.delete("oms_refresh_token");
}

/**
 * Validates the current access token in-memory and returns the user session.
 * Used by AuthProvider to load user data on mount.
 * Returns null if the token is missing or invalid, or 'REFRESH_REQUIRED' if expired.
 */
export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("oms_access_token")?.value;
  const refreshToken = cookieStore.get("oms_refresh_token")?.value;
  
  if (!token) {
    if (refreshToken) return "REFRESH_REQUIRED";
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const userId = (payload.userId || payload.sub) as string;
    if (!userId) {
      if (refreshToken) return "REFRESH_REQUIRED";
      return null;
    }

    return {
      userId,
      username: (payload.username as string) || '',
      email: (payload.email as string) || '',
      userType: (payload.userType as string) || 'INTERNAL',
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
      loginSessionId: (payload.loginSessionId as string) || '',
    };
  } catch {
    if (refreshToken) return "REFRESH_REQUIRED";
    return null;
  }
}
