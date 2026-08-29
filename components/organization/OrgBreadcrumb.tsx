"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { OrgTypeIcon, OrgTypeKey } from "@/components/organization/OrgTypeIcon";
import { cn } from "@/components/ui/utils";

export interface OrgBreadcrumbItem {
  id?: string;
  orgUnitId?: string;
  name: string;
  nameAr?: string | null;
  code?: string;
  typeCode?: OrgTypeKey;
  href?: string;
}

export interface OrgBreadcrumbProps {
  items: OrgBreadcrumbItem[];
  onItemClick?: (item: OrgBreadcrumbItem) => void;
  className?: string;
  showIcons?: boolean;
}

export function OrgBreadcrumb({
  items = [],
  onItemClick,
  className,
  showIcons = true,
}: OrgBreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Organization hierarchy breadcrumb"
      className={cn("flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground", className)}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={item.id || item.code || idx}>
            <div className="flex items-center gap-1.5 min-w-0">
              {showIcons && item.typeCode && (
                <OrgTypeIcon type={item.typeCode} size="xs" />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px]"
                >
                  {item.name}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[140px] sm:max-w-[200px]"
                >
                  {item.name}
                </Link>
              ) : onItemClick ? (
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="hover:text-foreground transition-colors truncate max-w-[140px] sm:max-w-[200px] cursor-pointer"
                >
                  {item.name}
                </button>
              ) : (
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {item.name}
                </span>
              )}
            </div>

            {!isLast && (
              <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0 select-none" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
