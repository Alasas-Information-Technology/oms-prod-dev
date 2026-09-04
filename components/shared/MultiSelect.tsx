"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  label,
  error,
  helperText,
  disabled = false,
  className,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className={cn("relative flex flex-col gap-1", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "w-full min-h-9 px-3 py-1.5 flex items-center flex-wrap gap-1.5 rounded border text-left",
          "bg-input-background border-border transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
          open && "ring-2 ring-ring/50 border-ring",
          error && "border-destructive ring-destructive/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {selectedOptions.length === 0 && (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          {selectedOptions.slice(0, maxDisplay).map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-xs font-medium shadow-sm"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(opt.value);
                }}
                className="hover:text-primary/70 focus:outline-none"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedOptions.length > maxDisplay && (
            <span className="text-xs text-muted-foreground self-center">
              +{selectedOptions.length - maxDisplay} more
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded text-sm text-left transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      ) : null}
    </div>
  );
}
