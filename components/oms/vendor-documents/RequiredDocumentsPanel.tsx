"use client";

import * as React from "react";
import {
  VendorDocument,
  ResidentStatus,
  DocumentHealth,
} from "@/src/types/vendor-documents";
import { DocumentRow } from "./DocumentRow";
import { OptionalDocumentsSection } from "./OptionalDocumentsSection";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequiredDocumentsPanelProps {
  requiredDocuments: VendorDocument[];
  optionalDocuments?: VendorDocument[];
  residentStatus: ResidentStatus;
  health: DocumentHealth;
  canEdit?: boolean;
  onViewDocument?: (doc: VendorDocument) => void;
  onReplaceDocument?: (doc: VendorDocument) => void;
  onUploadDocument?: (doc: VendorDocument) => void;
  className?: string;
}

/**
 * Middle Column: Required Documents Panel per VENDOR-DOCUMENTS-UI.md §1.4 & Part 2.
 * - Header states count and location-driven set: "Required documents — Onshore · 3/4"
 * - Renders requiredDocuments EXACTLY as returned by API (never client-filtered or reordered)
 * - Highlights scan-failed and rejected blocking banners
 */
export function RequiredDocumentsPanel({
  requiredDocuments,
  optionalDocuments = [],
  residentStatus,
  health,
  canEdit = true,
  onViewDocument,
  onReplaceDocument,
  onUploadDocument,
  className,
}: RequiredDocumentsPanelProps) {
  // Find any scan-failed or rejected documents to surface panel-level alerts if needed
  const scanFailedDoc = requiredDocuments.find((d) => d.status === "SCAN_FAILED");
  const rejectedDoc = requiredDocuments.find((d) => d.status === "REJECTED");

  const locationLabel =
    residentStatus === "ONSHORE" ? "Onshore" : "Offshore";

  return (
    <section
      aria-label={`Required documents for ${locationLabel} candidate`}
      className={cn("space-y-4 min-w-0", className)}
    >
      <div className="bg-card border border-border/70 rounded-xl p-5 shadow-xs space-y-4">
        {/* Panel Header per §4.2: Count and Location-Driven set */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground tracking-tight">
                {`Required documents — ${locationLabel}`}
              </h3>
              <Badge
                variant="secondary"
                className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-muted text-foreground/90"
              >
                {`${health.uploaded}/${health.required}`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {residentStatus === "ONSHORE"
                ? "Onshore engagement requires Passport bio page, Emirates ID, Police Clearance, and signed NDA."
                : "Offshore engagement requires Passport bio page, National Identity Card, and signed NDA."}
            </p>
          </div>
        </div>

        {/* Global Panel Alert: Malware Scan Failed per §1.7 */}
        {scanFailedDoc && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4 shrink-0" />
              <span>Cybersecurity Threat Quarantined</span>
            </div>
            <p className="text-[11px] text-destructive/90 leading-relaxed pl-6">
              {`File "${scanFailedDoc.file?.name || "Upload"}" failed server-side malware scanning. Submission to DIEZ is blocked until you replace this file with a clean scan.`}
            </p>
          </div>
        )}

        {/* Global Panel Alert: Rejected Document per §1.6 */}
        {!scanFailedDoc && rejectedDoc && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Document Action Required</span>
            </div>
            <p className="text-[11px] text-destructive/90 leading-relaxed pl-6">
              {`One or more documents were declined during DIEZ compliance review (${rejectedDoc.label}). Replace the declined item to proceed.`}
            </p>
          </div>
        )}

        {/* List of Required Documents (Rendered strictly as returned by API) */}
        <div className="space-y-3 pt-1">
          {requiredDocuments.map((doc) => (
            <DocumentRow
              key={doc.code}
              document={doc}
              canEdit={canEdit}
              onView={onViewDocument}
              onReplace={onReplaceDocument}
              onUpload={onUploadDocument}
            />
          ))}
        </div>
      </div>

      {/* Optional Documents Section per §4.2 & Part 2 */}
      <OptionalDocumentsSection
        optionalDocuments={optionalDocuments}
        canEdit={canEdit}
        onViewDocument={onViewDocument}
        onReplaceDocument={onReplaceDocument}
        onUploadDocument={onUploadDocument}
      />
    </section>
  );
}
