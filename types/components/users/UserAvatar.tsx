"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserAvatarProps {
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  size?: 24 | 32 | 40 | 56 | 64;
  className?: string;
}

const TINT_PALETTE = [
  "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
];

function getTintForString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TINT_PALETTE.length;
  return TINT_PALETTE[index];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 32,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const tintClass = getTintForString(email || name);

  const sizeClasses = {
    24: "size-6 text-[10px]",
    32: "size-8 text-xs",
    40: "size-10 text-sm",
    56: "size-14 text-base font-semibold",
    64: "size-16 text-lg font-bold",
  }[size];

  return (
    <Avatar className={cn(sizeClasses, "shrink-0 shadow-2xs border border-border/40", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
      <AvatarFallback className={cn("font-medium select-none", tintClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
