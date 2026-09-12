"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, Mail, Phone, Clock, UserCheck } from "lucide-react";
import { CandidateCoordinator } from "@/src/types/candidate-portal";

interface CandidateMinimalHeaderProps {
  coordinator?: CandidateCoordinator;
  defaultHelpOpen?: boolean;
}

/**
 * 44px Reduced Shell Top Bar for Candidate Joining Readiness.
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Task 1 (JR2)
 *
 * Requirements:
 * - 44px minimal bar (h-11)
 * - DIEZ mark + "Onboarding · Candidate View"
 * - Theme toggle (AnimatedThemeToggler)
 * - Single Help entry (accessible dialog with coordinator contact)
 * - No sidebar, no search, no cross-case navigation
 * - Teal theme (--brand-teal)
 */
export function CandidateMinimalHeader({
  coordinator,
  defaultHelpOpen = false,
}: CandidateMinimalHeaderProps) {
  const [helpOpen, setHelpOpen] = React.useState(defaultHelpOpen);

  return (
    <header
      id="candidate-minimal-header"
      className="sticky top-0 z-30 flex flex-col bg-background/90 backdrop-blur-md border-b border-border/50 text-foreground transition-colors"
    >
      {/* Visual Accent: Persistent 2px Teal Branding Line */}
      <div
        className="h-[2px] w-full bg-[var(--brand-teal,#0D9488)] shrink-0"
        aria-hidden="true"
      />

      {/* 44px (h-11) Minimal Action Bar */}
      <div className="h-11 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: DIEZ Mark + Contextual Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center">
            <Image
              src="/c-logo.png"
              alt="DIEZ Logo"
              height={20}
              width={80}
              priority
              style={{ width: "auto" }}
              className="h-5 w-auto object-contain dark:brightness-110"
            />
          </div>

          <div className="h-3.5 w-px bg-border/70" aria-hidden="true" />

          <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground/90 select-none">
            Onboarding · Candidate View
          </span>
        </div>

        {/* Right Section: Single Help Entry + Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Single Help Entry */}
          <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                aria-label="Open onboarding assistance and help"
              >
                <HelpCircle className="size-3.5 text-[var(--brand-teal,#0D9488)]" />
                <span>Help</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <UserCheck className="size-4 text-[var(--brand-teal,#0D9488)]" />
                  Onboarding Support & Assistance
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Have questions about your required documents, medical appointment, or joining date?
                  Your designated coordinator is here to assist.
                </DialogDescription>
              </DialogHeader>

              {/* Coordinator Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3 mt-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                    Your Onboarding Coordinator
                  </span>
                  <span className="text-sm font-semibold text-foreground block mt-0.5">
                    {coordinator?.name || "Layla Hassan"}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {coordinator?.role || "Onboarding Coordinator"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                  <a
                    href={`mailto:${coordinator?.email || "layla.hassan@example.com"}`}
                    className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/60 hover:border-[var(--brand-teal,#0D9488)]/50 hover:bg-[var(--brand-teal,#0D9488)]/5 transition-colors text-foreground"
                  >
                    <Mail className="size-3.5 text-[var(--brand-teal,#0D9488)] shrink-0" />
                    <span className="truncate">{coordinator?.email || "layla.hassan@example.com"}</span>
                  </a>

                  <a
                    href={`tel:${coordinator?.phone || "+97141234567"}`}
                    className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/60 hover:border-[var(--brand-teal,#0D9488)]/50 hover:bg-[var(--brand-teal,#0D9488)]/5 transition-colors text-foreground"
                  >
                    <Phone className="size-3.5 text-[var(--brand-teal,#0D9488)] shrink-0" />
                    <span className="font-mono">{coordinator?.phone || "+971 4 123 4567"}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                  <Clock className="size-3 text-muted-foreground shrink-0" />
                  <span>Sunday – Thursday, 8:00 AM – 4:00 PM GST</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground text-center">
                All document uploads and confirmations on this portal are recorded in real time.
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <AnimatedThemeToggler
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
