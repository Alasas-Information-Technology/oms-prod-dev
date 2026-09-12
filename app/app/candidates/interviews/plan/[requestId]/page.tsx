"use client";

import * as React from "react";
import { use } from "react";
import { InterviewPlanningWorkspace } from "@/components/oms/interviews/InterviewPlanningWorkspace";
import { Loader2 } from "lucide-react";

interface InterviewPlanningPageProps {
  params: Promise<{ requestId: string }>;
}

export default function InterviewPlanningPage({
  params,
}: InterviewPlanningPageProps) {
  const { requestId } = use(params);

  return (
    <React.Suspense
      fallback={
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading interview planning...</span>
          </div>
        </div>
      }
    >
      <InterviewPlanningWorkspace requestId={requestId} />
    </React.Suspense>
  );
}
