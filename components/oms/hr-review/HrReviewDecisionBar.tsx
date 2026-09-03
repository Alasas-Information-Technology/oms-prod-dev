"use client";

import { Button } from "@/components/ui/button";
import { HrReviewDetailResponse } from "@/types/hr-review";
import {
  ApproveOmsDialog,
  SendBackDialog,
  PermanentHireDialog,
  RejectDialog,
} from "./HrReviewDecisionDialogs";
import { useRouter } from "next/navigation";

interface HrReviewDecisionBarProps {
  detail: HrReviewDetailResponse;
  activeDialog: "APPROVE" | "SEND_BACK" | "PERM_HIRE" | "REJECT" | null;
  setActiveDialog: (dialog: "APPROVE" | "SEND_BACK" | "PERM_HIRE" | "REJECT" | null) => void;
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
      <div className="sticky bottom-0 z-10 mt-6 flex w-full items-center border-t border-border bg-background py-4">
        <Button onClick={() => setActiveDialog("APPROVE")} variant="default" size="sm">
          Approve as OMS
        </Button>

        <Button
          onClick={() => router.push(`/app/hr-review/${encodeURIComponent(detail.request.id)}/send-back`)}
          variant="outline"
          size="sm"
          className="ml-3"
        >
          Send back
        </Button>

        <div className="ml-auto flex items-center gap-3 pl-8 border-l border-border">
          <Button onClick={() => setActiveDialog("PERM_HIRE")} variant="outline" size="sm">
            Convert to permanent hire
          </Button>

          <Button
            onClick={() => setActiveDialog("REJECT")}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive-light hover:text-destructive"
          >
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

      {activeDialog === "SEND_BACK" && (
        <SendBackDialog
          open={true}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          detail={detail}
          onSuccess={() => onSuccess("Sent back")}
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
