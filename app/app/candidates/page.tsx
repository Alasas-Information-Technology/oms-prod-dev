"use client";

import React, { Suspense } from "react";
import { CandidatePipelineWorkspace } from "@/components/oms/candidates/CandidatePipelineWorkspace";
import { Loader2 } from "lucide-react";

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading candidate pipeline...</span>
          </div>
        </div>
      }
    >
      <CandidatePipelineWorkspace />
    </Suspense>
  );
}
