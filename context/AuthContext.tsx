"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserSession } from "@/lib/types/auth.types";
import { getAuthSession, setAuthCookie, clearAuthCookie } from "@/app/actions/auth";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (accessToken: string, session: UserSession) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const session = await getAuthSession();
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
  }, []);

  const login = async (accessToken: string, session: UserSession) => {
    await setAuthCookie(accessToken);
    setUser(session);
  };

  const logout = async () => {
    try {
      const { serverLogout } = await import("@/app/actions/auth");
      await serverLogout();
    } catch (e) {
      console.error("Failed to call logout API:", e);
    }
    setUser(null);
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
