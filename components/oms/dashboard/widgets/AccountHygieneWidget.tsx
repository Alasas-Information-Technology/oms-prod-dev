"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Clock, Lock, MailWarning, UserMinus, UserX } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AccountHygieneData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
    },
    {
      label: "Dormant 90d+",
      count: dormant90Days,
      filter: "dormant-90",
      icon: Clock,
    },
    {
      label: "Invitations expiring",
      count: invitationsExpiringSoon,
      filter: "invitations-expiring",
      icon: MailWarning,
    },
    {
      label: "Invitations expired",
      count: invitationsExpired,
      filter: "invitations-expired",
      icon: UserX,
    },
    {
      label: "Users without roles",
      count: usersWithoutRoles,
      filter: "no-roles",
      icon: AlertCircle,
    },
    {
      label: "Locked out",
      count: lockedOut,
      filter: "locked-out",
      icon: Lock,
    },
  ];

  // Proportional bar length within E7's own set per TASK 3
  const maxVal = Math.max(...items.map((i) => i.count), 1);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 select-none h-full">
        {items.map((item) => {
          const Icon = item.icon;
          const barWidth = item.count > 0 ? Math.max(6, Math.min(100, (item.count / maxVal) * 100)) : 0;

          return (
            <Link
              key={item.filter}
              href={`/app/administration/users?filter=${item.filter}`}
              className={cn(
                "p-2.5 rounded-sm bg-muted/30 border hover:bg-accent border-foreground/10 dark:border-foreground/4 transition-colors flex flex-col justify-between",
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate pr-1 font-medium group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                <Icon className="w-3.5 h-3.5 shrink-0 text-foreground/70" />
              </div>

              {/* Number and Horizontal Bar per TASK 3 */}
              <div className="flex flex-col gap-1 mt-0.5">
                <div className="text-base font-bold tabular-nums text-foreground">
                  {item.count}
                </div>
                <Progress value={barWidth} className="h-1.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </WidgetShell>
  );
}
