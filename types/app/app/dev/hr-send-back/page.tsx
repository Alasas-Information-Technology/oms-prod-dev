"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { HrSendBackWorkspace } from "@/components/oms/hr-send-back";
import {
  getHrSendBackOptionsFixture,
  FIXTURE_HR_SEND_BACK_OMS_2026_0139,
  FIXTURE_HR_SEND_BACK_CYCLE_1,
  FIXTURE_HR_SEND_BACK_SHORT_FIELDS,
} from "@/src/lib/hr-send-back/fixtures";
import { HrSendBackOptionsResponse } from "@/src/types/hr-send-back";

type HrSendBackScenario = "0139" | "0128" | "0143";

function getOptionsForScenario(scenario: HrSendBackScenario): HrSendBackOptionsResponse {
  switch (scenario) {
    case "0139":
      return (
        getHrSendBackOptionsFixture("OMS-2026-0139") ||
        FIXTURE_HR_SEND_BACK_OMS_2026_0139
      );
    case "0128":
      return (
        getHrSendBackOptionsFixture("OMS-2026-0128") ||
        FIXTURE_HR_SEND_BACK_CYCLE_1
      );
    case "0143":
      return (
        getHrSendBackOptionsFixture("OMS-2026-0143") ||
        FIXTURE_HR_SEND_BACK_SHORT_FIELDS
      );
  }
}

export default function HrSendBackDevPage() {
  const [selectedKey, setSelectedKey] = React.useState<HrSendBackScenario>("0139");

  const fixture = getOptionsForScenario(selectedKey);

  const handleOpenProductionRoute = () => {
    window.open(`/app/hr-review?request=${fixture.requestId}`, "_blank");
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
            variant={selectedKey === "0139" ? "default" : "outline"}
            onClick={() => setSelectedKey("0139")}
            className="h-7 text-xs"
          >
            (a) Full Case (0139 Data Governance)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "0128" ? "default" : "outline"}
            onClick={() => setSelectedKey("0128")}
            className="h-7 text-xs"
          >
            (b) Overdue Case (0128 PMO Analyst)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "0143" ? "default" : "outline"}
            onClick={() => setSelectedKey("0143")}
            className="h-7 text-xs"
          >
            (c) Cloud Engineer (0143)
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Req: <code className="text-primary font-semibold">{fixture.requestId}</code> ·{" "}
            Requester: <code className="text-foreground font-semibold">{fixture.requester.name}</code>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleOpenProductionRoute}
            className="h-7 text-xs flex items-center gap-1.5"
            title="Open real HR Review workspace in new tab"
          >
            <span>Open in HR Review</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>

      <HrSendBackWorkspace
        key={fixture.requestId}
        options={fixture}
      />
    </div>
  );
}
