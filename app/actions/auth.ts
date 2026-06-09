"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/lib/services/AuthService";

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
 * Validates the current access token and returns the user session.
 * Used by AuthProvider to load user data on mount.
 * Returns null if the token is missing, expired, or invalid.
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
    const authService = new AuthService();
    // Validate token and fetch fresh user session data
    const session = await authService.validateToken(token);
    return session;
  } catch (error) {
    console.error("Session validation failed:", error);
    if (refreshToken) return "REFRESH_REQUIRED";
    return null;
  }
}
