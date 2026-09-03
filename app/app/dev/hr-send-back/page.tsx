"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HrSendBackWorkspace } from "@/components/oms/hr-send-back";
import {
  FIXTURE_HR_SEND_BACK_OMS_2026_0139,
  FIXTURE_HR_SEND_BACK_CYCLE_1,
  FIXTURE_HR_SEND_BACK_SHORT_FIELDS,
} from "@/src/lib/hr-send-back/fixtures";
import { HrSendBackOptionsResponse } from "@/src/types/hr-send-back";

export default function HrSendBackDevPage() {
  const [selectedKey, setSelectedKey] = React.useState<
    "main" | "cycle1" | "short-fields"
  >("main");

  let fixture: HrSendBackOptionsResponse = FIXTURE_HR_SEND_BACK_OMS_2026_0139;
  if (selectedKey === "cycle1") fixture = FIXTURE_HR_SEND_BACK_CYCLE_1;
  if (selectedKey === "short-fields") fixture = FIXTURE_HR_SEND_BACK_SHORT_FIELDS;

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
            variant={selectedKey === "main" ? "default" : "outline"}
            onClick={() => setSelectedKey("main")}
            className="h-7 text-xs"
          >
            (a) Full Case (Cycle 2, 5 Fields)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "cycle1" ? "default" : "outline"}
            onClick={() => setSelectedKey("cycle1")}
            className="h-7 text-xs"
          >
            (b) Cycle 1 (Thread Omitted)
          </Button>
          <Button
            size="sm"
            variant={selectedKey === "short-fields" ? "default" : "outline"}
            onClick={() => setSelectedKey("short-fields")}
            className="h-7 text-xs"
          >
            (c) Short Fields (2 Fields + Note)
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Request: <code className="font-mono text-primary font-semibold">{fixture.requestId}</code>
        </div>
      </div>

      <HrSendBackWorkspace
        key={fixture.requestId}
        options={fixture}
      />
    </div>
  );
}
