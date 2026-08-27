"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { ChevronRight } from "lucide-react";

export interface SummaryCardRowProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SummaryCardRow({
  icon: Icon,
  label,
  value,
  onClick,
  badge,
  className,
  disabled = false,
}: SummaryCardRowProps) {
  const isClickable = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3.5 flex items-center justify-between gap-3 transition-colors border-b last:border-b-0",
        isClickable
          ? "hover:bg-muted/50 cursor-pointer active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          : "cursor-default",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="size-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0 text-muted-foreground">
            <Icon className="size-4 text-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="text-sm font-semibold text-foreground truncate mt-0.5">
            {value}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badge}
        {isClickable && (
          <ChevronRight className="size-4 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
    </button>
  );
}

export interface SummaryCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SummaryCard({ children, className }: SummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs divide-y divide-border/60",
        className
      )}
    >
      {children}
    </div>
  );
}
