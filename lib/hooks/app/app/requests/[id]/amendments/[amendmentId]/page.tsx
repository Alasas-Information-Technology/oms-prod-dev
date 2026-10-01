"use client";

import { use } from "react";
import { BudgetAmendmentWorkspace } from "@/components/oms/budget-amendment/BudgetAmendmentWorkspace";

interface AmendmentPageProps {
  params: Promise<{
    id: string; // Dynamic route parameter for requests/[id]
    amendmentId: string; // Dynamic route parameter for amendments/[amendmentId]
  }>;
}

/**
 * Route: /app/requests/[requestId]/amendments/[amendmentId]
 * Candidate Budget Amendment Page Shell
 */
export default function BudgetAmendmentPage({ params }: AmendmentPageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const amendmentId = resolvedParams.amendmentId;

  return (
    <BudgetAmendmentWorkspace
      requestId={requestId}
      amendmentId={amendmentId}
    />
  );
}
