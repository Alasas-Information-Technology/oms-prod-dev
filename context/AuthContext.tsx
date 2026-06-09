"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { UserSession } from "@/lib/types/auth.types";

import {
  clearAuthCookie,
  getAuthSession,
} from "@/app/actions/auth";

import api from "@/lib/api/axios";

interface AuthContextType {
  user: UserSession | null;

  isLoading: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  fetchUser: () => Promise<void>;

  refreshSession: () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<UserSession | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  /**
   * Prevent multiple refreshes
   * running simultaneously
   */
  const refreshInProgress =
    useRef(false);

  /**
   * Silent Refresh
   */
  const refreshSession =
    async () => {

      if (
        refreshInProgress.current
      ) {
        return;
      }

      try {

        refreshInProgress.current =
          true;

        await api.post(
          "/auth/refresh"
        );

      } finally {

        refreshInProgress.current =
          false;
      }
    };

  /**
   * Loads authenticated user
   */
  const fetchUser =
    async () => {

      try {

        setIsLoading(true);

        const sessionResult =
          await getAuthSession();

        if (sessionResult === "REFRESH_REQUIRED") {
          try {
            await refreshSession();
            const newSession = await getAuthSession();
            setUser(newSession !== "REFRESH_REQUIRED" ? newSession : null);
          } catch {
            setUser(null);
          }
        } else {
          setUser(sessionResult);
        }

      } catch (err) {

        console.error(
          "Failed to fetch user:",
          err
        );

        setUser(
          null
        );

      } finally {

        setIsLoading(
          false
        );
      }
    };

  /**
   * Enterprise Logout
   */
  const forceLogout =
    async () => {

      try {

        await api.post(
          "/auth/logout"
        );

      } catch (err) {

        console.error(
          err
        );
      }

      try {

        await clearAuthCookie();

      } catch { }

      setUser(
        null
      );

      if (
        typeof window !==
        "undefined"
      ) {

        window.location.href =
          "/login";
      }
    };

  /**
   * Login
   */
  const login =
    async (
      username: string,
      password: string
    ) => {

      const response =
        await api.post(
          "/auth/login",
          {
            username,
            password,
          }
        );

      if (
        !response.data.success
      ) {

        throw new Error(
          response.data.message ??
          "Login failed"
        );
      }

      /**
       * Login API already set:
       *
       * oms_access_token
       * oms_refresh_token
       * oms_device_id
       */

      const session =
        await getAuthSession();

      setUser(
        session !== "REFRESH_REQUIRED" ? session : null
      );
    };

  /**
   * Logout
   */
  const logout =
    async () => {

      await forceLogout();
    };

  /**
   * Initial App Load
   *
   * Auto Login
   */
  useEffect(() => {

    fetchUser();

  }, []);

  /**
   * Refresh every 10 minutes
   *
   * Access token = 15 mins
   */
  useEffect(() => {

    const interval =
      setInterval(
        async () => {

          try {

            await refreshSession();

          } catch {

            /**
             * Ignore
             *
             * User may already
             * be logged out.
             */
          }

        },
        10 * 60 * 1000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  /**
   * Refresh when tab
   * becomes active again
   *
   * Solves:
   *
   * Laptop sleep
   * Browser reopen
   * Long inactivity
   */
  useEffect(() => {

    const handleFocus =
      async () => {

        try {

          const sessionResult =
            await getAuthSession();

          if (sessionResult === "REFRESH_REQUIRED") {
            try {
              await refreshSession();
              const newSession = await getAuthSession();
              setUser(newSession !== "REFRESH_REQUIRED" ? newSession : null);
            } catch {
              setUser(null);
            }
          } else {
            setUser(sessionResult);
          }

        } catch {

          setUser(
            null
          );
        }
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };

  }, []);

  /**
   * Optional:
   * Refresh when tab
   * becomes visible
   */
  useEffect(() => {

    const handleVisibility =
      async () => {

        if (
          document.visibilityState !==
          "visible"
        ) {
          return;
        }

        try {

          await refreshSession();

        } catch {
          // ignore
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoading,

        login,

        logout,

        fetchUser,

        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );

  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}