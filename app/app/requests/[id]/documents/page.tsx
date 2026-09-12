"use client";

import { use } from "react";
import { PostHrDocumentPack } from "@/components/oms/requests/PostHrDocumentPack";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDocumentsPage({ params }: PageProps) {
  const { id } = use(params);
  return <PostHrDocumentPack requestId={id} />;
}
