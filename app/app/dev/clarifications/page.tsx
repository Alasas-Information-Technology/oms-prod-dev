"use client";

import * as React from "react";
import { ClarificationWorkspace } from "@/components/oms/clarifications";
import {
  FIXTURE_INFO_WITH_APPROVAL,
  FIXTURE_MORE_INFO,
  FIXTURE_AMEND_BUDGET_INCREASE,
  FIXTURE_CRITICAL_DEADLINE,
} from "@/lib/clarification/fixtures";
import { Button } from "@/components/ui/button";
import { ClarificationDetail } from "@/types/clarification";

export default function ClarificationDevPage() {
  const [selectedKey, setSelectedKey] = React.useState<
    "info-with-approval" | "more-info" | "amend" | "critical"
  >("info-with-approval");

  let fixture: ClarificationDetail = FIXTURE_INFO_WITH_APPROVAL;
  if (selectedKey === "more-info") fixture = FIXTURE_MORE_INFO;
  if (selectedKey === "amend") fixture = FIXTURE_AMEND_BUDGET_INCREASE;
  if (selectedKey === "critical") fixture = FIXTURE_CRITICAL_DEADLINE;

  return (
    <div className="space-y-4">
      {/* Dev Switcher Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dev Fixture Switcher:
          </span>
          <Button
            size="sm"
            variant={selectedKey === "info-with-approval" ? "default" : "outline"}
            onClick={() => setSelectedKey("info-with-approval")}
            className="h-7 text-xs"
          >
            (a) Full Approval
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "more-info" ? "default" : "outline"}
            onClick={() => setSelectedKey("more-info")}
            className="h-7 text-xs"
          >
            (b) More Info (Collapsed)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "amend" ? "default" : "outline"}
            onClick={() => setSelectedKey("amend")}
            className="h-7 text-xs"
          >
            (c) Amend Budget
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "critical" ? "default" : "outline"}
            onClick={() => setSelectedKey("critical")}
            className="h-7 text-xs"
          >
            (d) Critical 2-Day Deadline
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Type: <code className="font-mono text-primary font-semibold">{fixture.type}</code>
        </div>
      </div>

      <ClarificationWorkspace
        key={fixture.clarificationId}
        clarification={fixture}
      />
    </div>
  );
}
