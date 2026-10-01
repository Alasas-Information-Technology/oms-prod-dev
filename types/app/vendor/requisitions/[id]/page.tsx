"use client";

import { use } from "react";
import { VendorRequisitionDetailWorkspace } from "@/components/oms/vendor-portal/VendorRequisitionDetailWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorRequisitionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requisitionId = resolvedParams.id;

  return <VendorRequisitionDetailWorkspace requisitionId={requisitionId} />;
}
