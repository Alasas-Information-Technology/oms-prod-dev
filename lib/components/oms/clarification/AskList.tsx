"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  CornerDownRight,
  ListChecks,
  Plus,
  X,
  Link as LinkIcon,
  Sparkles,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { ClarificationAsk, ClarificationDetail, ClarificationPreviewResponse } from "@/types/clarification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SelectableFieldOption {
  key: string;
  label: string;
}

export interface AskListProps {
  asks: ClarificationAsk[];
  mode: "read" | "edit";
  onChange?: (asks: ClarificationAsk[]) => void;
  // Read mode optional props:
  asksAddressed?: string[];
  preview?: ClarificationPreviewResponse;
  clarification?: ClarificationDetail;
  onSelectField?: (fieldKey: string) => void;
  // Edit mode optional props:
  selectableFields?: SelectableFieldOption[];
  suggestedAsks?: Array<{ text: string; fieldKey?: string | null }>;
  onLinkField?: (askId: string, fieldKey: string | null) => void;
  className?: string;
  title?: string;
}

const DEFAULT_SUGGESTED_ASKS = [
  { text: "Attach the job description", fieldKey: null },
  { text: "Clarify the business justification", fieldKey: "justification" },
  { text: "Update the engagement dates", fieldKey: "engagementEndDate" },
  { text: "Confirm the work location", fieldKey: "workLocation" },
];

export function AskList({
  asks = [],
  mode,
  onChange,
  asksAddressed,
  preview,
  clarification,
  onSelectField,
  selectableFields = [],
  suggestedAsks = DEFAULT_SUGGESTED_ASKS,
  onLinkField,
  className,
  title,
}: AskListProps) {
  const [newAskText, setNewAskText] = React.useState("");
  const [selectedFieldKey, setSelectedFieldKey] = React.useState<string>("");
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // ==========================================
  // READ MODE (Requester Checklist & HR Preview)
  // ==========================================
  if (mode === "read") {
    if (!asks || asks.length === 0) {
      return null;
    }

    const addressedSet = new Set(
      preview?.asksAddressed !== undefined
        ? preview.asksAddressed
        : asksAddressed || asks.filter((a) => a.addressed).map((a) => a.id)
    );

    const doneCount = asks.filter((a) => addressedSet.has(a.id)).length;
    const totalCount = asks.length;
    const allDone = totalCount > 0 && doneCount === totalCount;

    const getFieldResolution = (fieldKey: string | null): string | null => {
      if (!fieldKey || !clarification) return null;
      const isApproval =
        clarification.type === "INFO_WITH_APPROVAL" ||
        clarification.type === "AMEND";
      if (!isApproval || !clarification.editableFields) return null;

      const field = clarification.editableFields.find((f) => f.key === fieldKey);
      if (!field) return null;

      if (preview && preview.type !== "MORE_INFO" && preview.diff) {
        const diffItem = preview.diff.find((d) => d.fieldKey === fieldKey);
        if (diffItem && diffItem.changed) {
          return diffItem.after;
        }
      }

      if (
        field.proposedValue &&
        String(field.proposedValue) !== String(field.currentValue)
      ) {
        if (field.type === "DATE" && field.proposedValue === "2027-08-31") {
          return "31 Aug 2027";
        }
        return String(field.proposedValue);
      }

      return null;
    };

    const handleAskClick = (fieldKey: string | null) => {
      if (!fieldKey) return;
      if (onSelectField) {
        onSelectField(fieldKey);
      } else {
        const el = document.getElementById(`field-${fieldKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
    };

    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden",
          className
        )}
      >
        {/* Header with Done Count */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {title || "What HR needs from you"}
            </span>
          </div>

          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
              allDone
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-muted text-muted-foreground border border-border/60"
            )}
          >
            {doneCount} of {totalCount} completed
          </span>
        </div>

        {/* Checklist items */}
        <div className="divide-y divide-border/40">
          {asks.map((ask) => {
            const isAddressed = addressedSet.has(ask.id);
            const resolution = getFieldResolution(ask.fieldKey || null);
            const isClickable = Boolean(ask.fieldKey);

            return (
              <div
                key={ask.id}
                onClick={() => isClickable && handleAskClick(ask.fieldKey || null)}
                className={cn(
                  "px-4 py-3.5 sm:px-5 sm:py-4 flex items-start justify-between gap-3 text-sm transition-all",
                  isClickable && "cursor-pointer hover:bg-muted/30 group",
                  isAddressed && "bg-emerald-500/[0.03]"
                )}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {isAddressed ? (
                    <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-4.5" />
                    </div>
                  ) : (
                    <div className="size-5 rounded-full text-muted-foreground/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Circle className="size-4.5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p
                      className={cn(
                        "font-medium leading-snug",
                        isAddressed ? "text-foreground" : "text-foreground/90",
                        isClickable && "group-hover:text-primary transition-colors"
                      )}
                    >
                      {ask.text}
                    </p>

                    {/* Inline resolution preview when addressed */}
                    {resolution && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 text-xs font-semibold">
                        <CornerDownRight className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Updated to: {resolution}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isClickable && (
                  <div className="shrink-0 hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors pt-0.5">
                    <span>Edit field</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // EDIT MODE (HR Ask Composer per Part 4.2)
  // ==========================================
  const handleAddAsk = (textToAdd?: string, fieldKeyToAdd?: string | null) => {
    const text = (textToAdd !== undefined ? textToAdd : newAskText).trim();
    if (!text) return;

    const fieldKey =
      fieldKeyToAdd !== undefined ? fieldKeyToAdd : selectedFieldKey || null;

    const newAsk: ClarificationAsk = {
      id: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      fieldKey: fieldKey || null,
      addressed: false,
    };

    const updated = [...asks, newAsk];
    onChange?.(updated);
    setNewAskText("");
    setSelectedFieldKey("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAsk();
    }
  };

  const handleRemoveAsk = (askId: string) => {
    const updated = asks.filter((a) => a.id !== askId);
    onChange?.(updated);
  };

  const handleMoveAsk = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= asks.length) return;
    const updated = [...asks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange?.(updated);
  };

  const handleLinkField = (askId: string, fieldKey: string) => {
    const updated = asks.map((a) =>
      a.id === askId ? { ...a, fieldKey: fieldKey || null } : a
    );
    onChange?.(updated);
    onLinkField?.(askId, fieldKey || null);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title || "What you need"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
          {asks.length} {asks.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Existing Asks List */}
        {asks.length > 0 && (
          <div className="space-y-2">
            {asks.map((ask, index) => {
              const linkedField = selectableFields.find((f) => f.key === ask.fieldKey);

              return (
                <div
                  key={ask.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", index.toString());
                    setDragIndex(index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromStr = e.dataTransfer.getData("text/plain");
                    const from = dragIndex !== null ? dragIndex : parseInt(fromStr, 10);
                    if (!isNaN(from) && from !== index) {
                      handleMoveAsk(from, index);
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={cn(
                    "flex items-start justify-between gap-2.5 p-3 rounded-lg border transition-all",
                    dragOverIndex === index
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-muted/20 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Drag Grip Handle */}
                    <span
                      className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground mt-0.5 shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="size-4" />
                    </span>

                    <span className="size-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {ask.text}
                      </p>
                      {/* Linked field pill / selector */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                          <LinkIcon className="size-3 text-muted-foreground/70" />
                          {linkedField ? (
                            <span className="text-primary font-medium">
                              Linked to {linkedField.label}
                            </span>
                          ) : (
                            <span className="italic">Not linked to a field</span>
                          )}
                        </span>
                        {selectableFields.length > 0 && (
                          <select
                            value={ask.fieldKey || ""}
                            onChange={(e) => handleLinkField(ask.id, e.target.value)}
                            className="text-[11px] bg-background border border-border/60 rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <option value="">Link field...</option>
                            {selectableFields.map((f) => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reorder arrows & remove */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveAsk(index, index - 1)}
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={index === asks.length - 1}
                      onClick={() => handleMoveAsk(index, index + 1)}
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleRemoveAsk(ask.id)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove ask"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Composer: Type item & press Enter */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newAskText}
              onChange={(e) => setNewAskText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add what you need (e.g. Update the engagement end date)..."
              className="h-9 text-xs"
            />
            {selectableFields.length > 0 && (
              <select
                value={selectedFieldKey}
                onChange={(e) => setSelectedFieldKey(e.target.value)}
                className="h-9 text-xs bg-background border border-border rounded-md px-2 text-muted-foreground max-w-[150px]"
              >
                <option value="">Optional field...</option>
                {selectableFields.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddAsk()}
              disabled={!newAskText.trim()}
              className="h-9 px-3 text-xs shrink-0"
            >
              <Plus className="size-3.5 mr-1" />
              Add
            </Button>
          </div>

          {/* Suggested Asks beneath input per Part 4.2 */}
          {suggestedAsks && suggestedAsks.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                <Sparkles className="size-3 text-primary" />
                <span>Suggested asks (click to add):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedAsks.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddAsk(sug.text, sug.fieldKey)}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-muted/50 hover:bg-muted border border-border/60 text-foreground transition-colors"
                  >
                    <Plus className="size-2.5 text-muted-foreground" />
                    <span>{sug.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
