"use client";

import * as React from "react";
import Image from "next/image";
import { Link2Off, MailQuestion, ShieldAlert } from "lucide-react";

/**
 * Full-page error view for invalid, expired, revoked, or unknown candidate tokens.
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Part 1 & Part 4
 *
 * Mandatory security rules:
 * 1. Exactly identical message for all failure reasons (non-enumeration).
 * 2. NO shell chrome on this state (no 44px top bar, no nav, no DIEZ breadcrumbs).
 * 3. Never leak whether the token ever existed, is expired, or was revoked.
 */
export function CandidateTokenInvalidView() {
  return (
    <div
      id="candidate-token-invalid-view"
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
        {/* DIEZ Brand Emblem (Muted & Discrete) */}
        <div className="mb-8 flex items-center justify-center opacity-80 transition-opacity hover:opacity-100">
          <Image
            src="/c-logo.png"
            alt="DIEZ"
            height={28}
            width={112}
            priority
            style={{ width: "auto" }}
            className="h-7 w-auto object-contain dark:brightness-110"
          />
        </div>

        {/* Security Icon Pill */}
        <div className="size-16 rounded-2xl bg-muted/70 dark:bg-muted/40 border border-border/80 flex items-center justify-center mb-6 shadow-xs">
          <Link2Off className="size-8 text-muted-foreground/80" aria-hidden="true" />
        </div>

        {/* Real Heading */}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
          Access Link Inactive
        </h1>

        {/* Mandatory Non-Enumeration Message */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mb-8">
          This link is no longer valid. Contact your onboarding coordinator for a new one.
        </p>

        {/* Support Note */}
        <div className="w-full p-4 rounded-xl bg-card border border-border/60 text-xs text-muted-foreground text-left flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-medium text-foreground block">
              Security Notice
            </span>
            <span>
              Joining readiness links are time-limited and scoped strictly to your individual case.
              If you believe this is an error, your onboarding coordinator can issue a refreshed link immediately.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
