"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { useApprovalDetail } from "@/hooks/useApprovalDetail";
import { ApprovalDetailShell } from "@/components/oms/approvals/ApprovalDetailShell";
import { ApprovalDetailSkeleton } from "@/components/oms/approvals/ApprovalDetailSkeleton";
import { ApprovalSubjectDetail } from "@/components/oms/approvals/ApprovalSubjectDetail";
import { ApprovalHistory } from "@/components/oms/approvals/ApprovalHistory";
import { ApprovalImpactPanel } from "@/components/oms/approvals/ApprovalImpactPanel";
import { ApprovalPreflightPanel } from "@/components/oms/approvals/ApprovalPreflightPanel";
import { ApprovalDecisionBar } from "@/components/oms/approvals/ApprovalDecisionBar";
import { RequisitionSubject, RequisitionImpact } from "@/lib/types/approval.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApprovalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const { data: detail, isLoading, error, refetch } = useApprovalDetail(id);

  // Fallback to 404 natively if out of scope or doesn't exist
  if (error) {
    notFound();
  }

  if (isLoading || !detail) {
    return (
      <div className="p-6">
        <ApprovalDetailSkeleton />
      </div>
    );
  }

  return (
    <ApprovalDetailShell
      detail={detail}
      leftColumn={
        <>
          <div className="p-6 rounded-xl border border-border/40 bg-card shadow-sm">
            <ApprovalSubjectDetail subject={detail.subject as RequisitionSubject} />
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card shadow-sm">
            <ApprovalHistory history={detail.history} />
          </div>
        </>
      }
      rightColumn={
        <div className="flex flex-col gap-6">
          <ApprovalImpactPanel impact={detail.impact as RequisitionImpact} />
          <ApprovalPreflightPanel preflight={detail.preflight} />
          <ApprovalDecisionBar detail={detail} onSuccess={() => refetch()} />
        </div>
      }
    />
  );
}
