"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { OrgTypeSigil } from "./OrgTypeSigil";
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
  /** Whether to render OrgTypeSigil next to each node (default: false) */
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
  showSigils = false,
  showCodes = false,
  className,
  ...props
}: OrgBreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // If item count fits within maxVisible, display all
  const shouldTruncate = items.length > Math.max(3, maxVisible);

  let visibleItems: { item: OrgBreadcrumbItem; isCollapsedDropdown?: boolean; originalIndex: number }[] = [];

  if (!shouldTruncate) {
    visibleItems = items.map((item, idx) => ({ item, originalIndex: idx }));
  } else {
    // Keep Root (index 0), collapse intermediate items, keep last 2 items (items.length - 2, items.length - 1)
    const firstItem = { item: items[0], originalIndex: 0 };
    const collapsedItems = items.slice(1, items.length - 2);
    const lastTwoItems = items.slice(items.length - 2).map((item, idx) => ({
      item,
      originalIndex: items.length - 2 + idx,
    }));

    visibleItems = [
      firstItem,
      { item: { name: "...", nameAr: "..." }, isCollapsedDropdown: true, originalIndex: -1 },
      ...lastTwoItems,
    ];
  }

  const collapsedGroup = shouldTruncate ? items.slice(1, items.length - 2) : [];

  return (
    <nav
      aria-label="Organization Hierarchy Breadcrumb"
      className={cn("flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {visibleItems.map((entry, index) => {
          const isLast = index === visibleItems.length - 1;
          const { item, isCollapsedDropdown, originalIndex } = entry;

          if (isCollapsedDropdown) {
            return (
              <li key="collapsed-menu" className="flex items-center gap-1.5">
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
                          <OrgTypeSigil type={hiddenItem.typeCode} size="sm" />
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
            <li key={item.orgUnitId || originalIndex} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              )}

              <div className="inline-flex items-center gap-1.5">
                {showSigils && item.typeCode && (
                  <OrgTypeSigil type={item.typeCode} size="sm" />
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
