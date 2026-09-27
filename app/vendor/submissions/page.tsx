"use client";

import { use } from "react";
import { CandidateSubmissionForm } from "@/components/oms/vendor-portal/CandidateSubmissionForm";

interface PageProps {
  searchParams?: Promise<{ requisitionId?: string }>;
}

export default function VendorCandidateSubmissionPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  const initialRequisitionId = resolvedSearchParams?.requisitionId;

  return <CandidateSubmissionForm initialRequisitionId={initialRequisitionId} />;
}
