"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, User, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrgTypeIcon, OrgTypeKey, getOrgTypeConfig } from "@/components/organization/OrgTypeIcon";
import { cn } from "@/components/ui/utils";

export interface OrgUnitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  code: string;
  name: string;
  nameAr?: string | null;
  typeName?: string;
  typeCode?: OrgTypeKey;
  headName?: string | null;
  headAvatarUrl?: string | null;
  childCount?: number;
  childTypeWord?: string; // e.g. "sections", "departments", "business units"
  peopleCount?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  isArchived?: boolean;
  needsAttention?: boolean;
  onToggleExpand?: (e?: React.MouseEvent) => void;
  onOpenDetails?: (e?: React.MouseEvent) => void;
  className?: string;
}

function formatCountSentence(
  childCount?: number,
  childTypeWord?: string,
  peopleCount?: number
): string {
  const parts: string[] = [];

  if (childCount !== undefined && childCount > 0) {
    const label = childTypeWord || "units";
    parts.push(`${childCount} ${label}`);
  }

  if (peopleCount !== undefined && peopleCount > 0) {
    parts.push(`${peopleCount} ${peopleCount === 1 ? "person" : "people"}`);
  }

  if (parts.length === 0) {
    if (childCount === 0) {
      return "0 teams";
    }
    return "0 members";
  }

  return parts.join(" · ");
}

export function OrgUnitCard({
  id,
  code,
  name,
  nameAr,
  typeName,
  typeCode = "DEPARTMENT",
  headName,
  headAvatarUrl,
  childCount = 0,
  childTypeWord,
  peopleCount = 0,
  isExpanded = false,
  isSelected = false,
  isArchived = false,
  needsAttention = false,
  onToggleExpand,
  onOpenDetails,
  className,
  ...props
}: OrgUnitCardProps) {
  const config = getOrgTypeConfig(typeCode);
  const countSentence = formatCountSentence(childCount, childTypeWord, peopleCount);

  return (
    <div
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails?.();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between w-[280px] p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all select-none cursor-pointer",
        "hover:shadow-md hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected && "border-primary ring-2 ring-primary/20 shadow-md bg-primary/[0.02]",
        isArchived && "opacity-60 bg-muted/30 border-dashed border-border/80",
        className
      )}
      {...props}
    >
      {/* Top row: Type Icon + Unit Code / Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <OrgTypeIcon type={typeCode} size="sm" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {typeName || config.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {needsAttention && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800"
              title="Requires Head of Unit assignment"
            >
              <AlertCircle className="size-3" />
              Unassigned
            </span>
          )}

          {isArchived && (
            <Badge variant="outline" className="text-[10px] bg-muted/60 text-muted-foreground border-border/60">
              Archived
            </Badge>
          )}

          <span className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
            {code}
          </span>
        </div>
      </div>

      {/* Main content: Unit Name and Arabic Name */}
      <div className="space-y-0.5 my-1 min-h-[44px]">
        <h3 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
        {nameAr && (
          <p className="text-xs text-muted-foreground/80 font-sans line-clamp-1" dir="rtl">
            {nameAr}
          </p>
        )}
      </div>

      {/* Leadership & Counts Metadata footer */}
      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
        {/* Head of Unit */}
        <div className="flex items-center gap-1.5 min-w-0 text-muted-foreground" title={headName ? `Head: ${headName}` : "No Head assigned"}>
          <div className="size-5 rounded-full bg-muted/80 flex items-center justify-center shrink-0 border border-border/60">
            <User className="size-3 text-muted-foreground" />
          </div>
          <span className="truncate text-[11px] font-medium text-foreground/90">
            {headName || <span className="italic text-muted-foreground/70">Unassigned</span>}
          </span>
        </div>

        {/* Subordinate counts or expand trigger */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground font-mono">
            {countSentence}
          </span>

          {childCount > 0 && onToggleExpand && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(e);
              }}
              className="size-6 p-0 text-muted-foreground hover:text-foreground rounded-full"
              aria-label={isExpanded ? "Collapse children" : "Expand children"}
            >
              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
