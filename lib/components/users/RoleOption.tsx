"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  getRoleDisplayName,
  getRoleExplanation,
} from "@/lib/constants/user-admin.constants";

export interface RoleOptionProps {
  roleCode: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  readOnly?: boolean;
  futureStartDate?: string | null;
  onSetDatesClick?: () => void;
  className?: string;
}

export function RoleOption({
  roleCode,
  checked = false,
  onCheckedChange,
  readOnly = false,
  futureStartDate,
  onSetDatesClick,
  className,
}: RoleOptionProps) {
  const displayName = getRoleDisplayName(roleCode);
  const explanation = getRoleExplanation(roleCode);
  const checkboxId = `role-opt-${roleCode.toLowerCase().replace(/_/g, "-")}`;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
        checked
          ? "border-border/80 bg-card shadow-2xs"
          : "border-border/40 bg-muted/20 hover:bg-muted/40",
        readOnly && "cursor-default opacity-80",
        className
      )}
    >
      {!readOnly ? (
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange?.(Boolean(val))}
          className="mt-0.5"
        />
      ) : (
        <div className="mt-0.5 size-4 rounded border flex items-center justify-center bg-muted">
          {checked && <span className="size-2 rounded-xs bg-primary" />}
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={!readOnly ? checkboxId : undefined}
            className={cn(
              "font-medium text-xs text-foreground select-none leading-none",
              !readOnly && "cursor-pointer"
            )}
          >
            {displayName}
          </label>

          <div className="flex items-center gap-1.5 shrink-0">
            {futureStartDate && (
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-1.5 py-0"
              >
                Starts {futureStartDate}
              </Badge>
            )}

            {!readOnly && checked && onSetDatesClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDatesClick();
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Set dates
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
}
