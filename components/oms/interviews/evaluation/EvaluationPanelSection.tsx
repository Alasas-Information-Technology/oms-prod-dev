"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bell,
  Check,
} from "lucide-react";
import {
  PanelEvaluation,
  PanelContributor,
  EvaluationCriterion,
} from "@/src/types/interview-evaluation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EvaluationPanelSectionProps {
  panel: PanelEvaluation;
  criteriaDefinitions?: EvaluationCriterion[];
  className?: string;
}

/**
 * Panel Section Component (TASK 3, 4, 5 / Sections 1.3, 3.4)
 *
 * TASK 3:
 * - Render ONLY when panel.isPanel is true.
 * - Header shows "2 of 3" completed count.
 * - Contributor rows show name, role, overall score, status.
 * - Current user has a "You" badge.
 * - Expandable to reveal individual per-criterion ratings.
 *
 * TASK 4:
 * - Surface panel disagreements prominently in warning tone:
 *   "The panel disagreed on Communication — 5, 3, 2."
 *
 * TASK 5:
 * - Inline "Remind" action beside PENDING contributors ONLY.
 */
export function EvaluationPanelSection({
  panel,
  criteriaDefinitions = [],
  className,
}: EvaluationPanelSectionProps) {
  // Expanded contributors state (set of userIds)
  const [expandedUsers, setExpandedUsers] = React.useState<Record<string, boolean>>({});

  // Reminded state for pending contributors
  const [remindedUsers, setRemindedUsers] = React.useState<Record<string, boolean>>({});

  // CRITICAL ACCEPTANCE: Single interviewer fixture (panel.isPanel === false) must be absent from DOM
  if (!panel.isPanel) {
    return null;
  }

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleRemind = (userId: string) => {
    setRemindedUsers((prev) => ({
      ...prev,
      [userId]: true,
    }));
  };

  // Map criterion code to human-readable label
  const getCriterionLabel = (code: string) => {
    const found = criteriaDefinitions.find((c) => c.code === code);
    if (found) return found.label;
    // Format fallback: e.g. "COMMUNICATION" -> "Communication"
    return code
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <section
      aria-labelledby="panel-heading"
      className={cn(
        "bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs transition-colors",
        className
      )}
    >
      {/* ── Section Header with Progress (e.g. "2 of 3") ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3
            id="panel-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            The panel
          </h3>
          <p className="text-xs text-muted-foreground">
            Independent evaluations from designated panel members
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-xs font-semibold text-foreground">
          <span>{`${panel.completedCount} of ${panel.targetCount}`}</span>
          <span className="text-[11px] text-muted-foreground font-normal">
            completed
          </span>
        </div>
      </div>

      {/* ── TASK 4: Disagreement Callouts (Fixture d) ── */}
      {panel.disagreements && panel.disagreements.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          className="space-y-2 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-medium"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Rating divergence detected</span>
          </div>

          <div className="space-y-1 pl-6">
            {panel.disagreements.map((disagreement) => {
              const criterionName = getCriterionLabel(disagreement.criterionCode);
              return (
                <p key={disagreement.criterionCode} className="leading-relaxed">
                  The panel disagreed on{" "}
                  <span className="font-bold underline decoration-amber-500/40">
                    {criterionName}
                  </span>{" "}
                  — {disagreement.ratings.join(", ")}.
                </p>
              );
            })}
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 pl-6">
            Disagreements are preserved to inform the Main Interviewer&apos;s final qualification decision.
          </p>
        </div>
      )}

      {/* ── Contributor List ── */}
      <div className="space-y-2 divide-y divide-border/60">
        {panel.contributors.map((contrib: PanelContributor) => {
          const isExpanded = Boolean(expandedUsers[contrib.userId]);
          const isComplete = contrib.status === "COMPLETE";
          const isPending = contrib.status === "PENDING";
          const isReminded = Boolean(remindedUsers[contrib.userId]);
          const hasCriteria = contrib.criteria && contrib.criteria.length > 0;

          return (
            <div key={contrib.userId} className="pt-3 first:pt-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Left: Status icon, Name, Role, 'You' badge */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0 mt-0.5 sm:mt-0">
                    {isComplete ? (
                      <CheckCircle2
                        className="size-4 text-emerald-600 dark:text-emerald-400"
                        aria-label="Completed"
                      />
                    ) : (
                      <Clock
                        className="size-4 text-amber-600 dark:text-amber-400"
                        aria-label="Pending"
                      />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {contrib.name}
                      </span>
                      {contrib.isYou && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {contrib.role}
                    </p>
                  </div>
                </div>

                {/* Right: Score, Remind Action (PENDING only), Expand Button */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {/* Score */}
                  <div>
                    {contrib.overallScore !== null ? (
                      <span className="text-sm font-bold text-foreground">
                        {contrib.overallScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/70 italic">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* TASK 5: Inline 'Remind' action beside PENDING contributors ONLY */}
                  {isPending && (
                    <div>
                      {isReminded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <Check className="size-3" />
                          Reminded
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemind(contrib.userId)}
                          className="h-7 px-2.5 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Bell className="size-3" />
                          Remind
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Expand / Collapse individual scorecard */}
                  {hasCriteria && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(contrib.userId)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Hide" : "Show"} ratings for ${contrib.name}`}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Contributor Scorecard */}
              {isExpanded && hasCriteria && (
                <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 space-y-2 text-xs animate-in fade-in-50 duration-150">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/40 pb-1.5">
                    {contrib.name}&apos;s Criterion Ratings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {contrib.criteria.map((crit) => (
                      <div
                        key={crit.code}
                        className="flex items-center justify-between p-1.5 rounded bg-background/60 border border-border/40"
                      >
                        <span className="text-muted-foreground font-medium truncate mr-2">
                          {getCriterionLabel(crit.code)}
                        </span>
                        <span
                          className={cn(
                            "size-5 rounded flex items-center justify-center font-bold text-xs shrink-0",
                            crit.rating
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {crit.rating ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
