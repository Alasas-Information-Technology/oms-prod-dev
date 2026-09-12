"use client";

import * as React from "react";
import Link from "next/link";
import { AppLogo } from "./AppLogo";
import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "../sidebar";
import { AccountDropdown } from "./AccountDropdown";

/**
 * Vendor Portal Header Component (Part 1 & VENDOR-PORTAL-UI.md)
 *
 * Distinct from InternalHeader:
 * - Persistent thin secondary-tone top bar (muted teal: bg-teal-500) visible on any screenshot
 * - Distinct Wordmark: "DIEZ · Vendor Portal" + Accredited Partner badge
 * - Fixed Vendor IA links
 * - Vendor TLS Session indicator and Vendor account dropdown matching internal portal design
 */
export function VendorHeader() {
  const sidebarContext = useSidebar();
  const toggleSidebar = sidebarContext?.toggleSidebar;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex flex-col bg-secondary/90 backdrop-blur-md border-b border-border/50 text-foreground print:hidden">
      {/* Visual Accent: Persistent thin muted-teal top bar (Part 1) */}
      <div
        className="h-1 w-full bg-teal-500 shrink-0 shadow-xs shadow-teal-500/20"
        aria-hidden="true"
      />

      {/* Main Vendor Header Bar (52px) */}
      <div className="h-12 md:h-13 flex items-center justify-between px-4 sm:px-6">
        {/* Left section: Sidebar toggle + Logo + Distinct "DIEZ · Vendor Portal" Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          {toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-white/80 dark:text-foreground/80 hover:text-white dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer"
              onClick={toggleSidebar}
              aria-label="Toggle vendor sidebar"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          )}

          <Link href="/vendor/onboarding" className="flex items-center gap-2">
            <AppLogo />
            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <span className="font-semibold text-sm tracking-tight text-white dark:text-foreground">
                DIEZ · Vendor Portal
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] font-mono uppercase px-1.5 py-0 bg-teal-500/15 text-teal-300 border-teal-500/40"
              >
                Accredited Partner
              </Badge>
            </div>
          </Link>
        </div>

        {/* Center section: High-level Vendor Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs">
          <Link
            href="/vendor"
            className="px-3 py-1.5 rounded-md font-medium text-white/90 dark:text-foreground/90 hover:text-white dark:hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/vendor/requisitions"
            className="px-3 py-1.5 rounded-md font-medium text-white/70 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Requirements
          </Link>
          <Link
            href="/vendor/submissions"
            className="px-3 py-1.5 rounded-md font-medium text-white/70 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Submissions
          </Link>
          <Link
            href="/vendor/onboarding"
            className="px-3 py-1.5 rounded-md font-medium text-white/70 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Onboarding
          </Link>
        </nav>

        {/* Right section: Utilities + Vendor Account Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/70 dark:text-muted-foreground font-mono text-[11px] pr-2 border-r border-border/40">
            <ShieldCheck className="size-3.5 text-teal-400" />
            <span>Vendor TLS Session</span>
          </div>

          {/* Theme toggle: 32px hit area */}
          <AnimatedThemeToggler variant="circle" duration={600} />

          {/* Vendor Account Dropdown (matching Internal Portal design) */}
          <AccountDropdown portal="vendor" showLabel />
        </div>
      </div>
    </header>
  );
}

// Re-export as VendorTopbar for backward compatibility
export { VendorHeader as VendorTopbar };
