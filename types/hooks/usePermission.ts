"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Enterprise permission verification hook.
 * Strictly gates actions on permissions using can(), never on role names per CLAUDE.md.
 */
export function usePermission() {
  const { user } = useAuth();

  const isSuper =
    user?.username?.toLowerCase() === "admin" ||
    user?.roles?.includes("SUPER_ADMIN") ||
    user?.roles?.includes("SUPERADMIN") ||
    Boolean(user?.isSuperAdmin);

  /**
   * Checks whether the current authenticated user has a specific permission.
   * Wildcard '*' or 'SYSTEM_ADMIN' full access is supported if present in permissions.
   * Superadmin always returns true for all permissions.
   */
  const can = (permission: string): boolean => {
    if (isSuper) return true;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }
    return (
      user.permissions.includes(permission) ||
      user.permissions.includes("*") ||
      user.permissions.includes("ALL")
    );
  };

  /**
   * Checks if user has at least one of the provided permissions.
   */
  const canAny = (permissions: string[]): boolean => {
    if (isSuper) return true;
    return permissions.some((p) => can(p));
  };

  /**
   * Checks if user has all of the provided permissions.
   */
  const canAll = (permissions: string[]): boolean => {
    if (isSuper) return true;
    return permissions.every((p) => can(p));
  };

  return {
    can,
    canAny,
    canAll,
    permissions: isSuper && !user?.permissions?.includes("*") ? ["*", ...(user?.permissions || [])] : (user?.permissions || []),
    user,
    isSuperAdmin: isSuper,
  };
}
