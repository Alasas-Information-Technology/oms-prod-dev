"use client";

import { use } from "react";
import { VendorInterviewResponseWorkspace } from "@/components/oms/vendor-portal/VendorInterviewResponseWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorInterviewResponsePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const candidateRef = resolvedParams.id;

  return <VendorInterviewResponseWorkspace candidateRef={candidateRef} />;
}
