"use client";

import * as React from "react";
import { use } from "react";
import { notFound } from "next/navigation";
import { useHrSendBackOptions } from "@/src/lib/hr-send-back/api";
import { HrSendBackWorkspace } from "@/components/oms/hr-send-back";
import { Loader2 } from "lucide-react";

interface HrSendBackPageProps {
  params: Promise<{ requestId: string }>;
}

export default function HrSendBackPage({ params }: HrSendBackPageProps) {
  const { requestId } = use(params);

  const {
    data: options,
    isLoading,
    error,
  } = useHrSendBackOptions(requestId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading send-back options for {requestId}...
        </p>
      </div>
    );
  }

  if (error || !options) {
    notFound();
  }

  return <HrSendBackWorkspace options={options} />;
}
