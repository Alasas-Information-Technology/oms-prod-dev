"use client";

import * as React from "react";
import {
  CheckCircle2,
  UserX,
  CalendarX,
  XCircle,
  ArrowRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationChoice } from "@/src/types/interview-evaluation";
import { cn } from "@/lib/utils";

export type { ConfirmationChoice };

interface ConfirmationOption {
  id: ConfirmationChoice;
  title: string;
  consequence: string;
  icon: LucideIcon;
}

const CONFIRMATION_OPTIONS: ConfirmationOption[] = [
  {
    id: "WENT_AHEAD",
    title: "It went ahead",
    consequence: "Reveals the evaluation form to record scorecards and decide the outcome.",
    icon: CheckCircle2,
  },
  {
    id: "CANDIDATE_NO_SHOW",
    title: "The candidate didn't attend",
    consequence: "No-show: offer new times or reject the candidate.",
    icon: UserX,
  },
  {
    id: "CANCELLED",
    title: "It was cancelled",
    consequence: "Returns the requisition to interview scheduling to arrange a new date.",
    icon: CalendarX,
  },
  {
    id: "CANDIDATE_WITHDREW",
    title: "The candidate withdrew",
    consequence: "Closes this candidate's application and updates position status.",
    icon: XCircle,
  },
];

interface InterviewConfirmationBranchProps {
  candidateRef: string;
  position: string;
  onConfirm: (choice: ConfirmationChoice) => Promise<void> | void;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Interview Confirmation Branch (TASK 5 / RFP Step 6 / Part 3.1)
 * Rendered exclusively when interview.occurred is false (e.g. Fixture e).
 * Prevents scorecard rendering until the interview occurrence is confirmed.
 */
export function InterviewConfirmationBranch({
  candidateRef,
  position,
  onConfirm,
  isSubmitting = false,
  className,
}: InterviewConfirmationBranchProps) {
  const [selectedChoice, setSelectedChoice] = React.useState<ConfirmationChoice>("WENT_AHEAD");
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const handleAction = async () => {
    if (selectedChoice === "WENT_AHEAD") {
      await onConfirm("WENT_AHEAD");
    } else {
      const selected = CONFIRMATION_OPTIONS.find((o) => o.id === selectedChoice);
      setActionNotice(selected?.consequence || "Action recorded.");
      await onConfirm(selectedChoice);
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto py-10 px-4", className)}>
      <div className="bg-card border border-border rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Did the interview take place?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Per RFP Step 6, the interview panel must confirm whether the session took place
            with candidate <span className="font-semibold text-foreground">{candidateRef}</span> for{" "}
            <span className="font-semibold text-foreground">{position}</span> before ratings can be entered.
          </p>
        </div>

        {/* 4 Radio Cards */}
        <div
          role="radiogroup"
          aria-label="Did the interview take place?"
          className="grid grid-cols-1 gap-3"
        >
          {CONFIRMATION_OPTIONS.map((option) => {
            const isSelected = selectedChoice === option.id;
            const Icon = option.icon;

            return (
              <label
                key={option.id}
                onClick={() => setSelectedChoice(option.id)}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-lg border text-left cursor-pointer transition-all",
                  isSelected
                    ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
                    : "bg-card border-border hover:bg-muted/30 hover:border-border/80"
                )}
              >
                <div className="pt-0.5">
                  <input
                    type="radio"
                    name="interview-confirmation-choice"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedChoice(option.id)}
                    className="size-4 text-primary focus:ring-primary/40 focus:ring-offset-0 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold tracking-tight",
                        isSelected ? "text-foreground" : "text-foreground/90"
                      )}
                    >
                      {option.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {option.consequence}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Action Notice if non-went-ahead branch is recorded */}
        {actionNotice && (
          <div className="p-3 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Action consequence: </span>
            {actionNotice}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
          <span className="text-[11px] text-muted-foreground order-2 sm:order-1">
            {selectedChoice === "WENT_AHEAD"
              ? "Selecting this opens the evaluation scorecard."
              : "Submitting this closes or reroutes the evaluation step."}
          </span>

          <Button
            type="button"
            onClick={handleAction}
            disabled={isSubmitting}
            className="w-full sm:w-auto font-semibold text-xs h-9 px-4 gap-1.5 cursor-pointer order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Updating...
              </>
            ) : selectedChoice === "WENT_AHEAD" ? (
              <>
                Continue to evaluation
                <ArrowRight className="size-3.5" />
              </>
            ) : (
              "Confirm outcome"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
