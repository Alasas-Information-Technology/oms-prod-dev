"use client";

import * as React from "react";
import { Lock, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/constants/permissions";

export interface PeriodClosedNoticeProps {
  periodCode: string;
  onRequestReopen?: () => void;
}

/**
 * PeriodClosedNotice Component — Informative status banner for closed periods.
 *
 * Rules (Part 6 of BUDGET-CONTROL-CENTER-UI.md):
 * - Closed period is a NORMAL state, not an error.
 * - Everything stays readable; mutations are disabled with visible reason.
 * - Reopening action available for users with BUDGET.PERIOD.MANAGE.
 */
export function PeriodClosedNotice({
  periodCode,
  onRequestReopen,
}: PeriodClosedNoticeProps) {
  const { can } = usePermission();
  const canManagePeriod = can(PERMISSIONS.BUDGET_PERIOD_MANAGE);

  return (
    <div className="p-4 rounded-md border border-border/80 bg-muted/40 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="size-8 rounded-md bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
          <Lock className="size-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-foreground block">
            Financial Period {periodCode} is Closed
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Budget allocations and fund movements are archived in read-only state. Mutations and new
            requisitions are disabled.
          </p>
        </div>
      </div>

      {canManagePeriod && onRequestReopen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestReopen}
          className="rounded-md text-xs h-8 gap-1.5 font-semibold shrink-0 cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Request Reopening</span>
        </Button>
      )}
    </div>
  );
}
