"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Clock, Lock, UserX } from "lucide-react";

export type PlainUserStatus = "ACTIVE" | "INVITED" | "LOCKED" | "INACTIVE";
export type UserStatusType = PlainUserStatus;

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

export function computeUserStatus(user: {
  isActive: boolean;
  lockedUntil?: string | null;
  status?: string;
}): PlainUserStatus {
  return resolveUserStatus(undefined, user);
}

const STATUS_MAP: Record<PlainUserStatus, {
  tone: "success" | "accent" | "danger" | "neutral";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  extraClasses?: string;
}> = {
  ACTIVE: {
    tone: "success",
    label: "Active",
    icon: CheckCircle2,
  },
  INVITED: {
    tone: "accent",
    label: "Hasn\u0027t signed in yet",
    icon: Clock,
    extraClasses: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  },
  LOCKED: {
    tone: "danger",
    label: "Locked out",
    icon: Lock,
  },
  INACTIVE: {
    tone: "neutral",
    label: "Access turned off",
    icon: UserX,
  },
};

export function UserStatusBadge({
  status: directStatus,
  user,
  className,
  showDot = false,
  showIcon = true,
  size = "sm",
}: UserStatusBadgeProps) {
  const resolvedStatus = resolveUserStatus(directStatus, user);
  const config = STATUS_MAP[resolvedStatus] ?? STATUS_MAP.INACTIVE;
  const Icon = config.icon;

  return (
    <Badge
      tone={config.tone}
      className={cn(
        "gap-1.5 transition-colors",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.extraClasses,
        className
      )}
    >
      {showIcon && <Icon className={cn(size === "sm" ? "size-3" : "size-3.5", "shrink-0")} />}
      {showDot && <span className="size-1.5 rounded-full bg-current shrink-0 opacity-60" />}
      {config.label}
    </Badge>
  );
}
