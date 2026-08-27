"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Clock, Lock, UserX } from "lucide-react";

export type PlainUserStatus = "ACTIVE" | "INVITED" | "LOCKED" | "INACTIVE";

export interface UserStatusBadgeProps {
  status?: PlainUserStatus | string;
  user?: {
    isActive?: boolean;
    isDeleted?: boolean;
    lockedUntil?: string | null;
    failedLoginCount?: number;
    status?: string;
  };
  className?: string;
  showDot?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md";
}

/**
 * Resolves one of the 4 strict plain states from user object or direct status string.
 */
export function resolveUserStatus(
  inputStatus?: string,
  user?: { isActive?: boolean; lockedUntil?: string | null; status?: string }
): PlainUserStatus {
  if (user) {
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return "LOCKED";
    }
    if (!user.isActive) {
      if (
        user.status === "PENDING_INVITE" ||
        user.status === "INVITED" ||
        user.status === "Hasn't signed in yet"
      ) {
        return "INVITED";
      }
      return "INACTIVE";
    }
    return "ACTIVE";
  }

  if (inputStatus) {
    const s = inputStatus.toUpperCase();
    if (s.includes("LOCK")) return "LOCKED";
    if (s.includes("INVIT") || s.includes("PENDING") || s.includes("HASN'T")) return "INVITED";
    if (s.includes("INACTIVE") || s.includes("OFF") || s.includes("DEACT")) return "INACTIVE";
    if (s.includes("ACTIVE")) return "ACTIVE";
  }

  return "ACTIVE";
}

export function UserStatusBadge({
  status: directStatus,
  user,
  className,
  showDot = false,
  showIcon = true,
  size = "sm",
}: UserStatusBadgeProps) {
  const resolvedStatus = resolveUserStatus(directStatus, user);

  switch (resolvedStatus) {
    case "ACTIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
            "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
            className
          )}
        >
          {showIcon && <CheckCircle2 className={cn(size === "sm" ? "size-3" : "size-3.5", "shrink-0")} />}
          {showDot && <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />}
          Active
        </span>
      );

    case "INVITED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
            "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800",
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
            className
          )}
        >
          {showIcon && <Clock className={cn(size === "sm" ? "size-3" : "size-3.5", "shrink-0")} />}
          {showDot && <span className="size-1.5 rounded-full bg-sky-500 shrink-0" />}
          Hasn&apos;t signed in yet
        </span>
      );

    case "LOCKED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
            "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
            className
          )}
        >
          {showIcon && <Lock className={cn(size === "sm" ? "size-3" : "size-3.5", "shrink-0")} />}
          {showDot && <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />}
          Locked out
        </span>
      );

    case "INACTIVE":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
            "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
            className
          )}
        >
          {showIcon && <UserX className={cn(size === "sm" ? "size-3" : "size-3.5", "shrink-0")} />}
          {showDot && <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />}
          Access turned off
        </span>
      );
  }
}
