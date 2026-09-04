"use client";

import * as React from "react";
import { Upload, CalendarCog, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { IBudgetPeriodDto } from "@/lib/types/budget.types";
import { cn } from "@/lib/utils";

export interface BudgetHeaderActionsProps {
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
  periodData?: IBudgetPeriodDto;
  onOpenUploadDialog?: () => void;
  onOpenManagePeriodDialog?: () => void;
}

const AVAILABLE_PERIODS = [
  { id: "period-fy26", code: "FY 2026", name: "Financial Year 2026", status: "OPEN" },
  { id: "period-fy25", code: "FY 2025", name: "Financial Year 2025", status: "CLOSED" },
  { id: "period-fy27", code: "FY 2027", name: "Financial Year 2027 (Draft)", status: "DRAFT" },
];

/**
 * BudgetHeaderActions Component — Embedded directly in the 56px sticky Page Bar.
 *
 * Rules (Part 3 & Part 5 of BUDGET-CONTROL-CENTER-UI.md):
 * 1. Period selector lives in HEADER, not filter row.
 * 2. Status badge beside selector: Open (emerald) / Closed (zinc/amber).
 * 3. Upload budget (ghost/outline), Manage period (primary filled).
 * 4. ONE filled button only.
 * 5. Gate Upload on BUDGET.UPLOAD, Manage period on BUDGET.PERIOD.MANAGE (hide rather than disable).
 * 6. When period is closed, mutating actions show visible reason.
 */
export function BudgetHeaderActions({
  selectedPeriod,
  onPeriodChange,
  periodData,
  onOpenUploadDialog,
  onOpenManagePeriodDialog,
}: BudgetHeaderActionsProps) {
  const { can } = usePermission();

  const currentPeriodMeta =
    AVAILABLE_PERIODS.find((p) => p.id === selectedPeriod || p.code === selectedPeriod) ||
    AVAILABLE_PERIODS[0];

  const isClosed = periodData ? periodData.status === "CLOSED" : currentPeriodMeta.status === "CLOSED";
  const isOpen = periodData ? periodData.status === "OPEN" : currentPeriodMeta.status === "OPEN";

  // Permission Gates: Hide rather than disable if unauthorized
  const canUpload = can(PERMISSIONS.BUDGET_UPLOAD);
  const canManagePeriod = can(PERMISSIONS.BUDGET_PERIOD_MANAGE);

  return (
    <div className="flex items-center gap-2.5">
      {/* ── 1. Period Selector & Open/Closed Badge Group ── */}
      <div className="flex items-center gap-2 pr-1 border-r border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-md bg-background/80 hover:bg-background border-border/70 shadow-2xs cursor-pointer"
            >
              <span className="font-mono">{currentPeriodMeta.code}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1 rounded-md shadow-lg border-border/70">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
              Financial Periods
            </DropdownMenuLabel>
            {AVAILABLE_PERIODS.map((period) => (
              <DropdownMenuItem
                key={period.id}
                onClick={() => onPeriodChange(period.id)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{period.code}</span>
                  {period.id === currentPeriodMeta.id && (
                    <CheckCircle2 className="size-3.5 text-primary" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 font-medium",
                    period.status === "OPEN"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border/60"
                  )}
                >
                  {period.status === "OPEN" ? "Open" : period.status === "CLOSED" ? "Closed" : "Draft"}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Open / Closed Status Badge */}
        <Badge
          variant="outline"
          className={cn(
            "h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs select-none transition-colors",
            isOpen && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
            isClosed && "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
            !isOpen && !isClosed && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full shrink-0",
              isOpen && "bg-emerald-500",
              isClosed && "bg-zinc-400 dark:bg-zinc-500",
              !isOpen && !isClosed && "bg-amber-500"
            )}
            aria-hidden="true"
          />
          <span>{isOpen ? "Open" : isClosed ? "Closed" : "Draft"}</span>
        </Badge>
      </div>

      {/* ── 2. Action Buttons (One filled button only) ── */}

      {/* Upload Budget (Ghost/Outline) — Gated on BUDGET.UPLOAD */}
      {canUpload && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClosed}
                  onClick={onOpenUploadDialog}
                  className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-md bg-background/80 hover:bg-background border-border/70 shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="size-3.5 text-muted-foreground" />
                  <span>Upload budget</span>
                </Button>
              </span>
            </TooltipTrigger>
            {isClosed && (
              <TooltipContent className="text-xs">
                Financial period is closed. Uploads and baseline adjustments are locked.
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Manage Period (Primary Filled) — Gated on BUDGET.PERIOD.MANAGE */}
      {canManagePeriod && (
        <Button
          variant="default"
          size="sm"
          onClick={onOpenManagePeriodDialog}
          className="h-9 px-3.5 gap-1.5 text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer"
        >
          <CalendarCog className="size-3.5" />
          <span>Manage period</span>
        </Button>
      )}
    </div>
  );
}
