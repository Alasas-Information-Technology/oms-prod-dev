"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useApprovalDetail } from "@/hooks/useApprovalDetail";
import { ApprovalDetailSkeleton } from "@/components/oms/approvals/ApprovalDetailSkeleton";
import { RequestDetailDecisionView } from "@/components/oms/requests/RequestDetailDecisionView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Load everything from ONE call to GET /approvals/{taskId} alongside request data (Constraint 8)
  const { data: detail, isLoading, error, refetch } = useApprovalDetail(id);

  // Fallback to 404 natively if out of scope or doesn't exist
  if (error) {
    notFound();
  }

  if (isLoading || !detail) {
    return (
      <div className="p-6 max-w-[1680px] mx-auto">
        <ApprovalDetailSkeleton />
      </div>
    );
  }

  const handleDecisionSuccess = () => {
    refetch();
    router.push("/app/requests?tab=needs-my-action");
  };

  return (
    <RequestDetailDecisionView
      detail={detail}
      onRefresh={handleDecisionSuccess}
    />
  );
}
