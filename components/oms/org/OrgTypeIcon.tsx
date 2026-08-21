"use client";

import * as React from "react";
import {
  Building2,
  Briefcase,
  Building,
  Layers,
  Landmark,
  FolderTree,
  Boxes,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OrgTypeKey =
  | "ORGANIZATION"
  | "ORG"
  | "HOLDING"
  | "BUSINESS_UNIT"
  | "BU"
  | "DEPARTMENT"
  | "DEP"
  | "DEPT"
  | "SECTION"
  | "SEC"
  | number
  | string;

export interface OrgTypeIconProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: OrgTypeKey;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

interface TypeConfig {
  icon: LucideIcon;
  label: string;
  badgeClass: string;
}

export function getOrgTypeConfig(type?: OrgTypeKey): TypeConfig {
  const normalized = String(type || "DEPARTMENT").toUpperCase().trim();

  if (normalized === "1" || normalized === "ORGANIZATION" || normalized === "ORG" || normalized === "HOLDING") {
    return {
      icon: Landmark,
      label: "Organisation",
      badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    };
  }

  if (normalized === "2" || normalized === "BUSINESS_UNIT" || normalized === "BU") {
    return {
      icon: Briefcase,
      label: "Business Unit",
      badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    };
  }

  if (normalized === "3" || normalized === "DEPARTMENT" || normalized === "DEP" || normalized === "DEPT") {
    return {
      icon: Building2,
      label: "Department",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    };
  }

  if (normalized === "4" || normalized === "SECTION" || normalized === "SEC") {
    return {
      icon: Layers,
      label: "Section",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    };
  }

  return {
    icon: Building,
    label: "Department",
    badgeClass: "bg-muted text-muted-foreground border-border/50",
  };
}

const sizeConfig = {
  xs: {
    container: "h-5 w-5 rounded",
    icon: "h-3 w-3",
    text: "text-[11px]",
  },
  sm: {
    container: "h-6 w-6 rounded-md",
    icon: "h-3.5 w-3.5",
    text: "text-xs",
  },
  md: {
    container: "h-8 w-8 rounded-lg",
    icon: "h-4.5 w-4.5",
    text: "text-sm",
  },
  lg: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-5 w-5",
    text: "text-base",
  },
};

/**
 * OrgTypeIcon — Standardized icon in a soft tinted square per organization type.
 *
 * Implements Part 3.3 and Part 7 of DOMAIN-2-ORGANIZATION-UI-V2.md.
 * Replaces monospace abbreviations (ORG/BU/DEP/SEC) with human-friendly iconography + full words.
 */
export function OrgTypeIcon({
  type = "DEPARTMENT",
  size = "md",
  showLabel = false,
  className,
  ...props
}: OrgTypeIconProps) {
  const config = getOrgTypeConfig(type);
  const sizeMeta = sizeConfig[size];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div
        className={cn("inline-flex items-center gap-2 select-none", className)}
        role="img"
        aria-label={config.label}
        {...props}
      >
        <div
          className={cn(
            "flex items-center justify-center shrink-0 border transition-colors",
            sizeMeta.container,
            config.badgeClass
          )}
        >
          <Icon className={sizeMeta.icon} aria-hidden="true" />
        </div>
        <span className={cn("font-medium text-foreground", sizeMeta.text)}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 border transition-colors select-none",
        sizeMeta.container,
        config.badgeClass,
        className
      )}
      role="img"
      aria-label={config.label}
      title={config.label}
      {...props}
    >
      <Icon className={sizeMeta.icon} aria-hidden="true" />
    </div>
  );
}
