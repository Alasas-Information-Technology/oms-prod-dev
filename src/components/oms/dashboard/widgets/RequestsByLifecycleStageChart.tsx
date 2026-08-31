"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RequestsByLifecycleStageData, LifecycleStageItem } from "@/src/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STAGE_COLORS: Record<string, { bg: string; text: string; hover: string; fill: string }> = {
  DRAFT: {
    bg: "bg-slate-400 dark:bg-slate-500",
    text: "text-slate-600 dark:text-slate-300",
    hover: "hover:bg-slate-500 dark:hover:bg-slate-400",
    fill: "#94A3B8",
  },
  IN_APPROVAL: {
    bg: "bg-blue-500 dark:bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-blue-600 dark:hover:bg-blue-500",
    fill: "#3B82F6",
  },
  HR_REVIEW: {
    bg: "bg-purple-500 dark:bg-purple-600",
    text: "text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-600 dark:hover:bg-purple-500",
    fill: "#8B5CF6",
  },
  PROCUREMENT: {
    bg: "bg-amber-500 dark:bg-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    hover: "hover:bg-amber-600 dark:hover:bg-amber-500",
    fill: "#F59E0B",
  },
  ONBOARDING: {
    bg: "bg-emerald-500 dark:bg-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:bg-emerald-600 dark:hover:bg-emerald-500",
    fill: "#10B981",
  },
};

export function RequestsByLifecycleStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<RequestsByLifecycleStageData>) {
  const router = useRouter();
  const [period, setPeriod] = React.useState("90d");
  const [hoveredStage, setHoveredStage] = React.useState<string | null>(null);

  const stages = data?.stages || [];
  const totalRequests = data?.totalRequests ?? 0;

  const handleStageClick = (stage: LifecycleStageItem) => {
    router.push(`/app/requests?status=${stage.stage.toLowerCase()}`);
  };

  const srSummary = stages
    .map((s) => `${s.label}: ${s.count} requests (${formatAbbreviated(s.totalAmountFils)})`)
    .join(", ");

  return (
    <WidgetShell
      title="Requests by lifecycle stage"
      scopeLabel={scope?.label}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
      headerActions={
        <div className="flex items-center gap-1">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-6 w-28 text-[11px] font-medium border-border/50 bg-muted/30 focus:ring-0">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="FY">This FY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Requisitions by lifecycle stage for {period}. Total {totalRequests} requests. Breakdown: {srSummary}
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No requests in the selected period.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-4 py-1">
          {/* Desktop & Tablet Stacked Bar */}
          <div className="hidden md:flex flex-col gap-2">
            {/* Horizontal Stacked Bar */}
            <div className="relative h-7 w-full overflow-hidden rounded-lg bg-muted/40 flex shadow-xs border border-border/40">
              {stages.map((stage) => {
                const colorConfig = STAGE_COLORS[stage.stage] || STAGE_COLORS.DRAFT;
                const percent = totalRequests > 0 ? (stage.count / totalRequests) * 100 : 0;
                if (percent <= 0) return null;
                const isHovered = hoveredStage === stage.stage;

                return (
                  <button
                    key={stage.stage}
                    type="button"
                    style={{ width: `${Math.max(percent, 2)}%` }}
                    onMouseEnter={() => setHoveredStage(stage.stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => handleStageClick(stage)}
                    className={cn(
                      "h-full relative transition-all duration-150 cursor-pointer flex items-center justify-center select-none overflow-hidden",
                      colorConfig.bg,
                      colorConfig.hover,
                      isHovered && "brightness-110 ring-2 ring-foreground/20 z-10 scale-[1.02]",
                      hoveredStage && !isHovered && "opacity-50"
                    )}
                    title={`${stage.label}: ${stage.count} requests (${formatAbbreviated(stage.totalAmountFils)})`}
                  >
                    {percent >= 8 && (
                      <span className="text-[11px] font-bold text-white drop-shadow-xs font-mono px-1 truncate">
                        {stage.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Segment Legend Cards */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {stages.map((stage) => {
                const colorConfig = STAGE_COLORS[stage.stage] || STAGE_COLORS.DRAFT;
                const isHovered = hoveredStage === stage.stage;

                return (
                  <button
                    type="button"
                    key={stage.stage}
                    onMouseEnter={() => setHoveredStage(stage.stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => handleStageClick(stage)}
                    className={cn(
                      "flex flex-col p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer",
                      isHovered
                        ? "border-border bg-background shadow-xs ring-1 ring-border"
                        : "border-border/40 bg-card/60 hover:bg-muted/40",
                      hoveredStage && !isHovered && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn("size-2 rounded-full shrink-0", colorConfig.bg)} />
                      <span className="text-[11px] font-medium text-muted-foreground truncate">
                        {stage.label}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-base font-semibold text-foreground font-mono tabular-nums">
                        {stage.count}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium truncate">
                        {formatAbbreviated(stage.totalAmountFils)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Fallback Table (<768px) */}
          <div className="md:hidden flex flex-col divide-y divide-border/40 text-xs">
            {stages.map((stage) => {
              const colorConfig = STAGE_COLORS[stage.stage] || STAGE_COLORS.DRAFT;
              return (
                <button
                  type="button"
                  key={stage.stage}
                  onClick={() => handleStageClick(stage)}
                  className="flex items-center justify-between py-2 px-1 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full shrink-0", colorConfig.bg)} />
                    <span className="font-medium text-foreground">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground font-mono">{stage.count}</span>
                    <span className="text-muted-foreground">{formatAbbreviated(stage.totalAmountFils)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
