"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface MultiSelectProps {
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
        <label className="text-sm font-medium text-slate-700">{label}</label>
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
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/50 rounded px-1.5 py-0.5 text-xs font-medium premium-transition hover-scale shadow-sm"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(opt.value);
                }}
                className="hover:text-blue-900 focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {selectedOptions.length > maxDisplay && (
            <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium">
              +{selectedOptions.length - maxDisplay} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-1 shrink-0">
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform duration-150", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full glass-popover border border-border rounded shadow-lg premium-transition origin-top animate-in fade-in slide-in-from-top-1">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded bg-input-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent text-left transition-colors",
                  value.includes(opt.value) && "text-primary bg-blue-50/60"
                )}
              >
                <span>{opt.label}</span>
                {value.includes(opt.value) && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
          {selectedOptions.length > 0 && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all ({selectedOptions.length} selected)
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
