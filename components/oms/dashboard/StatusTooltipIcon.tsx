"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "destructive" | "info" | "neutral";

export interface StatusTooltipIconProps {
  status: "SUCCESS" | "PASS" | "HEALTHY" | "CLEAN" | "WARNING" | "PARTIAL" | "FAILED" | "STALLED" | "CRITICAL" | "INFO" | "RUNNING" | string;
  tone?: StatusTone;
  tooltipTitle?: string;
  tooltipDescription?: string;
  tooltipDetails?: Array<{ label: string; value: string | number }>;
  label?: string;
  showBorder?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusTooltipIcon({
  status,
  tone,
  tooltipTitle,
  tooltipDescription,
  tooltipDetails,
  label,
  showBorder = false,
  size = "md",
  className,
}: StatusTooltipIconProps) {
  // Infer tone if not explicitly provided
  const upperStatus = status.toUpperCase();
  const resolvedTone: StatusTone =
    tone ||
    (upperStatus === "SUCCESS" || upperStatus === "PASS" || upperStatus === "HEALTHY" || upperStatus === "CLEAN" || upperStatus === "GOOD"
      ? "success"
      : upperStatus === "WARNING" || upperStatus === "PARTIAL" || upperStatus === "DEGRADED" || upperStatus === "NEEDS_ACTION"
      ? "warning"
      : upperStatus === "FAILED" || upperStatus === "STALLED" || upperStatus === "CRITICAL" || upperStatus === "ERROR"
      ? "destructive"
      : upperStatus === "INFO" || upperStatus === "RUNNING"
      ? "info"
      : "neutral");

  const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  const renderIcon = () => {
    switch (resolvedTone) {
      case "success":
        return <CheckCircle2 className={cn(iconSize, "text-emerald-600 dark:text-emerald-400 shrink-0")} />;
      case "warning":
        return <AlertTriangle className={cn(iconSize, "text-amber-600 dark:text-amber-400 shrink-0")} />;
      case "destructive":
        return <XCircle className={cn(iconSize, "text-rose-600 dark:text-rose-400 shrink-0")} />;
      case "info":
        return <Info className={cn(iconSize, "text-blue-600 dark:text-blue-400 shrink-0")} />;
      case "neutral":
      default:
        return <Clock className={cn(iconSize, "text-muted-foreground shrink-0")} />;
    }
  };

  const getContainerBg = () => {
    switch (resolvedTone) {
      case "success":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border-amber-500/20";
      case "destructive":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 border-rose-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border-blue-500/20";
      case "neutral":
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80 border-border/40";
    }
  };

  const defaultTitle = tooltipTitle || `Status: ${status}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center justify-center gap-1.5 transition-colors cursor-help select-none",
            label
              ? "px-2 py-0.5 rounded-full text-[11px] font-medium"
              : "w-6 h-6 rounded-md",
            getContainerBg(),
            showBorder && "border",
            className
          )}
        >
          {renderIcon()}
          {label && <span className="truncate leading-none">{label}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" align="center" className="max-w-xs space-y-1 p-2.5 shadow-md">
        <div className="flex items-center gap-1.5 font-semibold text-[12px] leading-tight">
          {renderIcon()}
          <span>{defaultTitle}</span>
        </div>
        {tooltipDescription && (
          <p className="text-[11px] text-primary-foreground/80 leading-normal">
            {tooltipDescription}
          </p>
        )}
        {tooltipDetails && tooltipDetails.length > 0 && (
          <div className="pt-1 border-t border-primary-foreground/20 space-y-0.5 text-[10.5px]">
            {tooltipDetails.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-3 text-primary-foreground/90 font-mono">
                <span className="text-primary-foreground/60">{item.label}:</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
