"use client";

import * as React from "react";
import { VendorDocument } from "@/src/types/vendor-documents";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { formatJoiningDate } from "@/src/lib/vendor-documents/formatters";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  Upload,
  Calendar,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentRowProps {
  document: VendorDocument;
  canEdit?: boolean;
  onView?: (doc: VendorDocument) => void;
  onReplace?: (doc: VendorDocument) => void;
  onUpload?: (doc: VendorDocument) => void;
  className?: string;
}

/**
 * Format file size in KB or MB
 */
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Document Row Component adhering to VENDOR-DOCUMENTS-UI.md Part 3 Row Anatomy:
 * - Document label & status badge
 * - Filename & file metadata
 * - Expiry date with amber "· soon" suffix inside 90 days (§1.8)
 * - Malware scan and file type checks
 * - Inline rejected state with reason and primary Replace action (§1.6)
 * - Inline scan failed state with quarantine reason (§1.7)
 * - Row actions (View, Replace, Upload)
 */
export function DocumentRow({
  document: doc,
  canEdit = true,
  onView,
  onReplace,
  onUpload,
  className,
}: DocumentRowProps) {
  const isExpiringSoon =
    (doc.expiringWithinDays !== null &&
      doc.expiringWithinDays !== undefined &&
      doc.expiringWithinDays <= 90 &&
      doc.expiringWithinDays >= 0);

  const isRejected = doc.status === "REJECTED";
  const isScanFailed = doc.status === "SCAN_FAILED";

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 space-y-3",
        isScanFailed && "bg-destructive/5 border-destructive/40 shadow-xs",
        isRejected && "bg-destructive/5 border-destructive/30 shadow-xs",
        !isScanFailed && !isRejected && "bg-card/50 hover:bg-card border-border/70 hover:border-border",
        className
      )}
    >
      {/* Top Line: Label + Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground shrink-0" />
          <h4 className="font-semibold text-sm text-foreground tracking-tight">
            {doc.label}
          </h4>
          {doc.isOptional && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase font-semibold">
              OPTIONAL
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <DocumentStatusBadge status={doc.status} />
        </div>
      </div>

      {/* Middle Line: File information & Expiry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
        <div className="flex items-center flex-wrap gap-2">
          {doc.file ? (
            <span className="text-foreground/90 font-medium select-all">
              {doc.file.name}
            </span>
          ) : doc.requiresSignature ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
              <PenTool className="size-3.5" />
              Signature required via DocuSign
            </span>
          ) : (
            <span className="text-muted-foreground/70 italic">
              No file uploaded yet
            </span>
          )}

          {doc.file && doc.file.sizeBytes > 0 && (
            <>
              <span>·</span>
              <span className="text-[11px] tabular-nums">
                {formatFileSize(doc.file.sizeBytes)}
              </span>
            </>
          )}
        </div>

        {/* Expiry Date with amber "· soon" suffix per §1.8 */}
        {doc.expiresOn && (
          <div
            className={cn(
              "flex items-center gap-1.5 tabular-nums text-xs shrink-0",
              isExpiringSoon
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : "text-muted-foreground"
            )}
          >
            <Calendar className="size-3.5 shrink-0" />
            <span>Expires {formatJoiningDate(doc.expiresOn)}</span>
            {isExpiringSoon && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 ml-0.5">
                · soon
              </span>
            )}
          </div>
        )}
      </div>

      {/* Security & Validation Chips */}
      {doc.file && (
        <div className="flex items-center flex-wrap gap-3 text-[11px] pt-0.5">
          {doc.malwareScanPassed === true && (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="size-3.5 stroke-[2.5]" />
              Malware scan passed
            </span>
          )}
          {doc.malwareScanPassed === false && (
            <span className="inline-flex items-center gap-1 text-destructive font-semibold">
              <ShieldAlert className="size-3.5 stroke-[2.5]" />
              Malware scan failed
            </span>
          )}

          {doc.fileTypeValid === true && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <FileCheck2 className="size-3.5 text-muted-foreground/70" />
              File type valid
            </span>
          )}
        </div>
      )}

      {/* Inline SCAN_FAILED Banner per §1.7 */}
      {isScanFailed && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="size-4 shrink-0" />
            <span>Malware Scan Failed — Submission Blocked</span>
          </div>
          <p className="text-[11px] text-destructive/90 leading-normal pl-5.5">
            {doc.rejectionReason ||
              `File "${doc.file?.name || "attachment"}" failed cybersecurity malware scanning and has been quarantined. You must replace this file before submitting to DIEZ.`}
          </p>
        </div>
      )}

      {/* Inline REJECTED Banner per §1.6 */}
      {isRejected && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="size-4 shrink-0" />
            <span>Document Declined by DIEZ Review</span>
          </div>
          <p className="text-[11px] text-destructive/90 leading-normal pl-5.5">
            {doc.rejectionReason ||
              "Document was rejected during DIEZ compliance review. Please replace with an updated scan."}
          </p>
        </div>
      )}

      {/* Row Action Buttons per §1.6 */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          {/* View / Download Action */}
          {doc.file && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onView?.(doc)}
              className="h-7.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="size-3.5 mr-1" />
              View
            </Button>
          )}

          {/* Replace Action — Primary when REJECTED per §1.6 */}
          {doc.file ? (
            <Button
              type="button"
              variant={isRejected ? "default" : "outline"}
              size="sm"
              onClick={() => onReplace?.(doc)}
              className={cn(
                "h-7.5 px-3 text-xs cursor-pointer font-medium transition-colors",
                isRejected
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <RefreshCw className="size-3 mr-1.5" />
              Replace
            </Button>
          ) : doc.requiresSignature ? (
            <span className="text-[11px] text-muted-foreground italic">
              Awaiting candidate e-signature
            </span>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onUpload?.(doc)}
              className="h-7.5 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Upload className="size-3 mr-1.5" />
              Upload
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
