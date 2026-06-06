"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerFieldProps {
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
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded border px-3 text-sm text-left transition-colors",
              "bg-input-background border-border",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
              open && "ring-2 ring-ring/50 border-ring",
              !value && "text-muted-foreground",
              error && "border-destructive ring-destructive/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Calendar size={14} className="text-muted-foreground shrink-0" />
            <span className="flex-1">{value ? format(value, dateFormat) : placeholder}</span>
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <X size={14} />
              </button>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg" align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            className="p-3"
            classNames={({
              months: "flex flex-col gap-4",
              month: "flex flex-col gap-4",
              caption: "flex justify-center pt-1 relative items-center w-full",
              caption_label: "text-sm font-semibold text-slate-800",
              nav: "flex items-center gap-1",
              nav_button:
                "size-7 bg-transparent p-0 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-600",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex mb-1",
              head_cell: "text-slate-500 rounded w-8 font-medium text-xs text-center",
              row: "flex w-full mt-0.5",
              cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: "size-8 p-0 font-normal hover:bg-slate-100 rounded transition-colors text-sm text-slate-800 flex items-center justify-center mx-auto",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded font-medium",
              day_today: "text-primary font-semibold",
              day_outside: "text-slate-400 opacity-40",
              day_disabled: "text-slate-300 opacity-50",
              day_hidden: "invisible",
            }) as any}
            components={({
              IconLeft: () => <ChevronLeft size={14} />,
              IconRight: () => <ChevronRight size={14} />,
            }) as any}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
