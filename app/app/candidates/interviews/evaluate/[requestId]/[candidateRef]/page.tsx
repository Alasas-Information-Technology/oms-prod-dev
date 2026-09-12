"use client";

import * as React from "react";
import { use } from "react";
import { InterviewEvaluationWorkspace } from "@/components/oms/interviews/evaluation";
import { Loader2 } from "lucide-react";

interface InterviewEvaluatePageProps {
  params: Promise<{ requestId: string; candidateRef: string }>;
  searchParams?: Promise<{ fixture?: string }>;
}

export default function InterviewEvaluatePage({
  params,
  searchParams,
}: InterviewEvaluatePageProps) {
  const { requestId, candidateRef } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  const initialFixtureKey = resolvedSearchParams?.fixture;

  return (
    <React.Suspense
      fallback={
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading evaluation workspace...</span>
          </div>
        </div>
      }
    >
      <InterviewEvaluationWorkspace
        requestId={requestId}
        candidateRef={candidateRef}
        initialFixtureKey={initialFixtureKey}
      />
    </React.Suspense>
  );
}
