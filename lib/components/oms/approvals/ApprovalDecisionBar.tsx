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
      <div className="sticky bottom-4 z-20 p-4 sm:p-5 bg-card border border-border rounded-xl shadow-md flex flex-col gap-3.5">
        {/* Audit Trail Note */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <History className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            Your decision and the budget ledger values will be officially recorded in the permanent audit trail.
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
                        "w-full font-semibold gap-2 h-10 text-sm shadow-xs rounded-lg transition-colors",
                        canApprove
                          ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                          : "opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <CheckCircle2 className="size-4 stroke-[2]" />
                      Approve Requisition
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canApprove && (
                  <TooltipContent side="top" className="max-w-[280px] p-2.5 bg-popover text-popover-foreground border border-border text-xs shadow-md">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="size-4 text-rose-500 shrink-0 mt-0.5" />
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
            className="flex-1 font-medium border-border text-foreground hover:bg-muted h-10 text-sm gap-1.5 transition-colors rounded-lg"
          >
            <Undo2 className="size-4 text-muted-foreground stroke-[2]" />
            Send Back
          </Button>

          {/* 3. Reject Button (Danger Outline) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectOpen(true)}
            className="flex-1 font-medium border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 h-10 text-sm gap-1.5 transition-colors rounded-lg"
          >
            <XCircle className="size-4 text-rose-600 dark:text-rose-400 stroke-[2]" />
            Reject
          </Button>
        </div>

        {/* If preflight checks failed, show inline stated reason below the bar */}
        {!canApprove && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200">
            <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">Action Restricted: {disabledReason}</span>
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
