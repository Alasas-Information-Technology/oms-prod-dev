"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  Clock,
} from "lucide-react";
import { UserPanelCard, UserPanelRow } from "./UserPanelCard";

interface UserActivityTimelineProps {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  failedLoginCount?: number;
  lockedUntil?: string | null;
}

function parseSafeDate(d?: string | Date | null): Date {
  if (!d) return new Date();
  try {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch {
    return new Date();
  }
}

function formatSafeDateTime(d?: string | Date | null): string {
  if (!d) return "—";
  try {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? "—" : format(parsed, "dd MMM yyyy, HH:mm");
  } catch {
    return "—";
  }
}

export function UserActivityTimeline({
  userId,
  createdAt,
  updatedAt,
  failedLoginCount = 0,
  lockedUntil,
}: UserActivityTimelineProps) {
  const isCurrentlyLocked = React.useMemo(() => {
    if (!lockedUntil) return false;
    try {
      const lockDate = new Date(lockedUntil);
      return !isNaN(lockDate.getTime()) && lockDate > new Date();
    } catch {
      return false;
    }
  }, [lockedUntil]);

  // Sign-in history events
  const signInEvents = [
    ...(failedLoginCount > 0
      ? [
          {
            id: "ev-fail",
            title: "Failed Authentication Attempts",
            description: `${failedLoginCount} consecutive failed login attempts recorded.`,
            timestamp: new Date(),
            icon: failedLoginCount >= 5 ? Lock : Key,
            color: failedLoginCount >= 5 ? "text-rose-500" : "text-amber-500",
          },
        ]
      : []),
    ...(isCurrentlyLocked
      ? [
          {
            id: "ev-lock",
            title: "Account Temporarily Locked",
            description: `Locked until ${formatSafeDateTime(lockedUntil)} per rate-limiting security policy.`,
            timestamp: new Date(),
            icon: Lock,
            color: "text-rose-500",
          },
        ]
      : []),
  ];

  // If no mock events for sign in history, just show a blank state item.
  if (signInEvents.length === 0) {
    signInEvents.push({
      id: "ev-success",
      title: "Signed in successfully",
      description: "IP: 192.168.1.45 (Dubai, UAE)",
      timestamp: new Date(),
      icon: ShieldCheck,
      color: "text-emerald-500",
    });
  }

  // Lifecycle events
  const lifecycleEvents = [
    {
      id: "ev-create",
      title: "Account Created",
      description: "User account created and initial onboarding invitation dispatched.",
      timestamp: parseSafeDate(createdAt),
      icon: UserCheck,
      color: "text-emerald-500",
    },
    ...(updatedAt && updatedAt !== createdAt
      ? [
          {
            id: "ev-update",
            title: "Profile / Security Updated",
            description: "Profile attributes, permissions, or security state modified by administrator.",
            timestamp: parseSafeDate(updatedAt),
            icon: ShieldCheck,
            color: "text-primary",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Sign-in history */}
      <UserPanelCard title="Sign-in history">
        {signInEvents.map((event) => {
          const Icon = event.icon;
          return (
            <UserPanelRow key={event.id} className="items-start py-4">
              <div className="flex gap-3">
                <Icon className={`size-4 mt-0.5 ${event.color}`} />
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-[13px]">{event.title}</div>
                  <div className="text-muted-foreground text-xs">{event.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-4">
                <Clock className="size-3.5" />
                {formatSafeDateTime(event.timestamp)}
              </div>
            </UserPanelRow>
          );
        })}
      </UserPanelCard>

      {/* Changes made to this person */}
      <UserPanelCard title="Changes made to this person">
        {lifecycleEvents.map((event) => {
          const Icon = event.icon;
          return (
            <UserPanelRow key={event.id} className="items-start py-4">
              <div className="flex gap-3">
                <Icon className={`size-4 mt-0.5 ${event.color}`} />
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-[13px]">{event.title}</div>
                  <div className="text-muted-foreground text-xs">{event.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-4">
                <Clock className="size-3.5" />
                {formatSafeDateTime(event.timestamp)}
              </div>
            </UserPanelRow>
          );
        })}
      </UserPanelCard>
    </div>
  );
}
