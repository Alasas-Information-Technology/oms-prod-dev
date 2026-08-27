"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, User, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrgTypeIcon, OrgTypeKey, getOrgTypeConfig } from "./OrgTypeIcon";
import { cn } from "@/lib/utils";

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

/**
 * Formats subordinate counts into a natural plain-language sentence.
 * e.g. "4 sections · 23 people", "3 departments", "No sections inside"
 */
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

/**
 * OrgUnitCard — Production Org-Chart Node Component.
 *
 * Implements:
 * - Part 1: Clean surface rules (white/card, 12px radius, 2px near-black border on selection).
 * - Part 2: Non-technical vocabulary (counts as sentences, who's in charge, full type words).
 * - Part 3.3: Card anatomy (tinted type icon, mono code, bilingual names with RTL isolation,
 *   head avatar, counts sentence, Details button, dynamic expand chevron).
 */
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
  peopleCount,
  isExpanded = false,
  isSelected = false,
  isArchived = false,
  needsAttention,
  onToggleExpand,
  onOpenDetails,
  className,
  ...props
}: OrgUnitCardProps) {
  const typeConfig = getOrgTypeConfig(typeCode);
  const displayTypeName = typeName || typeConfig.label;

  // Unresolved leadership issue (no head assigned)
  const isHeadMissing = !headName || headName.trim().length === 0;
  const showAmberDot = needsAttention ?? (isHeadMissing && !isArchived);

  // Derive child type word if not provided
  const derivedChildTypeWord =
    childTypeWord ||
    (displayTypeName === "Organization" || displayTypeName === "Holding"
      ? "business units"
      : displayTypeName === "Business Unit"
      ? "departments"
      : displayTypeName === "Department"
      ? "sections"
      : "sub-units");

  const countSentence = formatCountSentence(childCount, derivedChildTypeWord, peopleCount);
  const hasChildren = childCount > 0;

  return (
    <div
      data-unit-id={id}
      tabIndex={0}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-label={`${name} (${code}), ${displayTypeName}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenDetails?.(e);
      }}
      className={cn(
        "relative flex flex-col w-[240px] rounded-xl bg-card border text-card-foreground transition-all duration-150 select-none motion-reduce:transition-none",
        // Default rest state (no shadow, neutral 1px border)
        "border-border shadow-none",
        // Hover state
        "hover:border-foreground/30 hover:shadow-xs",
        // Selected state: 2px near-black border (weight change, not color)
        isSelected && "border-2 border-foreground ring-1 ring-foreground/20 shadow-xs",
        // Archived state: 50% opacity
        isArchived && "opacity-50 bg-muted/40",
        // Focus visible state for accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {/* Needs Attention Amber Dot (top-right indicator) */}
      {showAmberDot && (
        <span
          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-card shadow-xs"
          title="No leader currently assigned"
          aria-label="Needs attention: No leader assigned"
        />
      )}

      {/* Card Header & Content */}
      <div className="p-3.5 pb-2.5 space-y-2.5">
        {/* Top Meta Row: Type Icon + Code Chip + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <OrgTypeIcon type={typeCode} size="sm" />
            <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 truncate">
              {code}
            </span>
          </div>

          {isArchived && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase font-medium">
              Archived
            </Badge>
          )}
        </div>

        {/* Title Block: Name, Arabic Name, Type Word */}
        <div className="space-y-0.5 min-h-[44px]">
          <h3 className="text-sm font-semibold text-foreground leading-tight tracking-tight line-clamp-2">
            {name}
          </h3>

          {nameAr && (
            <p
              dir="rtl"
              lang="ar"
              className="text-[11px] text-muted-foreground font-arabic leading-snug line-clamp-1"
            >
              {nameAr}
            </p>
          )}

          <p className="text-[11px] text-muted-foreground font-medium pt-0.5">
            {displayTypeName}
          </p>
        </div>

        {/* Leadership & Counts Block */}
        <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
          {/* Who's In Charge (Avatar + Name) */}
          <div className="flex items-center gap-1.5 text-foreground min-w-0">
            <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/60">
              <User className="h-2.5 w-2.5" />
            </div>
            <span className={cn("text-[11px] truncate font-medium", isHeadMissing && "text-muted-foreground italic")}>
              {headName || "No one in charge"}
            </span>
          </div>

          {/* Counts formatted as a sentence */}
          <p className="text-[11px] text-muted-foreground truncate pl-5.5">
            {countSentence}
          </p>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/20 rounded-b-xl gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails?.(e);
          }}
          className="h-6 px-2 text-[11px] font-medium text-foreground hover:bg-background hover:text-foreground"
        >
          Details
        </Button>

        {/* Dynamic Expand Chevron (Absent if no children, per Part 3.3) */}
        {hasChildren ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={isExpanded ? `Collapse ${name}` : `Expand ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.(e);
            }}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-background"
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        ) : (
          /* Empty spacer keeping layout balanced */
          <div className="h-6 w-6" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
