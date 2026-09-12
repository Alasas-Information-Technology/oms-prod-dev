"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { X, Plus, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationCommentsAndTagsProps {
  comments: string;
  onCommentsChange: (comments: string) => void;
  strengthTags: string[];
  onStrengthTagsChange: (tags: string[]) => void;
  developmentTags: string[];
  onDevelopmentTagsChange: (tags: string[]) => void;
  suggestedTags: string[];
  lastSavedAt: string | null;
  isSaving: boolean;
  outcome?: "QUALIFY" | "REJECT" | null;
  disabled?: boolean;
  className?: string;
}

/**
 * Comments & Tag Fields Component (TASK 1 & 2 / Sections 1.3, 3.3)
 *
 * TASK 1:
 * - Auto-growing textarea, minimum 5 rows.
 * - Autosaved 2000ms after typing stops.
 * - Quiet "Saved HH:mm" beside the field (never a toast).
 *
 * TASK 2:
 * - Two tag fields: Strengths, and To develop.
 * - Type and press Enter to add.
 * - Remove with an 'x'.
 * - One-click suggestedTags chips beneath each field.
 * - Free entry allowed.
 */
export function EvaluationCommentsAndTags({
  comments,
  onCommentsChange,
  strengthTags,
  onStrengthTagsChange,
  developmentTags,
  onDevelopmentTagsChange,
  suggestedTags,
  lastSavedAt,
  isSaving,
  outcome,
  disabled = false,
  className,
}: EvaluationCommentsAndTagsProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const [strengthInput, setStrengthInput] = React.useState("");
  const [developmentInput, setDevelopmentInput] = React.useState("");

  // Auto-grow textarea with minimum 5 rows (~120px)
  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minHeight = 120; // 5 rows at ~24px line height
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [comments, adjustHeight]);

  // Formatted quiet save indicator
  const saveStatusText = React.useMemo(() => {
    if (isSaving) return "Saving draft...";
    if (!lastSavedAt) return null;
    const date = new Date(lastSavedAt);
    if (!isValid(date)) return null;
    return `Saved ${format(date, "HH:mm")}`;
  }, [isSaving, lastSavedAt]);

  // Strengths tag handlers
  const handleAddStrength = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!strengthTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onStrengthTagsChange([...strengthTags, trimmed]);
    }
    setStrengthInput("");
  };

  const handleRemoveStrength = (tagToRemove: string) => {
    onStrengthTagsChange(strengthTags.filter((t) => t !== tagToRemove));
  };

  // Development tag handlers
  const handleAddDevelopment = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!developmentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onDevelopmentTagsChange([...developmentTags, trimmed]);
    }
    setDevelopmentInput("");
  };

  const handleRemoveDevelopment = (tagToRemove: string) => {
    onDevelopmentTagsChange(developmentTags.filter((t) => t !== tagToRemove));
  };

  return (
    <section
      aria-labelledby="comments-heading"
      className={cn(
        "bg-card border border-border rounded-xl p-5 sm:p-6 space-y-6 shadow-2xs transition-colors",
        className
      )}
    >
      {/* ── Section Header with Quiet Autosave Indicator ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3
            id="comments-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Your comments & qualitative feedback
          </h3>
          <p className="text-xs text-muted-foreground">
            {outcome === "REJECT"
              ? "Required on reject (UAE PDPL statutory observations)"
              : outcome === "QUALIFY"
              ? "Optional on qualify"
              : "Optional on qualify · Required if rejecting"}
          </p>
        </div>

        {/* Quiet save indicator beside the field per TASK 1 (Not a toast) */}
        {saveStatusText && (
          <div
            aria-live="polite"
            className={cn(
              "text-[11px] font-medium transition-colors px-2 py-0.5 rounded-md",
              isSaving
                ? "text-amber-600 dark:text-amber-400 animate-pulse bg-amber-500/10"
                : "text-muted-foreground bg-muted/40"
            )}
          >
            {saveStatusText}
          </div>
        )}
      </div>

      {/* ── TASK 1: Auto-Growing Textarea (Min 5 rows) ── */}
      <div className="space-y-2">
        <label
          htmlFor="evaluation-comments-input"
          className="text-xs font-semibold text-foreground flex items-center justify-between flex-wrap gap-1"
        >
          <span className="flex items-center gap-2">
            <span>Interviewer observations</span>
            <span
              className={cn(
                "text-[11px] font-normal px-1.5 py-0.2 rounded border",
                outcome === "REJECT"
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold border-rose-500/30"
                  : "bg-muted/60 text-muted-foreground border-border/60"
              )}
            >
              {outcome === "REJECT"
                ? "Required on reject"
                : outcome === "QUALIFY"
                ? "Optional on qualify"
                : "Required on reject · Optional on qualify"}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground font-normal">
            Autosaves 2s after typing
          </span>
        </label>

        <textarea
          id="evaluation-comments-input"
          ref={textareaRef}
          rows={5}
          disabled={disabled}
          value={comments}
          onChange={(e) => {
            onCommentsChange(e.target.value);
            adjustHeight();
          }}
          placeholder="Summarize candidate's technical competencies, problem solving demeanor, communication strengths, or areas for development..."
          className={cn(
            "w-full min-h-[120px] p-3.5 rounded-lg text-sm bg-background border border-border resize-none leading-relaxed transition-all",
            "focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary",
            "placeholder:text-muted-foreground/60",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      </div>

      {/* ── TASK 2: Two Tag Fields (Strengths & To Develop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/80">
        {/* Field 1: Strengths */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="strength-tag-input"
              className="text-xs font-semibold text-foreground"
            >
              Strengths
            </label>
            <span className="text-[11px] text-muted-foreground">Press Enter to add</span>
          </div>

          {/* Active Strengths Chips */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
            {strengthTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 shadow-2xs animate-in fade-in zoom-in-95 duration-150"
              >
                <span>+ {tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStrength(tag)}
                    aria-label={`Remove strength ${tag}`}
                    className="size-3.5 rounded-full hover:bg-emerald-500/20 inline-flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </span>
            ))}
            {strengthTags.length === 0 && (
              <span className="text-xs text-muted-foreground/60 italic py-1">
                No strength tags added yet
              </span>
            )}
          </div>

          {/* Input field */}
          <div className="flex items-center gap-2">
            <input
              id="strength-tag-input"
              type="text"
              disabled={disabled}
              value={strengthInput}
              onChange={(e) => setStrengthInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddStrength(strengthInput);
                }
              }}
              placeholder="Add a strength (e.g. SIEM & SOC)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-border bg-background placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              disabled={!strengthInput.trim() || disabled}
              onClick={() => handleAddStrength(strengthInput)}
              className="px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>

          {/* One-click suggestions for Strengths */}
          {suggestedTags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
                Suggested from profile:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {suggestedTags.map((suggestion) => {
                  const isAdded = strengthTags.some(
                    (t) => t.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <button
                      key={`strength-sug-${suggestion}`}
                      type="button"
                      disabled={isAdded || disabled}
                      onClick={() => handleAddStrength(suggestion)}
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-md border transition-all inline-flex items-center gap-1",
                        isAdded
                          ? "bg-muted/40 text-muted-foreground/60 border-border/60 cursor-default"
                          : "bg-background hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-800 dark:hover:text-emerald-300 border-border hover:border-emerald-500/30 cursor-pointer shadow-2xs"
                      )}
                    >
                      {isAdded ? <Check className="size-2.5" /> : <Plus className="size-2.5" />}
                      <span>{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Field 2: To develop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="development-tag-input"
              className="text-xs font-semibold text-foreground"
            >
              To develop
            </label>
            <span className="text-[11px] text-muted-foreground">Press Enter to add</span>
          </div>

          {/* Active Development Chips */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
            {developmentTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 shadow-2xs animate-in fade-in zoom-in-95 duration-150"
              >
                <span>+ {tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDevelopment(tag)}
                    aria-label={`Remove development area ${tag}`}
                    className="size-3.5 rounded-full hover:bg-amber-500/20 inline-flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </span>
            ))}
            {developmentTags.length === 0 && (
              <span className="text-xs text-muted-foreground/60 italic py-1">
                No development areas added yet
              </span>
            )}
          </div>

          {/* Input field */}
          <div className="flex items-center gap-2">
            <input
              id="development-tag-input"
              type="text"
              disabled={disabled}
              value={developmentInput}
              onChange={(e) => setDevelopmentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDevelopment(developmentInput);
                }
              }}
              placeholder="Add area to develop (e.g. DIEZ processes)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-border bg-background placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              disabled={!developmentInput.trim() || disabled}
              onClick={() => handleAddDevelopment(developmentInput)}
              className="px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>

          {/* One-click suggestions for Development */}
          {suggestedTags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-amber-600 dark:text-amber-400" />
                Suggested from profile:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {suggestedTags.map((suggestion) => {
                  const isAdded = developmentTags.some(
                    (t) => t.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <button
                      key={`dev-sug-${suggestion}`}
                      type="button"
                      disabled={isAdded || disabled}
                      onClick={() => handleAddDevelopment(suggestion)}
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-md border transition-all inline-flex items-center gap-1",
                        isAdded
                          ? "bg-muted/40 text-muted-foreground/60 border-border/60 cursor-default"
                          : "bg-background hover:bg-amber-500/10 text-muted-foreground hover:text-amber-800 dark:hover:text-amber-300 border-border hover:border-amber-500/30 cursor-pointer shadow-2xs"
                      )}
                    >
                      {isAdded ? <Check className="size-2.5" /> : <Plus className="size-2.5" />}
                      <span>{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
