"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function OnboardingPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Workforce Onboarding & Compliance"
      category="Operations"
      icon={UserPlus}
      description="Orchestrate background security checks, digital document collection, Emirates ID verification, and building access provisioning."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Digital Document Verification",
          description: "Automated extraction and validation of passport, visa, medical fitness, and Emirates ID records.",
        },
        {
          title: "IT & Physical Access Provisioning",
          description: "Automated provisioning of Azure AD accounts, email, role-based permissions, and building security badges.",
        },
        {
          title: "Orientation & Policy Attestation",
          description: "Mandatory enterprise cyber security and code-of-conduct digital attestations.",
        },
      ]}
    />
  );
}
