"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserAvatarProps {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  src?: string | null;
  size?: 24 | 32 | 56 | number;
  className?: string;
}

/**
 * Extracts 1-2 character uppercase initials.
 */
function getInitials(name?: string | null, username?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (username && username.trim()) {
    return username.trim().substring(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().substring(0, 2).toUpperCase();
  }
  return "U";
}

/**
 * Deterministic background tint based on string hash.
 */
function getAvatarTint(seed: string): { bg: string; text: string; border: string } {
  const TINTS = [
    { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
    { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
    { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
    { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TINTS.length;
  return TINTS[index];
}

export function UserAvatar({
  name,
  username,
  email,
  src,
  size = 32,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, username, email);
  const seed = (name || username || email || "user").toLowerCase();
  const tint = getAvatarTint(seed);

  // Map sizes to tailwind classes
  const sizeClasses = {
    24: "size-6 text-[10px]",
    32: "size-8 text-xs",
    56: "size-14 text-lg font-semibold",
  }[size as 24 | 32 | 56] || "size-8 text-xs";

  return (
    <Avatar
      className={cn(
        "shrink-0 rounded-full border select-none transition-transform",
        sizeClasses,
        tint.border,
        className
      )}
      style={typeof size === "number" && ![24, 32, 56].includes(size) ? { width: size, height: size } : undefined}
    >
      {src && <AvatarImage src={src} alt={name || username || "User"} />}
      <AvatarFallback
        className={cn(
          "w-full h-full flex items-center justify-center font-medium",
          tint.bg,
          tint.text
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
