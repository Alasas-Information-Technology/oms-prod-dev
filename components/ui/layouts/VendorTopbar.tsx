"use client";

import * as React from "react";
import Link from "next/link";
import { AppLogo } from "./AppLogo";
import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { Badge } from "@/components/ui/badge";
import { Building2, User, ExternalLink, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PersonaSwitcher } from "@/components/oms/demo";

export function VendorTopbar() {
  return (
    <header className="h-12 md:h-13 shrink-0 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-secondary/90 backdrop-blur-md border-b border-border/50 text-foreground print:hidden">
      {/* Left section: Logo + Dedicated "OEMS Vendor Portal" Branding */}
      <div className="flex items-center gap-3">
        <Link href="/vendor/onboarding" className="flex items-center gap-2.5">
          <AppLogo />
          <div className="flex items-center gap-2 pl-2 border-l border-border/60">
            <span className="font-semibold text-sm tracking-tight text-white dark:text-foreground">
              OEMS Vendor Portal
            </span>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[10px] font-mono uppercase px-1.5 py-0 bg-teal-500/15 text-teal-200 border-teal-500/30"
            >
              Accredited Partner
            </Badge>
          </div>
        </Link>
      </div>

      {/* Center section: High-level Vendor Navigation */}
      <nav className="hidden md:flex items-center gap-1 text-xs">
        <Link
          href="/vendor/onboarding"
          className="px-3 py-1.5 rounded-md font-medium text-white/90 dark:text-foreground/90 bg-white/10 dark:bg-white/5 transition-colors"
        >
          Onboarding
        </Link>
        <Link
          href="/vendor/compliance"
          className="px-3 py-1.5 rounded-md font-medium text-white/70 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-white/5 transition-colors"
        >
          Compliance
        </Link>
      </nav>

      {/* Right section: Utilities + Vendor Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Demo Persona Switcher */}
        <PersonaSwitcher />

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/70 dark:text-muted-foreground font-mono text-[11px] pr-2 border-r border-border/40">
          <ShieldCheck className="size-3.5 text-teal-400" />
          <span>Vendor TLS Session</span>
        </div>

        {/* Theme toggle: 32px hit area */}
        <AnimatedThemeToggler variant="circle" duration={600} />

        {/* Vendor Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 px-2 text-white/85 dark:text-foreground/85 hover:text-white dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer text-xs"
            >
              <div className="size-6 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-200 font-bold text-[11px]">
                V
              </div>
              <span className="hidden sm:inline-block max-w-[120px] truncate font-medium">
                CyberSec Partners
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="font-semibold text-xs text-foreground">CyberSec Partners LLC</p>
                <p className="text-[11px] text-muted-foreground">coordinator@cybersec-partners.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/vendor/profile">Organization Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/vendor/compliance">Accreditation Documents</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer text-destructive focus:text-destructive">
              <Link href="/api/auth/logout">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
