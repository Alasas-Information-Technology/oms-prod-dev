"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRoleDisplayName, getRoleExplanation } from "@/lib/constants/user-admin.constants";
import { Shield } from "lucide-react";

export interface RoleChipProps {
  roleCode: string;
  roleName?: string;
  explanation?: string;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function RoleChip({
  roleCode,
  roleName,
  explanation,
  showIcon = false,
  className,
  size = "sm",
}: RoleChipProps) {
  const displayName = roleName || getRoleDisplayName(roleCode);
  const plainExplanation = explanation || getRoleExplanation(roleCode);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md font-medium cursor-help transition-colors border",
              "bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:border-border/80",
              size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
              className
            )}
          >
            {showIcon && <Shield className="size-3 text-muted-foreground shrink-0" />}
            <span>{displayName}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs font-normal p-2.5">
          <p className="font-semibold mb-0.5">{displayName}</p>
          <p className="opacity-80 leading-relaxed">{plainExplanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
