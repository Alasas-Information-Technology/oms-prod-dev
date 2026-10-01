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
              "flex h-9 w-full min-w-0 items-center justify-between rounded-sm border border-input bg-background dark:bg-card/30 px-3 py-1.5 text-sm text-left transition-[color,box-shadow,border-color] duration-200 ease-out outline-none hover:border-ring/50",
              "focus:outline-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px]",
              open && "border-ring ring-[3px] ring-ring/20",
              !value ? "text-muted-foreground" : "text-foreground",
              error && "border-destructive ring-destructive/20 focus-visible:ring-destructive/20 focus-visible:border-destructive",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none"
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
        <PopoverContent className="w-auto p-0" align="start">
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
