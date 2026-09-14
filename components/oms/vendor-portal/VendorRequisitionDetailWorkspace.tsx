"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Building2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  ClockAlert,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getVendorRequisition } from "@/src/lib/demo-data";
import { cn } from "@/lib/utils";

interface VendorRequisitionDetailWorkspaceProps {
  requisitionId: string;
  vendorId?: string;
  className?: string;
}

export function VendorRequisitionDetailWorkspace({
  requisitionId,
  vendorId = "ven-falcon",
  className,
}: VendorRequisitionDetailWorkspaceProps) {
  const requisition = React.useMemo(
    () => getVendorRequisition(requisitionId, vendorId),
    [requisitionId, vendorId]
  );

  if (!requisition) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-destructive/10 border border-destructive/30 rounded-xl text-center space-y-4">
        <Lock className="size-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">
          Requirement Not Found
        </h2>
        <p className="text-xs text-muted-foreground">
          Requisition {requisitionId} was not found or is not accessible to your vendor organization.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/vendor/requisitions">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Open Requirements
          </Link>
        </Button>
      </div>
    );
  }

  const { submissionWindow } = requisition;
  const isClosed = !submissionWindow.isOpen;

  // Severity styling for submission window
  const getWindowSeverity = () => {
    if (isClosed) {
      return {
        bannerClass: "border-border/60 bg-muted/30 text-muted-foreground",
        badgeClass: "bg-muted/70 text-muted-foreground border-border/50",
        icon: Lock,
        title: "Submission Window Closed",
        subtitle: submissionWindow.closedReason || "This requirement is no longer accepting new candidate submissions.",
      };
    }
    if (submissionWindow.daysRemaining <= 1) {
      return {
        bannerClass: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        badgeClass: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold animate-pulse",
        icon: ClockAlert,
        title: "Urgent Sourcing Deadline",
        subtitle: `Submission window closes in ${submissionWindow.daysRemaining} working day. Submit candidate CVs promptly.`,
      };
    }
    if (submissionWindow.daysRemaining <= 2) {
      return {
        bannerClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold",
        icon: Clock,
        title: "Active Sourcing Window Closing Soon",
        subtitle: `${submissionWindow.daysRemaining} of 5 working days remaining before submission window closes.`,
      };
    }
    return {
      bannerClass: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300",
      badgeClass: "bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30 font-medium",
      icon: CheckCircle2,
      title: "Active Sourcing Window Open",
      subtitle: `${submissionWindow.daysRemaining} of 5 working days remaining for candidate submissions.`,
    };
  };

  const severity = getWindowSeverity();
  const SeverityIcon = severity.icon;

  return (
    <div className={cn("w-full flex flex-col bg-background pb-16 space-y-6", className)}>
      {/* 1. Header Bar with Breadcrumb and Actions */}
      <div className="w-full bg-background border-b border-border/70 px-4 sm:px-6 py-4 space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/vendor" className="hover:text-foreground transition-colors">
                Vendor Portal
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <Link href="/vendor/requisitions" className="hover:text-foreground transition-colors">
                Requirements
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">{requisition.id}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {requisition.positionTitle}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-muted/80 text-foreground border border-border/50">
                {requisition.id}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium">
                {requisition.positions.required} Resource{requisition.positions.required > 1 ? "s" : ""} Required
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>{requisition.departmentName}</span>
              <span>·</span>
              <span>Grade {requisition.salaryGrade}</span>
              <span>·</span>
              <span>Falcon Tech Invitation</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild variant="outline" size="sm" className="h-9 text-xs">
              <Link href="/vendor/requisitions">
                <ArrowLeft className="size-3.5 mr-1.5" />
                All Requirements
              </Link>
            </Button>

            {isClosed ? (
              <Button size="sm" disabled variant="secondary" className="h-9 text-xs cursor-not-allowed">
                Window Closed
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              >
                <Link href={`/vendor/submissions?requisitionId=${requisition.id}`}>
                  <Sparkles className="size-3.5" />
                  Submit Candidate
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* 2. Submission Window Severity Banner */}
        <div
          className={cn(
            "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3",
            severity.bannerClass
          )}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-8 rounded-lg bg-background/80 flex items-center justify-center shrink-0 border border-current/20">
              <SeverityIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">{severity.title}</h3>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", severity.badgeClass)}>
                  {isClosed ? "Closed" : `${submissionWindow.daysRemaining}d Left`}
                </span>
              </div>
              <p className="text-xs opacity-90">{severity.subtitle}</p>
            </div>
          </div>

          {!isClosed && (
            <Button
              asChild
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 shrink-0 text-xs font-semibold shadow-xs"
            >
              <Link href={`/vendor/submissions?requisitionId=${requisition.id}`}>
                Submit Candidate Now
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* 3. Main Detail Grid (Content + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Role Details, Description, Responsibilities, Skills */}
          <div className="lg:col-span-8 space-y-6">
            {/* Position Overview Card */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <FileText className="size-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  Position Mission & Terms of Reference
                </h2>
              </div>

              <div className="text-sm text-foreground/90 leading-relaxed">
                <p>{requisition.jobDescriptionHtml || requisition.justification}</p>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Operational Justification
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                  {requisition.justification}
                </p>
              </div>
            </Card>

            {/* Key Responsibilities */}
            {requisition.responsibilities && requisition.responsibilities.length > 0 && (
              <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Briefcase className="size-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">
                    Key Deliverables & Responsibilities
                  </h2>
                </div>

                <ul className="space-y-2.5">
                  {requisition.responsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-foreground/90 flex items-start gap-2.5">
                      <span className="size-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Required Skills & Competencies */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  Required Competencies & Technical Skills
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {requisition.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>
                  Minimum relevant professional experience:{" "}
                  <strong className="text-foreground">
                    {requisition.experienceYearsRequired || 5}+ years
                  </strong>
                </p>
                <p>
                  Submissions must include verified industry certifications and hands-on operational track record.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Parameters, Batch Counter, and Blind Review Notice */}
          <div className="lg:col-span-4 space-y-6">
            {/* Engagement Parameters Summary */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/50">
                Engagement Parameters
              </h2>

              <div className="divide-y divide-border/40 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold text-foreground">{requisition.departmentName}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Work Location:</span>
                  <span className="font-semibold text-foreground">{requisition.workLocation}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold text-foreground">{requisition.engagementMonths} Months</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Target Start Date:</span>
                  <span className="font-semibold text-foreground">{requisition.expectedStartDate}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Resources Needed:</span>
                  <span className="font-semibold text-foreground">{requisition.positions.required} Resource</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Salary Grade Target:</span>
                  <span className="font-semibold text-foreground">Grade {requisition.salaryGrade}</span>
                </div>
              </div>
            </Card>

            {/* Falcon Tech Submission Batch Tracker */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/50">
                Falcon Tech Batch Limit
              </h2>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Submissions by Falcon Tech:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {requisition.mySubmissionsCount} of {submissionWindow.maxBatchSize} CVs
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      requisition.mySubmissionsCount >= 10
                        ? "bg-rose-500"
                        : requisition.mySubmissionsCount > 0
                        ? "bg-teal-500"
                        : "bg-transparent"
                    )}
                    style={{
                      width: `${Math.min(
                        (requisition.mySubmissionsCount / submissionWindow.maxBatchSize) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Per RFP Step 4, vendor candidate submissions are capped at 10 CVs per requirement batch.
                </p>
              </div>

              {!isClosed && (
                <Button
                  asChild
                  size="sm"
                  className="w-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs gap-1 mt-2"
                >
                  <Link href={`/vendor/submissions?requisitionId=${requisition.id}`}>
                    Submit Candidate
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              )}
            </Card>

            {/* Blind Review Assurance Notice */}
            <Card className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
                <span>Vendor Isolation & Blind Review</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Candidate submissions are evaluated blindly by DIEZ hiring panels without vendor identity or cost visibility. Your quoted rates are visible exclusively to DIEZ Procurement.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
