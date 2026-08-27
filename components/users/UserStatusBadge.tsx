"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Clock, Lock, UserX } from "lucide-react";

export type UserStatusType = "ACTIVE" | "INACTIVE" | "INVITED" | "LOCKED";

interface UserStatusBadgeProps {
  user: {
    isActive: boolean;
    isDeleted?: boolean;
    lockedUntil?: string | null;
    failedLoginCount?: number;
    status?: string;
  };
  className?: string;
  showIcon?: boolean;
}

export function computeUserStatus(user: {
  isActive: boolean;
  lockedUntil?: string | null;
  status?: string;
}): UserStatusType {
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return "LOCKED";
  }
  if (!user.isActive) {
    if (user.status === "PENDING_INVITE" || user.status === "INVITED") {
      return "INVITED";
    }
    return "INACTIVE";
  }
  return "ACTIVE";
}

export function UserStatusBadge({
  user,
  className,
  showIcon = true,
}: UserStatusBadgeProps) {
  const status = computeUserStatus(user);

  switch (status) {
    case "ACTIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs",
            className
          )}
        >
          {showIcon && <CheckCircle2 className="size-3.5" />}
          Active
        </span>
      );
    case "INVITED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs",
            className
          )}
        >
          {showIcon && <Clock className="size-3.5" />}
          Invited
        </span>
      );
    case "LOCKED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs",
            className
          )}
        >
          {showIcon && <Lock className="size-3.5" />}
          Locked
        </span>
      );
    case "INACTIVE":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-xs",
            className
          )}
        >
          {showIcon && <UserX className="size-3.5" />}
          Inactive
        </span>
      );
  }
}
