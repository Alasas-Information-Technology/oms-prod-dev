"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function ProcurementPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Procurement & Sourcing Portal"
      category="Operations"
      icon={ShoppingCart}
      description="The centralized procurement workspace for executing RFPs, evaluating competitive service provider tenders, and automating purchase order workflows."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Automated RFP & Sourcing",
          description: "Distribute requirements to accredited vendors across UAE free zones with automated bidding windows.",
        },
        {
          title: "Commercial Evaluation Engine",
          description: "Side-by-side rate card comparisons, budget validation, and automated compliance scoring.",
        },
        {
          title: "Contract Awarding & Digital Signatures",
          description: "Integration with UAE PASS and enterprise digital signatures for instant award execution.",
        },
      ]}
    />
  );
}
