"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/lib/services/AuthService";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("oms_access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("oms_access_token");
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("oms_access_token")?.value;
  
  if (!token) return null;

  try {
    const authService = new AuthService();
    // Validate token and fetch fresh user session data
    const session = await authService.validateToken(token);
    return session;
  } catch (error) {
    console.error("Session validation failed:", error);
    return null;
  }
}
