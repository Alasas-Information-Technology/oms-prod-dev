"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoleDisplayName, getRoleExplanation } from "@/lib/constants/user-admin.constants";
import { Calendar, Shield } from "lucide-react";

export interface RoleOptionProps {
  roleCode: string;
  roleName?: string;
  explanation?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  futureStartDate?: string | null;
  onSetDatesClick?: () => void;
  className?: string;
}

export function RoleOption({
  roleCode,
  roleName,
  explanation,
  checked = false,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  futureStartDate,
  onSetDatesClick,
  className,
}: RoleOptionProps) {
  const displayName = roleName || getRoleDisplayName(roleCode);
  const plainExplanation = explanation || getRoleExplanation(roleCode);
  const id = React.useId();

  return (
    <div
      className={cn(
        "p-3 rounded-xl border transition-all flex items-start gap-3",
        checked
          ? "bg-primary/5 border-primary/30 shadow-2xs"
          : "bg-card border-border/80 hover:bg-muted/40",
        disabled && "opacity-60 cursor-not-allowed",
        readOnly && "pointer-events-none",
        className
      )}
    >
      {!readOnly && (
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange?.(Boolean(c))}
          disabled={disabled}
          className="mt-0.5"
        />
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={readOnly ? undefined : id}
            className={cn(
              "font-medium text-sm text-foreground flex items-center gap-2",
              !readOnly && !disabled && "cursor-pointer"
            )}
          >
            <span>{displayName}</span>
            {futureStartDate && (
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                <Calendar className="size-3" />
                Starts {futureStartDate}
              </span>
            )}
          </label>

          {onSetDatesClick && checked && !readOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDatesClick();
              }}
              className="text-xs text-primary hover:underline font-medium shrink-0"
            >
              Set dates
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {plainExplanation}
        </p>
      </div>
    </div>
  );
}
