"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WidgetShellProps {
  /** Widget title shown on top-left (15px / 600 weight) */
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
  /** Exact minimum height in pixels to eliminate layout shift */
  minHeight?: number | string;
  /** Header actions slot (e.g. period selector or filters) */
  headerActions?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Content children */
  children?: React.ReactNode;
}

export function WidgetShell({
  title,
  scopeLabel,
  href,
  isLoading = false,
  error = null,
  onRetry,
  minHeight = 160,
  headerActions,
  className,
  children,
}: WidgetShellProps) {
  const heightStyle =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <section
      className={cn(
        "flex flex-col bg-card border border-border/60 rounded-xl overflow-hidden transition-colors shadow-none",
        className
      )}
      style={{ minHeight: heightStyle }}
    >
      {/* 56px Widget Header */}
      <header className="h-14 min-h-[56px] px-4 sm:px-5 flex items-center justify-between border-b border-border/50 bg-card/50 select-none">
        {/* Left: Widget Title (15px / 600 weight) */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <h2 className="text-[15px] font-semibold text-foreground tracking-tight truncate">
            {title}
          </h2>
        </div>

        {/* Right: Header Actions / Scope Label with Chevron Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          {headerActions}

          {scopeLabel && (
            <div className="flex items-center">
              {href ? (
                <Link
                  href={href}
                  className="group flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                  title={`Open ${title}`}
                >
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {scopeLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </Link>
              ) : (
                <span className="text-[12px] text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">
                  {scopeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content Area / Skeletons / Inline Error Boundary */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 relative min-h-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col gap-3 justify-center">
            <Skeleton className="h-7 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <div className="flex-1 min-h-[60px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
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
                className="mt-3.5 h-8 text-xs gap-1.5 border-border/80 hover:bg-muted"
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
