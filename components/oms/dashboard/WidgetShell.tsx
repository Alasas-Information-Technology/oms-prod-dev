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
        "group flex flex-col h-full w-full bg-card dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 shadow-2xs hover:shadow-xs hover:border-border transition-all duration-200 rounded-md overflow-hidden select-none",
        className
      )}
      style={{ minHeight: heightStyle }}
    >
      {/* 44px Card Header per T10 (No bottom border, 14px/600 title) */}
      <header className="h-11 min-h-[44px] px-5 flex items-center justify-between select-none">
        {/* Left: Widget Title (14px/600) */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <h2 className="text-[14px] font-semibold text-foreground font-sans tracking-tight truncate">
            {title}
          </h2>
          {updatedAt && (
            <span className="text-[11px] font-normal text-muted-foreground/50 whitespace-nowrap ml-1 font-sans">
              as of {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Right: Header Actions / Legends / Scope Link / ⋯ Hover Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {headerActions}

          {/* Scope Indicator per T10: 12px --text-muted text with chevron, right-aligned (not a button) */}
          {scopeLabel && (
            <div className="flex items-center">
              {href ? (
                <Link
                  href={href}
                  className="group/link flex items-center gap-1 text-[12px] font-normal text-muted-foreground hover:text-foreground transition-colors"
                  title={`Open ${title}`}
                >
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {scopeLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/link:text-foreground group-hover/link:translate-x-0.5 transition-all" />
                </Link>
              ) : (
                <span className="text-[12px] font-normal text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">
                  {scopeLabel}
                </span>
              )}
            </div>
          )}

          {/* 28px ⋯ button revealed on hover */}
          {href ? (
            <Link
              href={href}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="View details"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Widget options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Content Area with 20px padding (p-5) */}
      <div className="flex-1 flex flex-col p-5 pt-1 relative min-h-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col gap-3 justify-center py-2">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
            <div className="flex-1 min-h-[80px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Unable to load widget
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] line-clamp-2">
              {typeof error === "string" ? error : error.message || "An unexpected error occurred."}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 h-8 text-xs gap-1.5 border-border/80 hover:bg-muted rounded-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
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
