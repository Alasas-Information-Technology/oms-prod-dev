"use client";

import * as React from "react";
import {
  VendorCandidateSummary,
  VendorOnboardingDeadline,
} from "@/src/types/vendor-documents";
import {
  formatJoiningDate,
  formatAuditTimestamp,
  getDeadlineVisuals,
} from "@/src/lib/vendor-documents/formatters";
import {
  ShieldCheck,
  ChevronDown,
  Check,
  Lock,
  FileCheck,
  Shield,
  FileText,
  UserCheck,
  Calendar,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CandidateSummaryPanelProps {
  candidate: VendorCandidateSummary;
  candidateRef: string;
  position: string;
  deadline?: VendorOnboardingDeadline;
  className?: string;
}

/**
 * 6 facts of the security trust indicator per §1.9 & §4.1
 */
const SECURITY_FACTS = [
  {
    icon: Lock,
    title: "Signed session",
    desc: "Authenticated via enterprise TLS & HttpOnly token",
  },
  {
    icon: FileCheck,
    title: "File types validated",
    desc: "Strict MIME verification (PDF, PNG, JPEG only)",
  },
  {
    icon: Shield,
    title: "Malware scanned",
    desc: "Server-side scanning prior to DIEZ clearance",
  },
  {
    icon: Lock,
    title: "Encrypted",
    desc: "AES-256 at rest and TLS 1.3 in transit",
  },
  {
    icon: FileText,
    title: "Access audited",
    desc: "Every view, download, and event is logged",
  },
  {
    icon: UserCheck,
    title: "Consent recorded",
    desc: "Candidate data processing consent verified",
  },
];

/**
 * 260px Candidate Summary Panel (Left Column)
 * Read-only reference with "From your submission" badge, contact info,
 * privacy acknowledgement, and collapsed 1-icon Secure trust indicator.
 */
export function CandidateSummaryPanel({
  candidate,
  candidateRef,
  position,
  deadline,
  className,
}: CandidateSummaryPanelProps) {
  const [isTrustOpen, setIsTrustOpen] = React.useState(false);
  const deadlineVisuals = deadline ? getDeadlineVisuals(deadline) : null;

  return (
    <aside
      className={cn(
        "w-full lg:w-[260px] shrink-0 space-y-4 text-sm",
        className
      )}
      aria-label="Candidate Summary Reference"
    >
      <div className="bg-card border border-border/70 rounded-xl p-4.5 shadow-xs space-y-4">
        {/* Panel Header */}
        <div className="space-y-1.5 border-b border-border/50 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Candidate
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground bg-muted/40 border-border/60"
            >
              From your submission
            </Badge>
          </div>

          <h2 className="text-base font-semibold text-foreground leading-snug">
            {candidate.fullName}
          </h2>
          <p className="text-xs text-muted-foreground leading-tight">
            {position} <span className="text-muted-foreground/60">({candidateRef})</span>
          </p>
        </div>

        {/* Candidate Profile Details (Read-only reference) */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground/70" />
              Nationality
            </span>
            <span className="font-medium text-foreground">{candidate.nationality}</span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Resident status</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider font-mono px-1.5 py-0",
                candidate.residentStatus === "ONSHORE"
                  ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
              )}
            >
              {candidate.residentStatus}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground/70" />
              Joining date
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {formatJoiningDate(candidate.expectedJoining)}
            </span>
          </div>

          {/* Contact Details — Unmasked for owning vendor coordinator (§1.5 & Requirement 6) */}
          <div className="pt-2 border-t border-border/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground" title={candidate.email}>
              <Mail className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate text-foreground/90 select-all font-mono text-[11px]">
                {candidate.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span className="text-foreground/90 select-all font-mono text-[11px]">
                {candidate.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice Acknowledged Status */}
        <div className="pt-3 border-t border-border/50">
          <div
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
              candidate.privacyNoticeAcknowledged
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Check className="size-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-[11px]">
              Privacy notice acknowledged
            </span>
          </div>
        </div>

        {/* Collapsed Secure Trust Indicator per §1.9 & §4.1 */}
        <div className="pt-2 border-t border-border/50">
          <Collapsible
            open={isTrustOpen}
            onOpenChange={setIsTrustOpen}
            className="w-full space-y-2"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors text-left cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-expanded={isTrustOpen}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>Secure platform</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground">
                  <span className="font-mono text-[10px]">6 controls</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isTrustOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1.5 pt-1 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="p-2.5 bg-muted/20 border border-border/50 rounded-lg space-y-2 text-[11px]">
                {SECURITY_FACTS.map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <fact.icon className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-[11px] leading-tight">
                        {fact.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {fact.desc}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Audit Timestamp per §1.10 (Gulf Standard Time) */}
                <div className="pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground/80 font-mono">
                  Audited: {formatAuditTimestamp(new Date())}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </aside>
  );
}
