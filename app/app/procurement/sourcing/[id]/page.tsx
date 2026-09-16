"use client";

import { useParams } from "next/navigation";
import { SourceCandidatesWorkspace } from "@/components/oms/procurement";

export default function ProcurementSourcingDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "OMS-2026-0148";

  return <SourceCandidatesWorkspace requestId={id} />;
}
