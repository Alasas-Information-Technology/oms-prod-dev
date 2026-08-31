"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FilePenLine,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { HrDispositionDialog } from "./HrDispositionDialog";
import {
  HrDispositionDefinition,
  HrDispositionSubmission,
  HrReviewRequest,
} from "./hr-review.types";

interface HrDispositionPanelProps {
  request: HrReviewRequest;
  actions: HrDispositionDefinition[];
  onSubmit: (
    submission: HrDispositionSubmission
  ) => void | Promise<void>;
}

const ACTION_ICONS = {
  "approve-oms": CheckCircle2,
  "request-more-info": HelpCircle,
  "request-info-with-approval":
    RotateCcw,
  "amend-request": FilePenLine,
  "approve-permanent-hire":
    UserRoundCheck,
  reject: XCircle,
};

export function HrDispositionPanel({
  request,
  actions,
  onSubmit,
}: HrDispositionPanelProps) {
  const [selectedAction, setSelectedAction] =
    useState<HrDispositionDefinition | null>(
      null
    );

  return (
    <>
      <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              HR Disposition
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Select an outcome after
              completing the policy,
              approval and budget review.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {actions.map((action) => {
            const Icon =
              ACTION_ICONS[action.id];

            const isPrimary =
              action.tone === "primary";

            const isDanger =
              action.tone === "danger";

            return (
              <button
                key={action.id}
                type="button"
                onClick={() =>
                  setSelectedAction(action)
                }
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",

                  isPrimary &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",

                  isDanger &&
                    "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",

                  !isPrimary &&
                    !isDanger &&
                    "border-border bg-white text-foreground hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",

                    isPrimary &&
                      "bg-white/15",

                    isDanger &&
                      "bg-red-100",

                    !isPrimary &&
                      !isDanger &&
                      "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block whitespace-normal text-sm font-semibold">
                    {action.label}
                  </span>

                  <span
                    className={cn(
                      "mt-1 block whitespace-normal text-xs leading-5",

                      isPrimary
                        ? "text-primary-foreground/80"
                        : isDanger
                          ? "text-red-600"
                          : "text-muted-foreground"
                    )}
                  >
                    {action.description}
                  </span>
                </span>

                <ArrowRight className="size-4 shrink-0 opacity-60" />
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          Return to top
        </Button>
      </Card>

      <HrDispositionDialog
        open={selectedAction !== null}
        request={request}
        action={selectedAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAction(null);
          }
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}