"use client";

import * as React from "react";
import {
  VendorSignatureInfo,
  VendorCandidateSummary,
} from "@/src/types/vendor-documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSignature,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NdaPreviewModalContentProps {
  signature: VendorSignatureInfo;
  candidateName: string;
  candidateNationality?: string;
  candidateResidentStatus?: string;
  position?: string;
  onClose: () => void;
  onSendForSignature?: () => void;
  isSending?: boolean;
}

/**
 * Inner content component for NDA Preview.
 * Cleanly separated from DialogPortal for direct SSR testing.
 */
export function NdaPreviewModalContent({
  signature,
  candidateName,
  candidateNationality = "India",
  candidateResidentStatus = "ONSHORE",
  position = "Senior Cybersecurity Analyst",
  onClose,
  onSendForSignature,
  isSending = false,
}: NdaPreviewModalContentProps) {
  const isSigned = signature.envelopeStatus === "SIGNED";

  return (
    <>
      <DialogHeader className="space-y-1 text-left border-b border-border/50 pb-3">
        <div className="flex items-center justify-between gap-2 pr-6">
          <div className="flex items-center gap-2">
            <FileSignature className="size-4.5 text-teal-600 dark:text-teal-400" />
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
              {`Preview NDA — ${signature.templateName}`}
            </DialogTitle>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {signature.envelopeStatus === "SIGNED" ? "Executed" : "Standard DIEZ Template"}
          </span>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Rendered legal text presented to the candidate for DocuSign digital execution.
        </DialogDescription>
      </DialogHeader>

      {/* Candidate & Position Context Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/60 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Candidate</span>
          <span className="font-semibold text-foreground truncate block">{candidateName}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Position</span>
          <span className="font-semibold text-foreground truncate block">{position}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Nationality</span>
          <span className="font-semibold text-foreground block">{candidateNationality}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Status</span>
          <span className="font-semibold text-foreground block capitalize">
            {candidateResidentStatus.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Rendered Agreement Document Body */}
      <div className="max-h-[380px] overflow-y-auto p-4 rounded-lg bg-muted/10 border border-border/70 space-y-4 text-xs font-serif leading-relaxed text-foreground/90 select-text">
        <div className="text-center space-y-1 pb-3 border-b border-border/40 font-sans">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Dubai Integrated Economic Zones Authority (DIEZ)
          </p>
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Doc Ref: DIEZ-SEC-NDA-2026-V3 · Standard Outsourced Resource Agreement
          </p>
        </div>

        <section className="space-y-1.5 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">
            1. PARTIES & PURPOSE
          </h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            This Non-Disclosure Agreement ("Agreement") is entered into by and between <strong>Dubai Integrated Economic Zones Authority ("DIEZ")</strong> and <strong>{candidateName}</strong> ("Resource"), engaged in connection with the requisitioned position of <strong>{position}</strong>. The Resource acknowledges that in the course of providing contracted services, they will have access to confidential, proprietary, and security-sensitive materials.
          </p>
        </section>

        <section className="space-y-1.5 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">
            2. DEFINITION OF CONFIDENTIAL INFORMATION
          </h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            "Confidential Information" encompasses all tangible and intangible data, technical specifications, network diagrams, cybersecurity credentials, financial records, tenant data, personal data under UAE Federal Decree Law No. 45 of 2021, and internal business records disclosed by or observed within DIEZ infrastructure.
          </p>
        </section>

        <section className="space-y-1.5 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">
            3. NON-DISCLOSURE OBLIGATIONS & SECURITY CONTROLS
          </h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            The Resource covenants to maintain strict confidentiality of all Information, refrain from copying, disseminating, reverse engineering, or removing Information from designated DIEZ virtual or physical premises without prior written authorization from DIEZ Information Security.
          </p>
        </section>

        <section className="space-y-1.5 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">
            4. TERM & GOVERNING LAW
          </h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            This Agreement remains binding throughout the engagement term and for a period of five (5) years following completion of services. This Agreement is governed by the laws of the <strong>Emirate of Dubai and applicable Federal Laws of the United Arab Emirates</strong>. The Dubai Courts shall have exclusive jurisdiction.
          </p>
        </section>

        {/* Execution Blocks */}
        <div className="pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
          <div className="p-2.5 rounded border border-border/50 bg-muted/20 space-y-1 text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">
              Signer 1 (Resource)
            </span>
            <p className="font-semibold text-foreground">{candidateName}</p>
            <p className="text-[10px] text-muted-foreground">Candidate / Contractor</p>
            <div className="pt-1 text-[10px] text-muted-foreground">
              {isSigned ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Signed digitally via DocuSign
                </span>
              ) : (
                "Status: Awaiting electronic signature"
              )}
            </div>
          </div>

          <div className="p-2.5 rounded border border-border/50 bg-muted/20 space-y-1 text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">
              Signer 2 (Authority)
            </span>
            <p className="font-semibold text-foreground">DIEZ Authorized Representative</p>
            <p className="text-[10px] text-muted-foreground">DIEZ Human Resources / Procurement</p>
            <div className="pt-1 text-[10px] text-muted-foreground">
              {isSigned ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Counter-signed and sealed
                </span>
              ) : (
                "Status: Countersignature pending candidate signature"
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Close
        </Button>

        {!isSigned && onSendForSignature && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onSendForSignature();
              onClose();
            }}
            disabled={isSending}
            className="text-xs font-semibold border-teal-600/40 text-teal-700 dark:text-teal-300 hover:bg-teal-500/10 cursor-pointer"
          >
            {isSending ? (
              <>
                <Clock className="size-3.5 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-3.5 mr-1.5" />
                Send for signature
              </>
            )}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export interface NdaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  signature: VendorSignatureInfo;
  candidateName: string;
  candidateNationality?: string;
  candidateResidentStatus?: string;
  position?: string;
  onSendForSignature?: () => void;
  isSending?: boolean;
}

/**
 * Modal dialog for previewing the rendered NDA before sending (§4.3 & Task 3).
 */
export function NdaPreviewModal({
  isOpen,
  onClose,
  signature,
  candidateName,
  candidateNationality,
  candidateResidentStatus,
  position,
  onSendForSignature,
  isSending,
}: NdaPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl">
        <NdaPreviewModalContent
          signature={signature}
          candidateName={candidateName}
          candidateNationality={candidateNationality}
          candidateResidentStatus={candidateResidentStatus}
          position={position}
          onClose={onClose}
          onSendForSignature={onSendForSignature}
          isSending={isSending}
        />
      </DialogContent>
    </Dialog>
  );
}
