"use client";

import { use } from "react";
import { VendorDocumentsWorkspace } from "@/components/oms/vendor-documents/VendorDocumentsWorkspace";

interface PageProps {
  params: Promise<{ onboardingId: string }>;
  searchParams?: Promise<{ fixture?: string }>;
}

export default function VendorOnboardingDocumentsPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const onboardingId = resolvedParams.onboardingId;
  const fixtureKey = resolvedSearchParams?.fixture;

  return (
    <div className="w-full min-h-full pb-16">
      <VendorDocumentsWorkspace
        onboardingId={onboardingId}
        fixtureKey={fixtureKey}
      />
    </div>
  );
}
