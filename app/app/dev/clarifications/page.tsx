"use client";

import * as React from "react";
import { ClarificationWorkspace } from "@/components/oms/clarifications";
import {
  getClarificationFixture,
  FIXTURE_INFO_WITH_APPROVAL,
  FIXTURE_MORE_INFO,
  FIXTURE_AMEND_BUDGET_INCREASE,
  FIXTURE_CRITICAL_DEADLINE,
} from "@/lib/clarification/fixtures";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { ClarificationDetail } from "@/types/clarification";

type ClarificationScenario = "0139-approval" | "0143-more-info" | "amend" | "critical";

function getClarificationForScenario(scenario: ClarificationScenario): ClarificationDetail {
  switch (scenario) {
    case "0139-approval":
      return (
        getClarificationFixture("OMS-2026-0139", "clar-2026-0089") ||
        getClarificationFixture("OMS-2026-0139") ||
        FIXTURE_INFO_WITH_APPROVAL
      );
    case "0143-more-info":
      return (
        getClarificationFixture("OMS-2026-0143", "clar-2026-0143-01") ||
        getClarificationFixture("OMS-2026-0143") ||
        FIXTURE_MORE_INFO
      );
    case "amend":
      return (
        getClarificationFixture("OMS-2026-0148") ||
        FIXTURE_AMEND_BUDGET_INCREASE
      );
    case "critical":
      return (
        getClarificationFixture("OMS-2026-0128") ||
        FIXTURE_CRITICAL_DEADLINE
      );
  }
}

export default function ClarificationDevPage() {
  const [selectedKey, setSelectedKey] = React.useState<ClarificationScenario>("0139-approval");

  const fixture = getClarificationForScenario(selectedKey);

  const handleOpenProductionRoute = () => {
    window.open(
      `/app/requests/${fixture.requestId}/clarifications/${fixture.clarificationId}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* Dev Switcher Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 mr-1">
            DEV WORKBENCH
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scenario:
          </span>
          <Button
            size="sm"
            variant={selectedKey === "0139-approval" ? "default" : "outline"}
            onClick={() => setSelectedKey("0139-approval")}
            className="h-7 text-xs"
          >
            (a) Full Approval (0139)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "0143-more-info" ? "default" : "outline"}
            onClick={() => setSelectedKey("0143-more-info")}
            className="h-7 text-xs"
          >
            (b) More Info (0143)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "amend" ? "default" : "outline"}
            onClick={() => setSelectedKey("amend")}
            className="h-7 text-xs"
          >
            (c) Amend Budget (0148)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "critical" ? "default" : "outline"}
            onClick={() => setSelectedKey("critical")}
            className="h-7 text-xs"
          >
            (d) Critical Deadline (0128)
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Req: <code className="text-primary font-semibold">{fixture.requestId}</code> ·{" "}
            Type: <code className="text-primary font-semibold">{fixture.type}</code>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleOpenProductionRoute}
            className="h-7 text-xs flex items-center gap-1.5"
            title="Open real clarification page in new tab"
          >
            <span>Open Real Page</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>

      <ClarificationWorkspace
        key={fixture.clarificationId}
        clarification={fixture}
      />
    </div>
  );
}
