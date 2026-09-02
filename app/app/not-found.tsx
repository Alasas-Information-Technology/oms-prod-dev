"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Wallet,
  ShieldCheck,
  Search,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center space-y-8 animate-in fade-in-50 duration-300">
      {/* 404 Visual Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card shadow-xs text-xs font-bold uppercase tracking-wider text-primary mx-auto">
          <Compass className="size-3.5 animate-spin-slow text-primary" />
          <span>Resource Not Found · Error 404</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 leading-none">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Requested Application Route Not Found
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          The OMS view or resource you requested could not be located. It may have been moved, renamed, or you may lack authorization to access it.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs rounded-xl shadow-2xs gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Go Back</span>
        </Button>

        <Button
          asChild
          size="sm"
          className="h-9 px-4 text-xs rounded-xl shadow-xs gap-1.5 font-semibold"
        >
          <Link href="/app">
            <LayoutDashboard className="size-3.5" />
            <span>Go to Dashboard</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs rounded-xl shadow-2xs gap-1.5"
        >
          <Link href="/app/requests">
            <FileText className="size-3.5" />
            <span>All Requests</span>
          </Link>
        </Button>
      </div>

      {/* Directory Grid */}
      <div className="w-full max-w-2xl pt-4 space-y-3 text-left">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
          Active Functional Workspaces
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/app"
            className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all duration-200 flex items-center gap-3 group shadow-2xs"
          >
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <LayoutDashboard className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Dashboard & Feeds
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Real-time metrics, approvals & attention items
              </p>
            </div>
          </Link>

          <Link
            href="/app/requests"
            className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-emerald-500/40 transition-all duration-200 flex items-center gap-3 group shadow-2xs"
          >
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                OMS Requests
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Create, track, and clarify requisitions
              </p>
            </div>
          </Link>

          <Link
            href="/app/budget"
            className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-amber-500/40 transition-all duration-200 flex items-center gap-3 group shadow-2xs"
          >
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Wallet className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Budget Control Center
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Department ledgers and allocations
              </p>
            </div>
          </Link>

          <Link
            href="/app/administration/security-dashboard"
            className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-purple-500/40 transition-all duration-200 flex items-center gap-3 group shadow-2xs"
          >
            <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Security Operations
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Active sessions & security monitoring
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
