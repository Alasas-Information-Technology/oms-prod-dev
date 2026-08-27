"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Activity,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Clock,
  Shield,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface UserActivityTimelineProps {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  failedLoginCount?: number;
  lockedUntil?: string | null;
}

export function UserActivityTimeline({
  userId,
  createdAt,
  updatedAt,
  failedLoginCount = 0,
  lockedUntil,
}: UserActivityTimelineProps) {
  const events = [
    {
      id: "ev-1",
      title: "Account Created",
      description: "User account created and initial onboarding invitation token dispatched.",
      timestamp: createdAt ? new Date(createdAt) : new Date(),
      icon: UserCheck,
      color: "text-emerald-500 border-emerald-500",
    },
    ...(updatedAt && updatedAt !== createdAt
      ? [
          {
            id: "ev-2",
            title: "Profile / Security Updated",
            description: "Profile attributes, permissions, or security state modified by administrator.",
            timestamp: new Date(updatedAt),
            icon: ShieldCheck,
            color: "text-primary border-primary",
          },
        ]
      : []),
    ...(failedLoginCount > 0
      ? [
          {
            id: "ev-3",
            title: "Failed Authentication Attempts",
            description: `${failedLoginCount} consecutive failed login attempts recorded.`,
            timestamp: new Date(),
            icon: failedLoginCount >= 5 ? Lock : Key,
            color: failedLoginCount >= 5 ? "text-rose-500 border-rose-500" : "text-amber-500 border-amber-500",
          },
        ]
      : []),
    ...(lockedUntil && new Date(lockedUntil) > new Date()
      ? [
          {
            id: "ev-4",
            title: "Account Temporarily Locked",
            description: `Locked until ${format(new Date(lockedUntil), "dd MMM yyyy, HH:mm")} per rate-limiting security policy.`,
            timestamp: new Date(),
            icon: Lock,
            color: "text-rose-500 border-rose-500",
          },
        ]
      : []),
  ];

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          Security & Audit Activity Trail
        </CardTitle>
        <CardDescription>
          Immutable security events, login attempts, and credential lifecycle modifications for this account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative group">
                <div
                  className={`absolute -left-6 top-1 size-5 rounded-full flex items-center justify-center border-2 bg-background ${event.color}`}
                >
                  <Icon className="size-2.5" />
                </div>
                <div className="p-3.5 rounded-xl border bg-card/60 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {format(event.timestamp, "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
