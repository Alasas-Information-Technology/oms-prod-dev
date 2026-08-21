"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type OrgTypeKey = "ORG" | "BU" | "DEP" | "SEC" | "ORGANIZATION" | "BUSINESS_UNIT" | "DEPARTMENT" | "SECTION" | number | string;

export interface OrgTypeSigilProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Unit type code, canonical name, or numeric ID (1: ORG, 2: BU, 3: DEP, 4: SEC) */
  type: OrgTypeKey;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional custom title or tooltip override */
  label?: string;
  /** Optional custom class name */
  className?: string;
}

interface SigilMeta {
  sigil: "ORG" | "BU" | "DEP" | "SEC" | "UNIT";
  label: string;
  depthHint: string;
}

/**
 * Normalizes any unit type identifier (ID, enum, or string) into a canonical sigil and accessible label.
 */
function resolveSigilMeta(type: OrgTypeKey): SigilMeta {
  if (typeof type === "number") {
    switch (type) {
      case 1:
        return { sigil: "ORG", label: "Holding Organization", depthHint: "Level 1 Root" };
      case 2:
        return { sigil: "BU", label: "Business Unit", depthHint: "Level 2 Division" };
      case 3:
        return { sigil: "DEP", label: "Department (Budget Owner)", depthHint: "Level 3 Cost Center" };
      case 4:
        return { sigil: "SEC", label: "Operational Section", depthHint: "Level 4 Subunit" };
      default:
        return { sigil: "UNIT", label: `Unit (Type ${type})`, depthHint: "Custom Unit" };
    }
  }

  const normalized = String(type).trim().toUpperCase();
  switch (normalized) {
    case "1":
    case "ORG":
    case "ORGANIZATION":
    case "HOLDING":
      return { sigil: "ORG", label: "Holding Organization", depthHint: "Level 1 Root" };
    case "2":
    case "BU":
    case "BUSINESS_UNIT":
    case "BUSINESSUNIT":
    case "DIVISION":
      return { sigil: "BU", label: "Business Unit", depthHint: "Level 2 Division" };
    case "3":
    case "DEP":
    case "DEPT":
    case "DEPARTMENT":
      return { sigil: "DEP", label: "Department (Budget Owner)", depthHint: "Level 3 Cost Center" };
    case "4":
    case "SEC":
    case "SECTION":
    case "SUB_SECTION":
      return { sigil: "SEC", label: "Operational Section", depthHint: "Level 4 Subunit" };
    default:
      return { sigil: "UNIT", label: `Unit (${normalized})`, depthHint: "Organizational Unit" };
  }
}

/**
 * OrgTypeSigil — Fixed-width monospace type indicator (ORG / BU / DEP / SEC).
 *
 * Per Domain 2 UI Specification (§1.3 & Prompt U2):
 * - Fixed-width monospace type sigil rather than a coloured pill to align cleanly into
 *   a column across rows and prevent screen confetti.
 * - Non-decorative, high-contrast, structural identity.
 * - Accessible: includes ARIA attributes and screen-reader descriptive label.
 */
export function OrgTypeSigil({
  type,
  size = "md",
  label,
  className,
  ...props
}: OrgTypeSigilProps) {
  const meta = resolveSigilMeta(type);
  const accessibleLabel = label || `${meta.label} (${meta.sigil})`;

  const sizeClasses = {
    sm: "w-8 h-4 text-[10px] tracking-wider",
    md: "w-9 h-5 text-[11px] tracking-widest",
    lg: "w-11 h-6 text-xs tracking-widest",
  };

  return (
    <span
      role="status"
      aria-label={accessibleLabel}
      title={`${accessibleLabel} — ${meta.depthHint}`}
      className={cn(
        // Geometry & Layout
        "inline-flex items-center justify-center select-none shrink-0",
        sizeClasses[size],
        // Typography: Monospace for scannable, aligned columnar layout
        "font-mono font-bold uppercase",
        // Neutral structural styling working within existing CSS tokens
        "rounded-[4px] border border-border/80 bg-muted/60 text-foreground/80 dark:bg-muted/30 dark:text-foreground/90 dark:border-border/60",
        // Focus & motion
        "transition-colors duration-150 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{meta.sigil}</span>
      <span className="sr-only">{accessibleLabel}</span>
    </span>
  );
}
