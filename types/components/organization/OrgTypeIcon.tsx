"use client";

import * as React from "react";
import {
  Building2,
  Briefcase,
  Layers,
  Landmark,
  Boxes,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui/utils";

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
  size?: "xs" | "sm" | "md" | "lg" | "detail";
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
      label: "Organization",
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
    icon: Boxes,
    label: "Unit",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  };
}

export function OrgTypeIcon({
  type = "DEPARTMENT",
  size = "md",
  showLabel = false,
  className,
  ...props
}: OrgTypeIconProps) {
  const config = getOrgTypeConfig(type);
  const Icon = config.icon;

  const sizeClasses = {
    xs: "size-4 p-0.5",
    sm: "size-6 p-1",
    md: "size-8 p-1.5",
    lg: "size-10 p-2",
    detail: "size-12 p-2.5",
  }[size];

  const iconSizes = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    detail: "size-7",
  }[size];

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      title={config.label}
      {...props}
    >
      <div
        className={cn(
          "rounded-lg border flex items-center justify-center shrink-0 transition-colors shadow-2xs",
          config.badgeClass,
          sizeClasses
        )}
      >
        <Icon className={cn(iconSizes, "shrink-0")} />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide text-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
