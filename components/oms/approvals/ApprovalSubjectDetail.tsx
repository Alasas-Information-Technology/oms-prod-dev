"use client";

import { format } from "date-fns";
import { RequisitionSubject } from "@/lib/types/approval.types";
import {
  Check,
  X,
  Paperclip,
  FileText,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalSubjectDetailProps {
  subject: RequisitionSubject;
}

function toPlainLanguage(value: string) {
  if (value === "DIEZ_PREMISES") return "DIEZ Premises";
  if (value === "UNKNOWN") return "To be determined";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ApprovalSubjectDetail({ subject }: ApprovalSubjectDetailProps) {
  const parameters = [
    { label: "Resources Requested", value: `${subject.resources} Headcount` },
    { label: "Engagement Period", value: `${subject.engagementMonths} Months` },
    { label: "Target Start Date", value: format(new Date(subject.expectedStart), "d MMM yyyy") },
    { label: "Official Work Location", value: toPlainLanguage(subject.workLocation) },
    { label: "Salary / Compensation Grade", value: subject.salaryGrade },
    { label: "Candidate Route", value: toPlainLanguage(subject.candidateRoute) },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Request Parameters Specification Grid */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Requisition Specifications
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Official Submission Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {parameters.map((param) => (
            <div
              key={param.label}
              className="flex flex-col gap-1 p-3.5 rounded-lg border border-border bg-muted/20"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {param.label}
              </span>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                {param.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Business Justification */}
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
          <FileText className="size-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Operational Justification & Business Case
          </h3>
        </div>
        <div className="rounded-sm border border-border bg-muted/25 p-5 border-l-4 border-l-primary">
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">
            {subject.justification}
          </p>
        </div>
      </div>

      {/* 3. Evidence & Governance Verification */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Compliance & Supporting Evidence
            </h3>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Audit Documentation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Job Description */}
          <div
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-lg border text-xs font-semibold",
              subject.evidence.jobDescriptionAttached
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-rose-50/70 border-rose-300 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
            )}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded",
                subject.evidence.jobDescriptionAttached
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              )}
            >
              {subject.evidence.jobDescriptionAttached ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : (
                <X className="size-3.5 stroke-[2.5]" />
              )}
            </div>
            <span className="truncate">
              {subject.evidence.jobDescriptionAttached
                ? "Job Description Verified"
                : "Job Description Missing"}
            </span>
          </div>

          {/* Supporting Documents */}
          <div
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-lg border text-xs font-semibold",
              subject.evidence.supportingDocumentCount > 0
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-muted border-border text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded",
                subject.evidence.supportingDocumentCount > 0
                  ? "bg-emerald-600 text-white"
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}
            >
              {subject.evidence.supportingDocumentCount > 0 ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : (
                <Paperclip className="size-3.5" />
              )}
            </div>
            <span className="truncate">
              {subject.evidence.supportingDocumentCount > 0
                ? `${subject.evidence.supportingDocumentCount} Supporting Document${subject.evidence.supportingDocumentCount === 1 ? "" : "s"}`
                : "No Supporting Documents"}
            </span>
          </div>

          {/* AD Hierarchy */}
          <div
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-lg border text-xs font-semibold",
              subject.evidence.adHierarchyVerified
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-rose-50/70 border-rose-300 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
            )}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded",
                subject.evidence.adHierarchyVerified
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              )}
            >
              {subject.evidence.adHierarchyVerified ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : (
                <X className="size-3.5 stroke-[2.5]" />
              )}
            </div>
            <span className="truncate">
              {subject.evidence.adHierarchyVerified
                ? "AD Hierarchy Verified"
                : "AD Hierarchy Unverified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


