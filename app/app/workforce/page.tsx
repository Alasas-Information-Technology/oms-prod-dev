"use client";

import React from "react";
import { Users2 } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function WorkforcePage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Workforce Operations & Deployment"
      category="Operations"
      icon={Users2}
      description="Track active outsourced personnel, contract renewals, document validity watches, and department resource allocations."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Active Workforce Roster",
          description: "Live roster of all outsourced resources across DIEZ departments and zones.",
        },
        {
          title: "Expiring Document Watchdog",
          description: "Automated alerts for expiring visas, labor cards, security clearances, and insurance policies.",
        },
        {
          title: "Contract Extensions & Offboarding",
          description: "One-click contract extension approvals and secure offboarding workflows.",
        },
      ]}
    />
  );
}
