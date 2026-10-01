"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export interface DatePickerFieldProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
}

export function DatePickerField({
  value,
  onChange,
  label,
  placeholder = "Select date",
  error,
  helperText,
  disabled = false,
  className,
  dateFormat = "MMM d, yyyy",
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded border px-3 text-xs text-left transition-colors",
              "bg-input-background border-border text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
              open && "ring-2 ring-ring/50 border-ring",
              !value && "text-muted-foreground",
              error && "border-destructive ring-destructive/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{value ? format(value, dateFormat) : placeholder}</span>
            </div>
            {value && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
                className="text-muted-foreground hover:text-foreground focus:outline-none p-0.5"
              >
                <X size={14} />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl z-50" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      ) : null}
    </div>
  );
}
