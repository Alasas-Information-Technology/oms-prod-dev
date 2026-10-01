"use client";

import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HrReviewDetailResponse } from "@/types/hr-review";
import {
  ApproveOmsDialog,
  PermanentHireDialog,
  RejectDialog,
} from "./HrReviewDecisionDialogs";
import { useRouter } from "next/navigation";

interface HrReviewDecisionBarProps {
  detail: HrReviewDetailResponse;
  activeDialog: "APPROVE" | "PERM_HIRE" | "REJECT" | null;
  setActiveDialog: (dialog: "APPROVE" | "PERM_HIRE" | "REJECT" | null) => void;
  onSuccess: (action: string) => void;
}

export function HrReviewDecisionBar({ detail, activeDialog, setActiveDialog, onSuccess }: HrReviewDecisionBarProps) {
  const router = useRouter();
  
  if (!detail.canDecide) {
    return null;
  }

  // handleSuccess removed to be passed from parent

  return (
    <>
      <div className="sticky bottom-4 z-20 mt-8 flex w-full flex-wrap items-center justify-between rounded-lg border border-border/80 bg-card/95 backdrop-blur-md px-5 py-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveDialog("APPROVE")}
            variant="default"
            size="sm"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white font-semibold shadow-xs gap-1.5 h-9 px-4 cursor-pointer"
          >
            <CheckCircle2 className="size-4" />
            Approve as OMS
          </Button>

          <Button
            onClick={() => router.push(`/app/hr-review/${encodeURIComponent(detail.request.id)}/send-back`)}
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 font-medium gap-1.5 h-9 px-3.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Send back
          </Button>
        </div>

        <div className="flex items-center gap-3 pl-4 md:border-l md:border-border">
          <Button
            onClick={() => setActiveDialog("PERM_HIRE")}
            variant="outline"
            size="sm"
            className="border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 font-medium gap-1.5 h-9 px-3.5 cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            Convert to permanent hire
          </Button>

          <Button
            onClick={() => setActiveDialog("REJECT")}
            variant="outline"
            size="sm"
            className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 font-medium gap-1.5 h-9 px-3.5 cursor-pointer"
          >
            <XCircle className="size-3.5" />
            Reject
          </Button>
        </div>
      </div>

      {activeDialog === "APPROVE" && (
        <ApproveOmsDialog
          open={true}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          detail={detail}
          onSuccess={() => onSuccess("Approved")}
        />
      )}

      {activeDialog === "PERM_HIRE" && (
        <PermanentHireDialog
          open={true}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          detail={detail}
          onSuccess={() => onSuccess("Converted")}
        />
      )}

      {activeDialog === "REJECT" && (
        <RejectDialog
          open={true}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          detail={detail}
          onSuccess={() => onSuccess("Rejected")}
        />
      )}
    </>
  );
}
