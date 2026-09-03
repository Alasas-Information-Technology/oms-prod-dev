"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle, RefreshCw, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WidgetShellProps {
  /** Widget title shown on top-left (14px / 600 weight per T10) */
  title: string;
  /** Optional scope label shown on top-right (e.g., "Digital Security · FY 2026") */
  scopeLabel?: string;
  /** Deep link destination */
  href?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error object or error message */
  error?: Error | string | null;
  /** Inline retry callback for failed widget */
  onRetry?: () => void;
  /** Exact minimum height in pixels (default ~180px - 215px per T3/T6) */
  minHeight?: number | string;
  /** ISO timestamp for freshness indicator */
  updatedAt?: string;
  /** Header actions slot (e.g. inline legends per T8 or filters) */
  headerActions?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Content children */
  children?: React.ReactNode;
}

/**
 * WidgetShell — Standard container for dashboard widgets per T3 and T10:
 * - 44px Card header with no bottom border.
 * - Title at 14px / 600 weight.
 * - Scope indicator: 12px --text-muted with a chevron, right-aligned (not a button).
 * - 28px ⋯ icon button on the right, revealed on card hover.
 * - 20px card padding.
 * - rounded-md corners matching SimpleKpiCard.
 */
export function WidgetShell({
  title,
  scopeLabel,
  href,
  isLoading = false,
  error = null,
  onRetry,
  minHeight = 180,
  updatedAt,
  headerActions,
  className,
  children,
}: WidgetShellProps) {
  const heightStyle =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <section
      className={cn(
        "group relative flex flex-col h-full w-full bg-card/95 dark:bg-card/70 backdrop-blur-xs border border-border/40 dark:border-white/[0.07] shadow-2xs hover:shadow-xs hover:border-border/80 dark:hover:border-white/[0.14] transition-all duration-200 rounded-xl overflow-hidden select-none",
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        className
      )}
      style={{ minHeight: heightStyle }}
    >
      {/* 38px Clean Header with subtle bottom hairline */}
      <header className="h-[38px] min-h-[38px] px-3.5 sm:px-4 flex items-center justify-between border-b border-border/30 dark:border-white/[0.04] bg-muted/10 dark:bg-white/[0.01] select-none">
        {/* Left: Widget Title (13px/600 font-sans) */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <h2 className="text-[13px] font-semibold text-foreground/90 font-sans tracking-tight truncate">
            {title}
          </h2>
          {updatedAt && (
            <span className="text-[10.5px] font-normal text-muted-foreground/50 whitespace-nowrap ml-1 font-sans hidden sm:inline">
              as of {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Right: Header Actions / Legends / Scope Link / ⋯ Hover Button */}
        <div className="flex items-center gap-2 shrink-0">
          {headerActions}

          {/* Scope Indicator: 11.5px --text-muted with chevron */}
          {scopeLabel && (
            <div className="flex items-center">
              {href ? (
                <Link
                  href={href}
                  className="group/link flex items-center gap-1 text-[11.5px] font-normal text-muted-foreground hover:text-foreground transition-colors"
                  title={`Open ${title}`}
                >
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {scopeLabel}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/60 group-hover/link:text-foreground group-hover/link:translate-x-0.5 transition-all" />
                </Link>
              ) : (
                <span className="text-[11.5px] font-normal text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                  {scopeLabel}
                </span>
              )}
            </div>
          )}

          {/* 24px ⋯ button revealed on hover */}
          {href ? (
            <Link
              href={href}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="View details"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Widget options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Content Area with tighter upmarket padding (p-3.5 sm:p-4) */}
      <div className="flex-1 flex flex-col p-3.5 sm:p-4 relative min-h-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col gap-2.5 justify-center py-2">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
            <div className="flex-1 min-h-[70px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Unable to load widget
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] line-clamp-2">
              {typeof error === "string" ? error : error.message || "An unexpected error occurred."}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2.5 h-7 text-[11px] gap-1 border-border/60 hover:bg-muted rounded-md px-2.5"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

