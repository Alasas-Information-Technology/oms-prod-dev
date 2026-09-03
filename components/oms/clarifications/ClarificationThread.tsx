"use client";

import * as React from "react";
import { ClarificationThreadEntry } from "@/types/clarification";
import { ClarificationThread as SharedClarificationThread } from "@/components/oms/clarification/ClarificationThread";

interface ClarificationThreadProps {
  thread: ClarificationThreadEntry[];
  cycleNumber: number;
  className?: string;
  expandable?: boolean;
  latestExpanded?: boolean;
}

export function ClarificationThread({
  thread,
  cycleNumber,
  className,
  expandable = true,
  latestExpanded = true,
}: ClarificationThreadProps) {
  return (
    <SharedClarificationThread
      entries={thread}
      cycleNumber={cycleNumber}
      expandable={expandable}
      latestExpanded={latestExpanded}
      className={className}
    />
  );
}
