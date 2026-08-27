"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: (string | BreadcrumbItemData)[];
  className?: string;
  maxDirectVisible?: number; // default 4
  maxCharLength?: number; // default 28
}

export function Breadcrumb({
  items,
  className,
  maxDirectVisible = 4,
  maxCharLength = 28,
}: BreadcrumbProps) {
  // Normalize items
  const normalizedItems: BreadcrumbItemData[] = React.useMemo(() => {
    return items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      if (typeof item === "string") {
        return {
          label: item,
          isCurrent: isLast,
        };
      }
      return {
        ...item,
        isCurrent: item.isCurrent ?? isLast,
      };
    });
  }, [items]);

  // Truncation logic:
  const { visibleCrumbs, hiddenCrumbs } = React.useMemo(() => {
    if (normalizedItems.length <= maxDirectVisible) {
      return { visibleCrumbs: normalizedItems, hiddenCrumbs: [] };
    }

    const first = normalizedItems[0];
    const hidden = normalizedItems.slice(1, normalizedItems.length - 2);
    const lastTwo = normalizedItems.slice(normalizedItems.length - 2);

    return {
      visibleCrumbs: [
        first,
        { label: "…", isEllipsis: true } as BreadcrumbItemData & { isEllipsis: boolean },
        ...lastTwo,
      ],
      hiddenCrumbs: hidden,
    };
  }, [normalizedItems, maxDirectVisible]);

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center select-none", className)}>
      <ol className="flex items-center text-sm font-normal min-w-0 flex-nowrap overflow-hidden">
        {visibleCrumbs.map((crumb: any, index) => {
          const isLast = index === visibleCrumbs.length - 1;
          const isEllipsis = crumb.isEllipsis;

          return (
            <React.Fragment key={crumb.href || crumb.label + index}>
              {/* Separator */}
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className="mx-2 text-muted-foreground/40 select-none text-sm font-normal shrink-0"
                >
                  /
                </li>
              )}

              {/* Collapsed levels menu ("…") */}
              {isEllipsis ? (
                <li className="shrink-0 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Show hidden breadcrumb levels"
                        className="px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-xs transition-colors cursor-pointer"
                      >
                        …
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[180px] p-1 rounded-xl shadow-lg border border-border">
                      {hiddenCrumbs.map((hCrumb, hIdx) => (
                        <DropdownMenuItem key={hCrumb.label + hIdx} asChild className="rounded-lg text-xs cursor-pointer">
                          {hCrumb.href ? (
                            <Link href={hCrumb.href} className="text-xs">
                              {hCrumb.label}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {hCrumb.label}
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ) : isLast || crumb.isCurrent ? (
                <li className="min-w-0 shrink truncate" aria-current="page">
                  {crumb.label.length > maxCharLength ? (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[15px] font-medium text-foreground truncate block">
                            {crumb.label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs bg-popover text-popover-foreground border border-border">
                          {crumb.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-[15px] font-medium text-foreground truncate block">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ) : (
                <li className="shrink-0 max-w-[220px] truncate">
                  {crumb.label.length > maxCharLength ? (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {crumb.href ? (
                            <Link
                              href={crumb.href}
                              className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors truncate block"
                            >
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="text-sm font-normal text-muted-foreground truncate block">
                              {crumb.label}
                            </span>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs bg-popover text-popover-foreground border border-border">
                          {crumb.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors truncate block"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-normal text-muted-foreground truncate block">
                      {crumb.label}
                    </span>
                  )}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
