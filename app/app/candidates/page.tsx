"use client";

import React from "react";
import { Users } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function CandidatesPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Talent & Candidate Evaluation"
      category="Operations"
      icon={Users}
      description="Review candidate submissions from accredited vendors, coordinate interviews, track evaluations, and manage talent pipelines."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Blind Profile Screening",
          description: "Unbiased technical screening with automated credential and certification verification.",
        },
        {
          title: "Interview Scheduling & Feedback",
          description: "Calendar integrations with Microsoft 365, automated scorecard distribution, and multi-interviewer consensus.",
        },
        {
          title: "Selection & Offer Approval",
          description: "Seamless transition from interview approval directly into the onboarding pipeline.",
        },
      ]}
    />
  );
}
