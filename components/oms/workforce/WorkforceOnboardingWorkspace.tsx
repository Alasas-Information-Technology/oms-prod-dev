"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  Clock,
  Search,
  ExternalLink,
  ArrowRight,
  FileCheck2,
  FileText,
  Building2,
  Globe,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";
import { listOnboardingCases, getRequisition } from "@/src/lib/demo-data";
import { OnboardingCase } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

export function WorkforceOnboardingWorkspace() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const allCases = React.useMemo(() => listOnboardingCases(), []);

  const filteredCases = React.useMemo(() => {
    return allCases.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.candidate.fullName.toLowerCase().includes(q);
        const matchesReq = c.requisitionId.toLowerCase().includes(q);
        const matchesRef = c.candidateRef.toLowerCase().includes(q);
        const matchesPos = c.positionTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesReq && !matchesRef && !matchesPos) return false;
      }
      return true;
    });
  }, [allCases, searchQuery]);

  return (
    <div className="flex flex-col min-h-full pb-16 bg-background">
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Workforce & Operations", href: "/app/workforce" },
          { label: "Onboarding Tracker", isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <UserCheck className="size-6 text-primary" />
              <span>Workforce Onboarding Tracker</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active candidate onboarding pipelines, compliance document collection, and e-signatures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <Link href="/app/workforce">
                <span>Active Roster</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Active Onboarding Cases
            </span>
            <div className="text-xl font-bold text-foreground">{allCases.length}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Onshore Cases
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {allCases.filter((c) => c.residentStatus === "ONSHORE").length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Offshore Cases
            </span>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {allCases.filter((c) => c.residentStatus === "OFFSHORE").length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Pending E-Signature
            </span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {allCases.filter((c) => c.signature.envelopeStatus !== "SIGNED").length}
            </div>
          </div>
        </div>

        {/* ── Cases List ── */}
        <div className="space-y-4">
          {filteredCases.map((onb) => {
            const req = getRequisition(onb.requisitionId);
            const approvedDocs = onb.documents.filter((d) => d.status === "APPROVED").length;
            const totalDocs = onb.documents.length;

            return (
              <div
                key={onb.id}
                className="p-5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-4 hover:border-border transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                      {onb.candidateRef}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">
                          {onb.candidate.fullName}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-foreground">
                          {onb.id}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">
                          {onb.residentStatus}
                        </Badge>
                      </div>

                      <div className="text-xs font-medium text-foreground flex items-center gap-2">
                        <span>{onb.positionTitle}</span>
                        <span className="text-muted-foreground">&middot;</span>
                        <span className="text-muted-foreground">{req?.departmentName || "Department"}</span>
                        <span className="text-muted-foreground">&middot;</span>
                        <Link href={`/app/requests/${onb.requisitionId}`} className="font-mono hover:underline text-primary">
                          {onb.requisitionId}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>Expected Joining: <strong>{onb.candidate.expectedJoining}</strong></span>
                        </span>
                        <span>&middot;</span>
                        <span>{onb.deadline.daysRemaining} days remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                    <Button asChild variant="outline" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                      <Link href={`/app/candidates/interviews/evaluate/${onb.requisitionId}/${onb.candidateRef}`}>
                        <FileText className="size-3.5 text-primary" />
                        <span>View Evaluation</span>
                      </Link>
                    </Button>

                    <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                      <Link href={`/vendor/onboarding/${onb.id}/documents`}>
                        <Briefcase className="size-3.5" />
                        <span>Vendor Documents Portal</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Document Status Progress */}
                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      Document Verification: {approvedDocs} of {totalDocs} approved
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onb.documents.map((doc) => (
                      <span
                        key={doc.code}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium border",
                          doc.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : doc.status === "UNDER_REVIEW"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            : doc.status === "PENDING_SIGNATURE"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {doc.label}: {doc.status.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
