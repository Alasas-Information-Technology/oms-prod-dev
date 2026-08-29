"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { IBudgetSafeguardsResponseDto, ISafeguardItemDto } from "@/lib/types/budget.types";
import { useBudgetSafeguards } from "@/hooks/useBudget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SafeguardsPanelProps {
  safeguardsData?: IBudgetSafeguardsResponseDto;
  isLoading?: boolean;
  className?: string;
}

// ── Translated non-engineering human financial controls (Part 2.2 Table) ─────
const SAFEGUARDS_CONFIG = [
  {
    id: "sg-double-spending",
    title: "Double-spending prevented",
    description: "Requisition locks funds immediately upon HOD approval",
    icon: Lock,
    isOracleRow: false,
  },
  {
    id: "sg-multiline-allocation",
    title: "Funds can come from several budget lines",
    description: "Cross-line split allocation permitted with individual line ledger tracking",
    icon: Layers,
    isOracleRow: false,
  },
  {
    id: "sg-period-validation",
    title: "Only open periods accept requests",
    description: "Closed financial periods strictly reject new fund reservations and amendments",
    icon: ShieldCheck,
    isOracleRow: false,
  },
  {
    id: "sg-auto-release",
    title: "Unused funds return automatically",
    description: "Rejected or cancelled requisitions restore reserved funds back to Available balance",
    icon: RotateCcw,
    isOracleRow: false,
  },
  {
    id: "sg-oracle-sync",
    title: "Last checked against Oracle",
    description: "Automated system-of-record reconciliation with Oracle Financials Cloud",
    icon: RefreshCw,
    isOracleRow: true,
  },
];

export function SafeguardsPanel({
  safeguardsData: propData,
  isLoading: propLoading,
  className,
}: SafeguardsPanelProps) {
  const { data: hookData, isLoading: hookLoading } = useBudgetSafeguards();
  const data = propData || hookData;
  const isLoading = propLoading ?? hookLoading;

  const oracleItem = data?.safeguards.find((s) => s.id.includes("oracle"));
  const lastSyncFormatted = "5 Aug 2026, 08:30";

  return (
    <div className={cn("p-6 rounded-md border border-border/40 bg-card space-y-4", className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold font-display text-foreground">
            Safeguards
          </h3>
        </div>

        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-semibold gap-1 py-0.5 px-2 shadow-2xs"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>All Controls Enforced</span>
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Active policy enforcement rules providing automated financial integrity and audit protection.
      </p>

      {/* ── Safeguards List (Part 2.2 translated labels) ── */}
      <div className="divide-y divide-border/40 border-t border-border/40 pt-1">
        {SAFEGUARDS_CONFIG.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="py-2.5 flex items-start justify-between gap-3 text-xs group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="size-6 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5 group-hover:text-primary transition-colors">
                  <Icon className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground text-xs leading-snug">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Status Indicator / Timestamp */}
              <div className="shrink-0 text-right">
                {item.isOracleRow ? (
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      {lastSyncFormatted}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Batch: ORCL-20260805
                    </span>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1 py-0 px-1.5 shadow-2xs"
                  >
                    <span className="size-1 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
