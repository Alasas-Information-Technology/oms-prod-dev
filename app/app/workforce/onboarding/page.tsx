"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function WorkforceOnboardingPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Onboarding Tracker & Stage Pipeline"
      category="Workforce"
      icon={UserCheck}
      description="Track real-time progress for newly selected candidates advancing through security checks, offer signoff, and IT provisioning."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Multi-Zone Clearance Tracking",
          description: "Live stage progression across security clearance, immigration, and facility access.",
        },
        {
          title: "Automated Welcome Packets",
          description: "Digital distribution of policies, day-one directions, and emergency procedures.",
        },
        {
          title: "Department Mentor Assignment",
          description: "Assign departmental buddies and manager checkpoints for smooth day-one onboarding.",
        },
      ]}
    />
  );
}
