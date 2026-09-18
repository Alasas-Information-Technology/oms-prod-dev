"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ActiveResourceDetail } from "@/components/oms/active-resources/ActiveResourceDetail";

export default function ActiveResourceDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "RES-2026-0042";

  return <ActiveResourceDetail resourceId={id} />;
}
