"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Clock, Lock, MailWarning, UserMinus, UserX, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AccountHygieneData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function AccountHygieneWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<AccountHygieneData>) {
  const neverSignedIn = data?.neverSignedIn ?? 0;
  const dormant90Days = data?.dormant90Days ?? 0;
  const invitationsExpiringSoon = data?.invitationsExpiringSoon ?? 0;
  const invitationsExpired = data?.invitationsExpired ?? 0;
  const usersWithoutRoles = data?.usersWithoutRoles ?? 0;
  const lockedOut = data?.lockedOut ?? 0;

  const totalHygieneIssues = neverSignedIn + dormant90Days + invitationsExpired + usersWithoutRoles + lockedOut;

  const items = [
    {
      label: "Never signed in",
      count: neverSignedIn,
      filter: "never-signed-in",
      icon: UserMinus,
      tone: neverSignedIn > 0 ? "neutral" : "default",
    },
    {
      label: "Dormant 90d+",
      count: dormant90Days,
      filter: "dormant-90",
      icon: Clock,
      tone: dormant90Days > 10 ? "amber" : "neutral",
    },
    {
      label: "Invitations expiring",
      count: invitationsExpiringSoon,
      filter: "invitations-expiring",
      icon: MailWarning,
      tone: "neutral",
    },
    {
      label: "Invitations expired",
      count: invitationsExpired,
      filter: "invitations-expired",
      icon: UserX,
      tone: invitationsExpired > 0 ? "amber" : "neutral",
    },
    {
      label: "Users without roles",
      count: usersWithoutRoles,
      filter: "no-roles",
      icon: AlertCircle,
      tone: usersWithoutRoles > 0 ? "amber" : "neutral",
    },
    {
      label: "Locked out",
      count: lockedOut,
      filter: "locked-out",
      icon: Lock,
      tone: lockedOut > 0 ? "destructive" : "neutral",
    },
  ];

  return (
    <WidgetShell
      title="Account hygiene"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/users"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <StatusTooltipIcon
          status={totalHygieneIssues > 0 ? "WARNING" : "CLEAN"}
          label={totalHygieneIssues > 0 ? `${totalHygieneIssues} candidates` : "Clean"}
          tooltipTitle="Account & Directory Hygiene"
          tooltipDescription={
            totalHygieneIssues > 0
              ? `${totalHygieneIssues} user accounts require hygiene cleanup or review (dormant, unassigned, or locked out).`
              : "All active accounts and user directories are healthy with no dormant or unassigned accounts."
          }
          tooltipDetails={[
            { label: "Dormant (90d+)", value: `${dormant90Days}` },
            { label: "Never Signed In", value: `${neverSignedIn}` },
            { label: "Expired Invites", value: `${invitationsExpired}` },
            { label: "Locked Out", value: `${lockedOut}` },
          ]}
          showBorder
        />
      }

    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 select-none">
        {items.map((item) => {
          const Icon = item.icon;
          const isDestructive = item.tone === "destructive";
          const isAmber = item.tone === "amber";

          return (
            <Link
              key={item.filter}
              href={`/app/administration/users?filter=${item.filter}`}
              className={cn(
                "p-2.5 rounded-md border transition-all flex flex-col justify-between hover:translate-y-[-1px]",
                isDestructive && item.count > 0
                  ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                  : isAmber && item.count > 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  : "bg-muted/30 hover:bg-muted/60 border-border/40 text-foreground"
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate pr-1">{item.label}</span>
                <Icon className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isDestructive && item.count > 0 ? "text-red-600 dark:text-red-400" : isAmber && item.count > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold tabular-nums mt-1.5",
                isDestructive && item.count > 0 ? "text-red-600 dark:text-red-400" : isAmber && item.count > 0 ? "text-amber-700 dark:text-amber-300" : "text-foreground"
              )}>
                {item.count}
              </div>
            </Link>
          );
        })}
      </div>
    </WidgetShell>
  );
}
