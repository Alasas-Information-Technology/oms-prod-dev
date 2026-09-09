"use client";

import * as React from "react";
import {
  VendorSignatureInfo,
  EnvelopeStatus,
} from "@/src/types/vendor-documents";
import { Button } from "@/components/ui/button";
import {
  FileSignature,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePanelProps {
  signature: VendorSignatureInfo;
  candidateName?: string;
  canEdit?: boolean;
  onSendForSignature?: () => void;
  onPreviewNda?: () => void;
  isSending?: boolean;
  className?: string;
}

/**
 * Maps envelope status to human-readable plain language per §1.2 & §4.3.
 * Webhook implementation details are strictly omitted per §1.2.
 */
export function formatPlainEnvelopeStatus(
  status: EnvelopeStatus,
  sentAt?: string | null
): {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  switch (status) {
    case "NOT_SENT":
      return {
        label: "Not sent",
        badgeClass: "bg-muted text-muted-foreground border-border",
        icon: Clock,
      };
    case "SENT":
      return {
        label: sentAt ? "Sent, awaiting candidate review" : "Sent",
        badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        icon: Send,
      };
    case "VIEWED":
      return {
        label: "Viewed by candidate",
        badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        icon: Eye,
      };
    case "SIGNED":
      return {
        label: "Signed and executed",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      };
    case "DECLINED":
      return {
        label: "Declined by signer",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
        icon: AlertCircle,
      };
    default:
      return {
        label: String(status).replace(/_/g, " "),
        badgeClass: "bg-muted text-muted-foreground border-border",
        icon: Clock,
      };
  }
}

/**
 * Right Column Signature Panel per VENDOR-DOCUMENTS-UI.md §1.2, §1.3, §4.3.
 * - Template name and signer order with names and roles.
 * - Envelope status in PLAIN LANGUAGE: Not sent, Sent, Viewed, Signed, Declined.
 * - ZERO technical engineering leaks.
 * - "Send for signature" is strictly a SECONDARY outlined action, never solid primary.
 * - "Preview NDA" opens the rendered document modal before sending.
 */
export function SignaturePanel({
  signature,
  candidateName,
  canEdit = true,
  onSendForSignature,
  onPreviewNda,
  isSending = false,
  className,
}: SignaturePanelProps) {
  const { label: statusLabel, badgeClass, icon: StatusIcon } =
    formatPlainEnvelopeStatus(signature.envelopeStatus, signature.sentAt);

  const isSigned = signature.envelopeStatus === "SIGNED";
  const isDeclined = signature.envelopeStatus === "DECLINED";
  const isSentOrViewed =
    signature.envelopeStatus === "SENT" || signature.envelopeStatus === "VIEWED";

  return (
    <div
      className={cn(
        "bg-card border border-border/70 rounded-xl p-5 shadow-xs space-y-4",
        className
      )}
    >
      {/* Panel Header: Template Name */}
      <div className="space-y-1 border-b border-border/50 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FileSignature className="size-3.5 text-teal-600 dark:text-teal-400" />
            E-Signature
          </span>
          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium",
              badgeClass
            )}
          >
            <StatusIcon className="size-3" />
            {signature.envelopeStatus === "SIGNED" ? "Signed" : statusLabel.split(",")[0]}
          </span>
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
          {signature.templateName}
        </h3>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Non-disclosure & confidentiality agreement for DIEZ authorized access
        </p>
      </div>

      {/* Signer Sequence per §4.3 */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
          Signer Order
        </span>
        <div className="space-y-2">
          {signature.signers.map((signer) => {
            const isSignerCompleted =
              isSigned || (signer.order === 1 && signature.envelopeStatus === "VIEWED");

            return (
              <div
                key={signer.order}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-5 rounded-full bg-muted flex items-center justify-center font-mono text-[10px] font-semibold text-foreground shrink-0">
                    {signer.order}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {signer.name || (signer.role === "Candidate" && candidateName ? candidateName : "Signer")}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {signer.role}
                    </p>
                  </div>
                </div>

                {isSigned ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="size-3" />
                    Signed
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Envelope Status Strip (Plain Language, No Webhook Leak) */}
      <div className="p-3 rounded-lg bg-muted/15 border border-border/50 text-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px]">Envelope status</span>
          <span className="font-mono text-[11px] font-semibold text-foreground">
            {statusLabel}
          </span>
        </div>
        {isSigned && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 border-t border-border/30">
            <ShieldCheck className="size-3 shrink-0" />
            Tamper-evident audit certificate sealed by DIEZ Compliance.
          </p>
        )}
      </div>

      {/* Contained Action Buttons per §1.3 */}
      {canEdit && (
        <div className="space-y-2 pt-1 border-t border-border/40">
          {/* Action 1: Preview NDA Modal (Always available) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreviewNda}
            className="w-full h-8.5 text-xs font-medium text-foreground border-border hover:bg-muted cursor-pointer"
          >
            <Eye className="size-3.5 mr-1.5 text-muted-foreground" />
            Preview NDA
          </Button>

          {/* Action 2: Send for signature — SECONDARY Outlined Action per §1.3 (NEVER solid primary) */}
          {!isSigned ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSendForSignature}
              disabled={isSending}
              className="w-full h-8.5 text-xs font-semibold border-teal-600/40 text-teal-700 dark:text-teal-300 hover:bg-teal-500/10 hover:border-teal-600/60 cursor-pointer shadow-none transition-colors"
            >
              {isSending ? (
                <>
                  <Clock className="size-3.5 mr-1.5 animate-spin" />
                  Sending envelope...
                </>
              ) : isSentOrViewed ? (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  Resend signature link
                </>
              ) : isDeclined ? (
                <>
                  <AlertCircle className="size-3.5 mr-1.5 text-destructive" />
                  Resend envelope
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  Send for signature
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="size-3.5" />
              Envelope signed and complete
            </div>
          )}
        </div>
      )}
    </div>
  );
}
