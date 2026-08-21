"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { OrgTypeIcon } from "./OrgTypeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface OrgBreadcrumbItem {
  orgUnitId?: string;
  name: string;
  nameAr?: string;
  code?: string;
  typeCode?: string | number;
  href?: string;
}

export interface OrgBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Array of hierarchy items from root to current node */
  items: OrgBreadcrumbItem[];
  /** Callback when an ancestor item is clicked */
  onSelect?: (item: OrgBreadcrumbItem) => void;
  /** Maximum number of breadcrumb nodes to display before middle-truncating (default: 4, min: 3) */
  maxVisible?: number;
  /** Whether to render OrgTypeIcon next to each node (default: false) */
  showIcons?: boolean;
  /** Legacy alias for showIcons */
  showSigils?: boolean;
  /** Whether to render unit code alongside name (default: false) */
  showCodes?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * OrgBreadcrumb — Variable-depth clickable breadcrumb with middle truncation.
 *
 * Per Domain 2 UI Specification (§1.3 & Prompt U2):
 * - Variable-depth, every ancestor level clickable.
 * - Truncates intelligently in the middle when deep rather than at the end.
 * - Guarantees the root and the last TWO levels are always visible.
 * - Responsive and keyboard accessible with focus rings.
 */
export function OrgBreadcrumb({
  items,
  onSelect,
  maxVisible = 4,
  showIcons = false,
  showSigils,
  showCodes = false,
  className,
  ...props
}: OrgBreadcrumbProps) {
  const shouldShowIcons = showIcons || Boolean(showSigils);

  if (!items || items.length === 0) {
    return null;
  }

  // Cap maxVisible to at least 3
  const effectiveMax = Math.max(3, maxVisible);
  const total = items.length;

  return (
    <nav
      aria-label="Hierarchy Breadcrumb"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === total - 1;
          const isSecondToLast = index === total - 2;

          // Intelligently truncate middle items if total > effectiveMax
          if (total > effectiveMax && !isFirst && !isLast && !isSecondToLast) {
            if (index > 1) {
              return null; // Skip redundant middle placeholders
            }

            // Render a single middle dropdown placeholder
            const collapsedGroup = items.slice(1, total - 2);

            return (
              <li key="collapsed-group" className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary outline-none transition-colors"
                    aria-label={`View ${collapsedGroup.length} hidden intermediate levels`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[180px] p-1">
                    {collapsedGroup.map((hiddenItem, hIdx) => (
                      <DropdownMenuItem
                        key={hiddenItem.orgUnitId || hIdx}
                        onClick={() => onSelect?.(hiddenItem)}
                        className="flex items-center gap-2 text-xs py-1.5 cursor-pointer"
                      >
                        {hiddenItem.typeCode && (
                          <OrgTypeIcon type={hiddenItem.typeCode} size="xs" />
                        )}
                        <span className="truncate font-medium text-foreground">
                          {hiddenItem.name}
                        </span>
                        {hiddenItem.nameAr && (
                          <span dir="rtl" lang="ar" className="text-[11px] text-muted-foreground font-arabic truncate">
                            {hiddenItem.nameAr}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          }

          const hasLink = Boolean(item.href || onSelect);

          return (
            <li key={item.orgUnitId || index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              )}

              <div className="inline-flex items-center gap-1.5">
                {shouldShowIcons && item.typeCode && (
                  <OrgTypeIcon type={item.typeCode} size="xs" />
                )}

                {isLast ? (
                  // Current Active Node
                  <span
                    aria-current="page"
                    className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]"
                  >
                    {item.name}
                    {showCodes && item.code && (
                      <span className="ml-1 font-mono text-[10px] text-muted-foreground font-normal">
                        ({item.code})
                      </span>
                    )}
                    {item.nameAr && (
                      <span dir="rtl" lang="ar" className="ml-1.5 text-muted-foreground/80 font-arabic text-xs font-normal">
                        {item.nameAr}
                      </span>
                    )}
                  </span>
                ) : hasLink ? (
                  // Clickable Ancestor Node
                  item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => onSelect?.(item)}
                      className="hover:text-foreground hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-0.5 outline-none truncate max-w-[140px] sm:max-w-[200px]"
                    >
                      {item.name}
                      {showCodes && item.code && (
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                          ({item.code})
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect?.(item)}
                      className="hover:text-foreground hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-0.5 outline-none truncate max-w-[140px] sm:max-w-[200px] text-left cursor-pointer"
                    >
                      {item.name}
                      {showCodes && item.code && (
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                          ({item.code})
                        </span>
                      )}
                    </button>
                  )
                ) : (
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {item.name}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
