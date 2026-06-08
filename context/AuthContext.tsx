"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserSession } from "@/lib/types/auth.types";
import { getAuthSession, clearAuthCookie } from "@/app/actions/auth";
import api from "@/lib/api/axios";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Loads User Session from server.
   * If the access token is expired, attempts a silent refresh via the API.
   */
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      let session = await getAuthSession();

      // If session is null (token expired or missing), attempt silent refresh
      if (!session) {
        try {
          // Axios will send the HttpOnly refresh token cookie automatically
          await api.post("/auth/refresh");
          // Retry loading session after successful refresh
          session = await getAuthSession();
        } catch {
          // Refresh failed — user must re-authenticate
        }
      }

      setUser(session);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Proactive token refresh: refresh the token every 10 minutes
    // This prevents the 15-minute access token from expiring while the user is active
    // and ensures page navigations/reloads don't hit the server with an expired token.
    const refreshInterval = setInterval(() => {
      api.post("/auth/refresh").catch(() => {
        // If proactive refresh fails, we don't immediately logout, 
        // we'll let the standard 401 interceptor or fetchUser handle the failure later.
      });
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Login via API.
   * The login API sets HttpOnly cookies on the response automatically.
   * We then fetch the user session from the server.
   */
  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });

    if (!response.data.success) {
      throw new Error(response.data.message || "Login failed");
    }

    // The HttpOnly cookies are now set by the API response.
    // Load the user session from the server.
    setUser(response.data.session);
  };

  /**
   * Logout.
   * Calls the logout API (which revokes the session and clears cookies),
   * then clears local state and redirects to login.
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Failed to call logout API:", e);
    }

    // Fallback: clear cookies via server action in case the API didn't
    try {
      await clearAuthCookie();
    } catch {
      // Ignore
    }

    setUser(null);

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
