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
  Home,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden selection:bg-primary/20">
      {/* Subtle Digital Background Grids & Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center space-y-8 animate-in fade-in-50 zoom-in-95 duration-300">
        {/* Brand & Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card shadow-xs text-xs font-bold uppercase tracking-wider text-primary">
          <Compass className="size-3.5 animate-spin-slow text-primary" />
          <span>DIEZ OMS · Error 404</span>
        </div>

        {/* Big Stylized 404 Display */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 leading-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            The page or operational resource you are looking for does not exist, has been relocated, or is temporarily unavailable.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 text-sm rounded-xl border-border/80 shadow-2xs gap-2 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-11 px-6 text-sm rounded-xl shadow-md gap-2 font-semibold"
          >
            <Link href="/app">
              <LayoutDashboard className="size-4" />
              <span>Return to Dashboard</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 text-sm rounded-xl border-border/80 shadow-2xs gap-2"
          >
            <Link href="/app/requests">
              <FileText className="size-4" />
              <span>View Requests</span>
            </Link>
          </Button>
        </div>

        {/* Quick Directory Cards */}
        <div className="w-full pt-4 space-y-3 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 block text-center">
            Quick Navigation Directory
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/app"
              className="p-4 rounded-xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 flex items-center gap-3.5 group"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Operations Dashboard
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  KPIs, approvals, and live operational feeds
                </p>
              </div>
            </Link>

            <Link
              href="/app/requests"
              className="p-4 rounded-xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 flex items-center gap-3.5 group"
            >
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Requisitions & Requests
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Submit, track, and clarify outsource requests
                </p>
              </div>
            </Link>

            <Link
              href="/app/budget"
              className="p-4 rounded-xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 flex items-center gap-3.5 group"
            >
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wallet className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Budget Control Center
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Department ledgers, allocations & caps
                </p>
              </div>
            </Link>

            <Link
              href="/app/administration/security-dashboard"
              className="p-4 rounded-xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-200 flex items-center gap-3.5 group"
            >
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Security Operations
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Active sessions, audit trail & policies
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Support Link */}
        <p className="text-xs text-muted-foreground/80 pt-2 flex items-center gap-1.5 justify-center">
          <HelpCircle className="size-3.5" />
          <span>Need system access or assistance? Contact your DIEZ System Administrator.</span>
        </p>
      </div>
    </div>
  );
}
