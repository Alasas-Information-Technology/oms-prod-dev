"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApprovalTaskDetail } from "@/lib/types/approval.types";
import { ApprovalGuard } from "./ApprovalGuard";
import { ApproveDialog } from "./dialogs/ApproveDialog";
import { SendBackDialog } from "./dialogs/SendBackDialog";
import { RejectDialog } from "./dialogs/RejectDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Undo2, XCircle, ShieldAlert, History } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalDecisionBarProps {
  detail: ApprovalTaskDetail;
  onSuccess?: () => void;
}

export function ApprovalDecisionBar({
  detail,
  onSuccess,
}: ApprovalDecisionBarProps) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const canApprove = detail.preflight.allPassed;
  const disabledReason =
    detail.preflight.blockingMessage ||
    "Approval disabled: One or more preflight checks have not passed.";

  const handleDecisionSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/app/requests?tab=needs-my-action");
    }
  };

  return (
    <ApprovalGuard taskDetail={detail}>
      <div className="sticky bottom-0 z-20 -mx-6 -mb-6 p-5 bg-card/95 backdrop-blur-md border-t border-border/80 rounded-b-lg shadow-lg flex flex-col gap-3">
        {/* Audit Trail Note */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <History className="size-3.5 text-muted-foreground/70 shrink-0" />
          <span>
            Your decision and the budget before/after values will be written to the permanent audit history.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* 1. Approve Button (Primary) */}
          <div className="flex-1">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  {/* Tooltip trigger wrapper so disabled buttons can receive hover events */}
                  <span className="w-full inline-block">
                    <Button
                      type="button"
                      variant="default"
                      disabled={!canApprove}
                      onClick={() => setApproveOpen(true)}
                      className={cn(
                        "w-full font-semibold gap-2 shadow-sm",
                        canApprove
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canApprove && (
                  <TooltipContent side="top" className="max-w-[280px] p-2.5 bg-slate-900 text-white text-xs">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="size-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{disabledReason}</span>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 2. Send Back Button (Outline) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setSendBackOpen(true)}
            className="flex-1 font-medium border-amber-300/80 text-amber-900 hover:bg-amber-50 hover:text-amber-950 dark:border-amber-700/60 dark:text-amber-300 dark:hover:bg-amber-950/30 gap-1.5"
          >
            <Undo2 className="size-4 text-amber-600" />
            Send back
          </Button>

          {/* 3. Reject Button (Danger Outline) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectOpen(true)}
            className="flex-1 font-medium border-red-300/80 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-700/60 dark:text-red-400 dark:hover:bg-red-950/30 gap-1.5"
          >
            <XCircle className="size-4 text-red-600" />
            Reject
          </Button>
        </div>

        {/* If preflight checks failed, show inline stated reason below the bar */}
        {!canApprove && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-red-50/80 border border-red-200 text-xs text-red-800">
            <ShieldAlert className="size-4 text-red-600 shrink-0" />
            <span className="font-medium">Cannot approve: {disabledReason}</span>
          </div>
        )}

        {/* Dialogs */}
        <ApproveDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          detail={detail}
          onSuccess={handleDecisionSuccess}
        />
        <SendBackDialog
          open={sendBackOpen}
          onOpenChange={setSendBackOpen}
          detail={detail}
          onSuccess={handleDecisionSuccess}
        />
        <RejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          detail={detail}
          onSuccess={handleDecisionSuccess}
        />
      </div>
    </ApprovalGuard>
  );
}
