"use client";

import * as React from "react";
import { CheckCircle2, CalendarCheck, Clock, Check, AlertCircle } from "lucide-react";
import { CandidatePortalKpi, CandidateResidentStatus } from "@/src/types/candidate-portal";
import { cn } from "@/lib/utils";

interface CandidateKpiSurfaceProps {
  readinessScore: number;                 // 0-100
  kpi: CandidatePortalKpi;
  residentStatus?: CandidateResidentStatus;
  className?: string;
}

/**
 * T1 Unified KPI Surface for Candidate Joining Readiness.
 * Specification: docs/DESIGN-SYSTEM.md T1, T2, T5 & docs/CANDIDATE-JOINING-READINESS.md Task 2 (JR3)
 *
 * Requirements:
 * - One continuous card, five columns, 100px height (on desktop)
 * - 1px hairline dividers at 8% opacity (border-foreground/8)
 * - Column 1: Readiness Score as T5 segmented tick bar (20 discrete ticks), NOT a donut/ring
 * - Column 2: Documents (e.g. 4/4) with T2 weight contrast (heavy numerator, light denominator)
 * - Column 3: Offer reference in font-mono
 * - Column 4: Biometric appointment status chip
 * - Column 5: Joining confirmation status chip
 */
export function CandidateKpiSurface({
  readinessScore,
  kpi,
  residentStatus,
  className,
}: CandidateKpiSurfaceProps) {
  // T5 Segmented Tick Bar: 20 ticks
  const totalTicks = 20;
  const filledTicks = Math.max(0, Math.min(totalTicks, Math.round((readinessScore / 100) * totalTicks)));

  const docsCompleted = kpi.documents.completed;
  const docsTotal = kpi.documents.total;
  const isAllDocsComplete = docsCompleted >= docsTotal && docsTotal > 0;

  const isOffshore = residentStatus === "OFFSHORE";
  const bioStatus = kpi.biometricAppointment?.toUpperCase() || (isOffshore ? "NOT_REQUIRED" : "PENDING");

  return (
    <section
      id="candidate-kpi-surface"
      aria-label="Candidate Joining Key Performance Indicators"
      className={cn(
        "w-full rounded-xl border border-border/60 bg-card select-none transition-colors shadow-2xs overflow-hidden",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 min-h-[100px]">
        {/* ── COLUMN 1: Readiness Score (T5 Segmented Tick Bar) ── */}
        <div
          id="kpi-readiness-score"
          className="flex flex-col justify-between p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-foreground/8 relative"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Readiness Score
          </span>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {/* T5 Tick Progress Gauge: 20 discrete vertical ticks (2px x 12px, 2px gap, 1px radius) */}
            <div
              className="flex items-center gap-[2px] py-1"
              role="meter"
              aria-valuenow={readinessScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Readiness Score: ${readinessScore}%`}
            >
              {Array.from({ length: totalTicks }, (_, index) => {
                const isFilled = index < filledTicks;
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-[2px] h-3 rounded-[1px] transition-colors",
                      isFilled
                        ? "bg-[var(--brand-teal,#0D9488)]"
                        : "bg-foreground/12 dark:bg-foreground/15"
                    )}
                    aria-hidden="true"
                  />
                );
              })}
            </div>

            {/* Percentage displayed beside ticks in mono tabular-nums */}
            <span className="font-mono text-sm sm:text-base font-bold tabular-nums text-foreground">
              {`(${readinessScore}%)`}
            </span>
          </div>

          <span className="text-xs text-muted-foreground block mt-1">
            Server-verified progress
          </span>
        </div>

        {/* ── COLUMN 2: Documents (T2 Weight Contrast) ── */}
        <div
          id="kpi-documents"
          className="flex flex-col justify-between p-4 sm:p-5 border-b sm:border-b-0 lg:border-r border-foreground/8 relative"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Documents
          </span>

          {/* T2 Weight Contrast: Heavy bold numerator, lighter muted slash and denominator */}
          <div className="flex items-baseline gap-1 mt-2 sm:mt-0 font-mono tabular-nums">
            <span className="font-bold text-xl sm:text-2xl text-foreground">
              {docsCompleted}
            </span>
            <span className="text-muted-foreground text-sm sm:text-base font-medium">
              {`/ ${docsTotal}`}
            </span>
          </div>

          <span className="text-xs text-muted-foreground block mt-1">
            {isAllDocsComplete ? "All verified" : `${docsTotal - docsCompleted} pending upload`}
          </span>
        </div>

        {/* ── COLUMN 3: Offer Reference (Mono) ── */}
        <div
          id="kpi-offer-reference"
          className="flex flex-col justify-between p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-foreground/8 relative"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Offer Reference
          </span>

          <div className="mt-2 sm:mt-0">
            <span className="inline-block font-mono font-bold text-xs sm:text-sm text-foreground bg-muted/60 dark:bg-muted/40 px-2 py-0.5 rounded border border-border/50 select-all tracking-tight">
              {kpi.offerReference || "LPO-260771"}
            </span>
          </div>

          <span className="text-xs text-muted-foreground block mt-1">
            Issued & Accepted
          </span>
        </div>

        {/* ── COLUMN 4: Biometric Appointment Status Chip ── */}
        <div
          id="kpi-biometric-appointment"
          className="flex flex-col justify-between p-4 sm:p-5 border-b sm:border-b-0 lg:border-r border-foreground/8 relative"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Biometric Appointment
          </span>

          <div className="mt-2 sm:mt-0">
            {bioStatus === "SCHEDULED" ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300 shadow-2xs"
                role="status"
              >
                <CalendarCheck className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Scheduled</span>
              </div>
            ) : bioStatus === "NOT_REQUIRED" ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-muted/60 border-border/60 text-muted-foreground"
                role="status"
              >
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Not Required</span>
              </div>
            ) : bioStatus === "COMPLETED" ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#ECFDF5] dark:bg-[#142924] border-[#059669] dark:border-[#34D399] text-[#065F46] dark:text-[#A7F3D0]"
                role="status"
              >
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Completed</span>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#FFFBEB] dark:bg-[#2E2416] border-[#B45309] dark:border-[#FBBF24] text-[#78350F] dark:text-[#FDE68A]"
                role="status"
              >
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Action Needed</span>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground block mt-1">
            {isOffshore ? "Offshore exemption" : "Saned Service Center"}
          </span>
        </div>

        {/* ── COLUMN 5: Joining Confirmation Status Chip ── */}
        <div
          id="kpi-joining-confirmation"
          className="flex flex-col justify-between p-4 sm:p-5 relative"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Joining Confirmation
          </span>

          <div className="mt-2 sm:mt-0">
            {kpi.joiningConfirmed ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#ECFDF5] dark:bg-[#142924] border-[#059669] dark:border-[#34D399] text-[#065F46] dark:text-[#A7F3D0] shadow-2xs"
                role="status"
              >
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Confirmed</span>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#FFFBEB] dark:bg-[#2E2416] border-[#B45309] dark:border-[#FBBF24] text-[#78350F] dark:text-[#FDE68A]"
                role="status"
              >
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Pending</span>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground block mt-1">
            {kpi.joiningConfirmed ? "Start date accepted" : "Pending candidate confirmation"}
          </span>
        </div>
      </div>
    </section>
  );
}
