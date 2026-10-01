import {
  CalendarCheck2,
  Baby,
  CalendarDays,
  CircleMinus,
  HeartPulse,
  LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { LeaveBalance, LeaveTypeId } from "./leave.types";

const ICONS: Record<LeaveTypeId, LucideIcon> = {
  annual: CalendarDays,
  sick: HeartPulse,
  "comp-off": CalendarCheck2,
  unpaid: CircleMinus,
};

const TONES: Record<LeaveTypeId, string> = {
  annual: "bg-primary/10 text-primary",
  sick: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "comp-off": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  unpaid: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

interface LeaveBalanceCardsProps {
  balances: LeaveBalance[];
}

function BalanceMetric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className={cn("text-lg font-bold tabular-nums", emphasis ? "text-primary" : "text-foreground")}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function LeaveBalanceCards({ balances }: LeaveBalanceCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {balances.map((balance) => {
        const Icon = ICONS[balance.id];
        const usedPercentage = balance.entitled
          ? Math.min(100, ((balance.used ?? 0) / balance.entitled) * 100)
          : 0;

        return (
          <Card
            key={balance.id}
            className="gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:translate-y-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", TONES[balance.id])}>
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{balance.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{balance.entitlementLabel}</p>
                </div>
              </div>
            </div>

            {balance.approvalOnly ? (
              <div className="rounded-lg border border-border/70 bg-muted/35 p-3">
                <p className="text-sm font-semibold text-foreground">Available by approval</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  No fixed balance. HR policy and management approval apply.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <BalanceMetric label="Entitled" value={balance.entitled ?? 0} />
                  <BalanceMetric label="Used" value={balance.used ?? 0} />
                  <BalanceMetric label="Pending" value={balance.pending ?? 0} />
                  <BalanceMetric label="Remaining" value={balance.remaining ?? 0} emphasis />
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
