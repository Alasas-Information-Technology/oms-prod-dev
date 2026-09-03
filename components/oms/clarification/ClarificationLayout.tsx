"use client";

import * as React from "react";
import Link from "next/link";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface ClarificationLayoutProps {
  crumbs?: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  banner?: React.ReactNode;
  leftColumn: React.ReactNode;
  rightColumn?: React.ReactNode;
  backLink?: { href: string; label: string };
  readOnlyAlert?: React.ReactNode;
  auditNote?: React.ReactNode;
  isSingleColumn?: boolean;
  className?: string;
}

export function ClarificationLayout({
  crumbs = [],
  title,
  subtitle,
  headerActions,
  banner,
  leftColumn,
  rightColumn,
  backLink,
  readOnlyAlert,
  auditNote = "🛈 Every message, change and approval is kept for audit.",
  isSingleColumn = false,
  className,
}: ClarificationLayoutProps) {
  const hasRightColumn = Boolean(rightColumn) && !isSingleColumn;

  return (
    <div className={cn("flex flex-col min-h-full pb-16 animate-in fade-in-50 duration-300", className)}>
      {/* 1. Page Bar Breadcrumbs */}
      {crumbs.length > 0 && <PageBarBreadcrumbs crumbs={crumbs} />}

      {/* 2. Sticky Action Buttons in Page Bar */}
      {headerActions && <PageBarActions>{headerActions}</PageBarActions>}

      {/* Main Container */}
      <div className="p-4 sm:p-6 max-w-[1680px] w-full mx-auto space-y-6">
        {/* Back Link */}
        {backLink && (
          <div className="flex items-center justify-between">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>{backLink.label}</span>
            </Link>
          </div>
        )}

        {/* Read-Only Alert */}
        {readOnlyAlert}

        {/* Top Header / Subtitle Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex flex-col gap-1">
            {typeof title === "string" ? (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Banner Section (e.g. ConsequenceBanner, DeadlineBanner) */}
        {banner && <div className="space-y-4">{banner}</div>}

        {/* Responsive Two-Column Grid Shell:
            1fr 420px, 24px gap. Right column stacks below 1280px (xl).
            Single column when right column is absent.
        */}
        <div
          className={cn(
            "grid gap-6 items-start",
            hasRightColumn
              ? "grid-cols-1 xl:grid-cols-[1fr_420px]"
              : "grid-cols-1 max-w-4xl"
          )}
        >
          {/* Left Column */}
          <div className="space-y-6 min-w-0">{leftColumn}</div>

          {/* Right Column (Strictly omitted when not provided) */}
          {hasRightColumn && (
            <div className="space-y-6 min-w-0">{rightColumn}</div>
          )}
        </div>

        {/* Audit Trail Persistent Note */}
        {auditNote && (
          <div className="pt-4 border-t border-border/40 text-[11.5px] text-muted-foreground flex items-center gap-2">
            <span>{auditNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
