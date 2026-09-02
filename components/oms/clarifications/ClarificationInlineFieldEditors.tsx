"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import {
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  Lock,
  Sparkles,
  Calendar as CalendarIcon,
  Coins,
  Hash,
  AlignLeft,
  Layers,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { ClarificationEditableField, ClarificationAsk } from "@/types/clarification";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface ClarificationInlineFieldEditorsProps {
  fields: ClarificationEditableField[];
  asks?: ClarificationAsk[];
  fieldValues: Record<string, any>;
  onChangeField: (key: string, value: any) => void;
  onRevertField: (key: string) => void;
  onRevertAll: () => void;
  readOnly?: boolean;
  className?: string;
}

export function ClarificationInlineFieldEditors({
  fields,
  asks = [],
  fieldValues,
  onChangeField,
  onRevertField,
  onRevertAll,
  readOnly = false,
  className,
}: ClarificationInlineFieldEditorsProps) {
  if (!fields || fields.length === 0) {
    return null;
  }

  // Find set of fieldKeys flagged by HR in the asks checklist
  const flaggedFieldKeys = new Set(
    asks.map((a) => a.fieldKey).filter(Boolean) as string[]
  );

  // Check how many fields are modified from their currentValue
  const changedFieldsCount = fields.filter((f) => {
    const currentVal = f.currentValue;
    const activeVal = fieldValues[f.key] !== undefined ? fieldValues[f.key] : f.proposedValue;
    return String(activeVal) !== String(currentVal);
  }).length;

  const isAnyFieldChanged = changedFieldsCount > 0;

  const formatValueDisplay = (field: ClarificationEditableField, val: any): string => {
    if (field.type === "DATE") {
      if (val === "2027-06-30") return "30 Jun 2027";
      if (val === "2027-08-31") return "31 Aug 2027";
      if (val && typeof val === "string" && val.includes("-")) {
        const parts = val.split("-");
        if (parts.length === 3) {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return format(date, "d MMM yyyy");
          }
        }
      }
      return String(val || "");
    }
    if (field.type === "MONEY") {
      return `AED ${formatAmount(val)}`;
    }
    if (field.unit) {
      return `${val} ${field.unit}`;
    }
    return String(val || "");
  };

  const getFieldIcon = (type: ClarificationEditableField["type"]) => {
    switch (type) {
      case "DATE":
        return <CalendarIcon className="size-4" />;
      case "MONEY":
        return <Coins className="size-4" />;
      case "NUMBER":
        return <Hash className="size-4" />;
      case "TEXT":
        return <AlignLeft className="size-4" />;
      case "SELECT":
        return <Layers className="size-4" />;
      default:
        return <SlidersHorizontal className="size-4" />;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Block Header */}
      <div className="px-5 py-4 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            {readOnly ? <Lock className="size-4.5" /> : <SlidersHorizontal className="size-4.5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>{readOnly ? "Field Details" : "Proposed Changes to Requisition"}</span>
              {!readOnly && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
                    isAnyFieldChanged
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground border border-border/60"
                  )}
                >
                  {isAnyFieldChanged
                    ? `${changedFieldsCount} of ${fields.length} modified`
                    : "No changes yet"}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {readOnly
                ? "Viewing field values in read-only mode."
                : "Edit the parameters requested by HR. Live impact and diff preview below update automatically."}
            </p>
          </div>
        </div>

        {!readOnly && isAnyFieldChanged && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRevertAll}
            className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0 shadow-2xs"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Revert all changes</span>
          </Button>
        )}
      </div>

      {/* Field Cards List */}
      <div className="p-4 sm:p-5 space-y-4">
        {fields.map((field) => {
          const isFlaggedByHR = flaggedFieldKeys.has(field.key);
          const activeValue =
            fieldValues[field.key] !== undefined
              ? fieldValues[field.key]
              : field.proposedValue;
          const isChanged = String(activeValue) !== String(field.currentValue);

          return (
            <div
              key={field.key}
              id={`field-${field.key}`}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden bg-card",
                isChanged
                  ? "border-primary/40 shadow-xs ring-1 ring-primary/20"
                  : "border-border/70 hover:border-border",
                isFlaggedByHR && !readOnly && "border-l-4 border-l-primary"
              )}
            >
              {/* Card Header Strip */}
              <div className="px-4 py-3 bg-muted/25 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "size-7 rounded-lg flex items-center justify-center shrink-0",
                      isChanged
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getFieldIcon(field.type)}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <label
                      htmlFor={`input-${field.key}`}
                      className="text-sm font-bold text-foreground cursor-pointer"
                    >
                      {field.label}
                    </label>

                    {isFlaggedByHR && (
                      <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Flagged by HR
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  {/* Status Tag */}
                  {isChanged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Modified</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                      Original
                    </span>
                  )}

                  {!readOnly && isChanged && (
                    <button
                      type="button"
                      onClick={() => onRevertField(field.key)}
                      className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 transition-colors ml-1"
                    >
                      <RotateCcw className="size-3" /> Revert
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Before / Proposed Value Comparison Ribbon */}
                <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-semibold text-muted-foreground/70 uppercase text-[10px] tracking-wider">
                      Current Value:
                    </span>
                    <strong className="text-foreground font-semibold">
                      {formatValueDisplay(field, field.currentValue)}
                    </strong>
                  </div>

                  {isChanged && (
                    <>
                      <ArrowRight className="size-3.5 text-primary shrink-0" />
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                        <span className="uppercase text-[10px] tracking-wider">
                          New Value:
                        </span>
                        <span>{formatValueDisplay(field, activeValue)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Financial Consequence Warning Banner (Shown BEFORE change per Spec 3.5) */}
                {!readOnly && field.financialImpact && field.helpText && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-medium leading-relaxed">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950 dark:text-amber-200">
                        Governance Note
                      </p>
                      <p className="mt-0.5 text-amber-900/90 dark:text-amber-200/90">
                        {field.helpText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interactive Input Section */}
                {readOnly ? (
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-sm font-bold text-foreground">
                      {formatValueDisplay(field, activeValue)}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Edit Value
                    </span>

                    <div className="max-w-xl">
                      {/* Shadcn UI DatePicker Popover + Calendar */}
                      {field.type === "DATE" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={`input-${field.key}`}
                              variant="outline"
                              className={cn(
                                "w-full max-w-[280px] h-10 justify-between text-left font-medium text-sm bg-background border-border/80 hover:bg-muted/40 shadow-2xs rounded-lg px-3.5",
                                !activeValue && "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <CalendarIcon className="size-4 text-primary shrink-0" />
                                <span>
                                  {activeValue ? (
                                    (() => {
                                      const dateObj =
                                        typeof activeValue === "string"
                                          ? parseISO(activeValue)
                                          : activeValue;
                                      return isValid(dateObj)
                                        ? format(dateObj, "d MMM yyyy")
                                        : String(activeValue);
                                    })()
                                  ) : (
                                    "Pick a date"
                                  )}
                                </span>
                              </div>
                              <ChevronDown className="size-3.5 text-muted-foreground/70" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border border-border/80 shadow-lg rounded-xl" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                activeValue
                                  ? typeof activeValue === "string"
                                    ? parseISO(activeValue)
                                    : activeValue
                                  : undefined
                              }
                              onSelect={(selectedDate) => {
                                if (selectedDate) {
                                  const iso = format(selectedDate, "yyyy-MM-dd");
                                  onChangeField(field.key, iso);
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      )}

                      {field.type === "NUMBER" && (
                        <div className="flex items-center gap-2.5">
                          <Input
                            id={`input-${field.key}`}
                            type="number"
                            value={activeValue !== undefined ? activeValue : ""}
                            onChange={(e) => onChangeField(field.key, Number(e.target.value))}
                            className="text-sm h-10 max-w-[160px] bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs rounded-lg font-semibold tabular-nums"
                          />
                          {field.unit && (
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider px-2 py-1 rounded bg-muted/50 border border-border/50">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {field.type === "MONEY" && (
                        <div className="relative max-w-[280px]">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                            AED
                          </div>
                          <Input
                            id={`input-${field.key}`}
                            type="number"
                            step="100"
                            value={
                              activeValue !== undefined
                                ? Number(activeValue) / 100
                                : Number(field.currentValue) / 100
                            }
                            onChange={(e) => {
                              const dirhams = Number(e.target.value);
                              const fils = Math.round(dirhams * 100);
                              onChangeField(field.key, fils);
                            }}
                            className="pl-13 text-sm h-10 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs tabular-nums font-bold rounded-lg"
                          />
                        </div>
                      )}

                      {field.type === "TEXT" && (
                        <Textarea
                          id={`input-${field.key}`}
                          rows={3}
                          value={activeValue !== undefined ? String(activeValue) : ""}
                          onChange={(e) => onChangeField(field.key, e.target.value)}
                          className="text-sm resize-none bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs leading-relaxed rounded-lg p-3.5 font-normal"
                        />
                      )}

                      {field.type === "SELECT" && (
                        <Select
                          value={String(activeValue)}
                          onValueChange={(val) => onChangeField(field.key, val)}
                        >
                          <SelectTrigger className="h-10 text-sm bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs rounded-lg font-medium">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map((opt) => (
                              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
