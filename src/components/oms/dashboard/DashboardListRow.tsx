"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardListRowProps {
  /** Leading Icon */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;

  /** Primary label / title (left) */
  title: React.ReactNode;
  /** Optional secondary subtitle / metadata (left) */
  subtitle?: React.ReactNode;

  /** Center content (e.g. badge, segmented bar) */
  center?: React.ReactNode;

  /** Trailing value or amount (right) */
  trailing?: React.ReactNode;
  /** Secondary trailing text (e.g. timestamp or due date) */
  trailingSubtitle?: React.ReactNode;

  /** Optional navigation target */
  href?: string;
  onClick?: () => void;

  className?: string;
}

/**
 * DashboardListRow Component:
 * - Row height ~46px with comfortable horizontal padding
 * - Hover state: subtle backdrop highlight with rounded-md geometry consistent with cards
 * - Leading icon: 20px inside rounded-md container
 * - Trailing value: right-aligned, 14px/600, tabular-nums
 */
export function DashboardListRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  center,
  trailing,
  trailingSubtitle,
  href,
  onClick,
  className,
}: DashboardListRowProps) {
  const content = (
    <div
      className={cn(
        "group flex items-center justify-between h-[46px] px-3.5 rounded-md hover:bg-muted/60 dark:hover:bg-slate-800/60 transition-all duration-150 select-none w-full",
        (href || onClick) && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:translate-x-0.5",
        className
      )}
      onClick={onClick}
    >
      {/* Left: 32px Icon Container + Title / Subtitle */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-border/30 shadow-2xs",
              iconBg || "bg-foreground/8",
              iconColor || "text-foreground/70"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <div className="text-[13.5px] font-medium text-foreground truncate leading-tight group-hover:text-primary transition-colors">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11.5px] text-muted-foreground truncate leading-tight mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Center slot (Optional SegmentedBar / Badge) */}
      {center && <div className="hidden sm:flex items-center px-2 shrink-0">{center}</div>}

      {/* Right: Trailing Value & Subtitle */}
      {(trailing || trailingSubtitle) && (
        <div className="flex flex-col items-end shrink-0 pl-2">
          {trailing && (
            <div className="text-[13.5px] font-semibold text-foreground font-mono tabular-nums leading-tight">
              {trailing}
            </div>
          )}
          {trailingSubtitle && (
            <div className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
              {trailingSubtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
