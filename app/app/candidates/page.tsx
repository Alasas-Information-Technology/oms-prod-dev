"use client";

import React from "react";
import Link from "next/link";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";
import { Button } from "@/components/ui/button";

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <div className="mx-6 mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="size-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interview Planning Workspaces</h3>
            <p className="text-xs text-muted-foreground">Access interview planning and slot proposal workspaces for candidates</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="default" className="cursor-pointer">
            <Link href="/app/candidates/interviews/plan/OMS-2026-0148">
              Open Plan Interviews (OMS-2026-0148)
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

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
    </div>
  );
}
