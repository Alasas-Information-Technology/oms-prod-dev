"use client";

import { format } from "date-fns";
import { RequisitionSubject } from "@/lib/types/approval.types";
import { Check, X, Paperclip, FileText, Network } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalSubjectDetailProps {
  subject: RequisitionSubject;
}

function toPlainLanguage(value: string) {
  if (value === "DIEZ_PREMISES") return "DIEZ Premises";
  if (value === "UNKNOWN") return "To be determined";
  // basic capitalization for other snake_case strings
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ApprovalSubjectDetail({ subject }: ApprovalSubjectDetailProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* 1. Request Summary as Definition Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Request Summary</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Resources</dt>
            <dd className="font-medium text-foreground">{subject.resources}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Engagement</dt>
            <dd className="font-medium text-foreground">{subject.engagementMonths} months</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Expected start</dt>
            <dd className="font-medium text-foreground">
              {format(new Date(subject.expectedStart), "d MMM yyyy")}
            </dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Work location</dt>
            <dd className="font-medium text-foreground">
              {toPlainLanguage(subject.workLocation)}
            </dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Salary grade</dt>
            <dd className="font-medium text-foreground">{subject.salaryGrade}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <dt className="text-muted-foreground font-medium">Candidate route</dt>
            <dd className="font-medium text-foreground">
              {toPlainLanguage(subject.candidateRoute)}
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Business Justification */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Business Justification</h3>
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {subject.justification}
          </p>
        </div>
      </div>

      {/* 3. Evidence Chips */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Evidence</h3>
        <div className="flex flex-col gap-2">
          {/* Job Description */}
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md border text-sm font-medium",
              subject.evidence.jobDescriptionAttached
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {subject.evidence.jobDescriptionAttached ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <X className="size-4 text-red-600" />
            )}
            <FileText className="size-4 opacity-50" />
            <span>
              {subject.evidence.jobDescriptionAttached
                ? "Job description attached"
                : "Job description missing"}
            </span>
          </div>

          {/* Supporting Documents */}
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md border text-sm font-medium",
              subject.evidence.supportingDocumentCount > 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            )}
          >
            {subject.evidence.supportingDocumentCount > 0 ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <X className="size-4 text-amber-600" />
            )}
            <Paperclip className="size-4 opacity-50" />
            <span>
              {subject.evidence.supportingDocumentCount > 0 ? (
                <a href="#" className="hover:underline">
                  {subject.evidence.supportingDocumentCount} supporting{" "}
                  {subject.evidence.supportingDocumentCount === 1 ? "document" : "documents"} attached
                </a>
              ) : (
                "No supporting documents attached"
              )}
            </span>
          </div>

          {/* AD Hierarchy */}
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md border text-sm font-medium",
              subject.evidence.adHierarchyVerified
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {subject.evidence.adHierarchyVerified ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <X className="size-4 text-red-600" />
            )}
            <Network className="size-4 opacity-50" />
            <span>
              {subject.evidence.adHierarchyVerified
                ? "Active Directory hierarchy verified"
                : "Active Directory hierarchy unverified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
