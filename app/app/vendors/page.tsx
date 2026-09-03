"use client";

import React from "react";
import { Store } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function VendorsPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Vendor Registry & Accreditation"
      category="Operations"
      icon={Store}
      description="Manage service provider relationships, trade licenses, zone accreditations, rate card governance, and performance scorecards."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "360° Vendor Accreditation",
          description: "Automated verification of commercial trade licenses, tax registration numbers (TRN), and security clearances.",
        },
        {
          title: "Standardized Rate Cards",
          description: "Pre-negotiated ceiling rates per role seniority and domain to prevent budget overruns.",
        },
        {
          title: "Performance & SLA Scorecards",
          description: "Track vendor fulfillment speed, candidate quality, and SLA adherence in real-time.",
        },
      ]}
    />
  );
}
