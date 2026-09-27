"use client";

import Link from "next/link";
import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { GlobalSearch } from "../global-search";
import AccountDropdown from "./AccountDropdown";
import { AppLogo } from "./AppLogo";
import Notification from "./notification-dropdown";
import { useSidebar } from "../sidebar";
import { Menu, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNeedsAttentionSummary } from "@/lib/fixtures/dashboard-attention.fixtures";

/**
 * Internal Portal Header Component (Part 1 & APP-SHELL-SPEC Part 3)
 *
 * Distinct from VendorHeader:
 * - Wordmark: "DIEZ · Outsource Management System"
 * - Standard theme header chrome (no vendor accent stripe)
 * - Search, Needs Attention badge, Notification, and Internal Account Dropdown
 */
export function InternalHeader() {
  const sidebarContext = useSidebar();
  const toggleSidebar = sidebarContext?.toggleSidebar;
  const { totalCount } = getNeedsAttentionSummary();

  return (
    <header className="h-14 md:h-15 shrink-0 w-full z-30 flex items-center justify-between px-4 bg-transparent backdrop-blur-md  print:hidden">
      {/* Left section: Sidebar toggle + Logo + Distinct Internal Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">

        {toggleSidebar && (
          <div className="p-1 bg-background rounded-full flex items-center gap-3 shadow-lg border border-2 border-primary-500/30 hover:border-teal-500/50 hover:border-2 dark:hover:bg-white/5 text-foreground/90 dark:text-foreground/90 transition-all duration-[800ms] ease-in-out">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-primary/80 dark:text-foreground/80 hover:text-brand-teal dark:hover:text-brand-teal hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer"
              onClick={toggleSidebar}
              aria-label="Toggle internal sidebar"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>

            {!sidebarContext?.open && (
              <Link href="/app" className="flex items-center gap-2 pr-2">
                <AppLogo className="h-8" />
              </Link>
            )}
          </div>
        )}

        {/* <Link href="/app" className="flex items-center gap-2">
          <AppLogo />
          <div className="hidden sm:flex items-center pl-2 border-l border-border/60">
            <span className="font-semibold text-sm tracking-tight text-white dark:text-foreground">
              DIEZ · Outsource Management System
            </span>
          </div>
        </Link> */}
      </div>

      {/* Center section: Search (420px max, centered) */}
      {/* 
      <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
        <div className="w-full max-w-105">
          <GlobalSearch />
        </div>
      </div> */}



      {/* Right section: Utilities + Avatar */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Needs Attention Global Header Badge */}
        {totalCount > 0 && (
          <Link
            href="/app/requests?tab=needs-my-action"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors"
            title={`${totalCount} items need your attention`}
          >
            <CheckSquare className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Action</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-bold tabular-nums">
              {totalCount}
            </span>
          </Link>
        )}

        <div className="p-1 bg-background rounded-full flex gap-4 shadow-lg border border-2 border-primary-500/30 hover:border-teal-500/50 hover:border-2 dark:hover:bg-white/5 text-foreground/90 dark:text-foreground/90">
          <GlobalSearch />

          {/* Notification: 32px hit area, 18px glyph */}
          <Notification />

          {/* Theme toggle: 32px hit area, 18px glyph */}
          <AnimatedThemeToggler variant="circle" duration={600} />
        </div>

        {/* Avatar: 28px */}
        <AccountDropdown showLabel />
      </div>
    </header>
  );
}

// Re-export as AppTopbar for backward compatibility
export { InternalHeader as AppTopbar };
