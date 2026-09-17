"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  Building2,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Search,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";
import { listVendors, listWorkforceMembers, listOnboardingCases, getPerson } from "@/src/lib/demo-data";
import { Vendor } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

export function VendorsWorkspace() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const allVendors = React.useMemo(() => listVendors(), []);
  const allWorkforce = React.useMemo(() => listWorkforceMembers(), []);
  const allOnboardings = React.useMemo(() => listOnboardingCases(), []);

  const filteredVendors = React.useMemo(() => {
    return allVendors.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const coordinator = v.coordinatorId ? getPerson(v.coordinatorId) : null;
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesCode = v.code.toLowerCase().includes(q);
        const matchesContact = coordinator ? coordinator.name.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCode && !matchesContact) return false;
      }
      return true;
    });
  }, [allVendors, searchQuery]);

  return (
    <div className="flex flex-col min-h-full pb-16 bg-background">
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Procurement & Vendors", href: "/app/vendors" },
          { label: "Vendor Registry", isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Store className="size-6 text-primary" />
              <span>Vendor Registry & Accreditation</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Procurement-governed accredited partner agencies, rate card compliance, and active outsourced headcount.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <Link href="/app/workforce">
                <Users className="size-3.5 text-primary" />
                <span>Workforce Roster</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <Link href="/app/workforce/onboarding">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Onboarding Pipeline</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Accredited Agencies
            </span>
            <div className="text-xl font-bold text-foreground">{allVendors.length}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Active Headcount
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {allWorkforce.filter((w) => w.status !== "TERMINATED").length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Onboarding Pipeline
            </span>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {allOnboardings.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Rate Card Governance
            </span>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <BadgeCheck className="size-5 text-purple-600" />
              <span>100% Enforced</span>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor name, code, contact person..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredVendors.length} accredited agency partners
          </span>
        </div>

        {/* ── Vendor Cards ── */}
        <div className="space-y-4">
          {filteredVendors.map((vendor) => {
            const coordinator = vendor.coordinatorId ? getPerson(vendor.coordinatorId) : null;
            const vendorWorkforce = allWorkforce.filter((w) => w.vendorId === vendor.id);
            const vendorOnboarding = allOnboardings.filter((o) => o.vendorId === vendor.id);
            const activePlacements = vendorWorkforce.filter((w) => w.status !== "TERMINATED").length;

            return (
              <div
                key={vendor.id}
                className="p-5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-4 hover:border-border transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                      <Store className="size-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground">
                          {vendor.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-foreground">
                          {vendor.code}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                          <CheckCircle2 className="size-3 mr-1" />
                          Accredited
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {vendor.id === "ven-falcon"
                          ? "Primary Information Technology & Cybersecurity Staffing Partner for DIEZ"
                          : "Project Management Office & Enterprise Business Analysis Recruitment Partner"}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{vendor.email || coordinator?.email || "vendor@agency.ae"}</span>
                        </span>
                        <span>&middot;</span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{vendor.phone || "+971 4 293 8888"}</span>
                        </span>
                        <span>&middot;</span>
                        <span>Coordinator: <strong className="text-foreground">{coordinator?.name || "Unassigned"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Placements & Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 min-w-[150px] space-y-0.5 text-center sm:text-left">
                      <div className="text-[11px] text-muted-foreground">Active Placements</div>
                      <div className="text-base font-bold text-foreground">{activePlacements} active</div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 min-w-[150px] space-y-0.5 text-center sm:text-left">
                      <div className="text-[11px] text-muted-foreground">In Onboarding</div>
                      <div className="text-base font-bold text-blue-600">{vendorOnboarding.length} candidates</div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button asChild variant="outline" size="sm" className="text-xs h-9 gap-1.5 cursor-pointer">
                        <Link href="/app/workforce">
                          <span>View Placements</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compliance Badges */}
                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="size-3.5" />
                      <span>Commercial Trade License Valid</span>
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <BadgeCheck className="size-3.5" />
                      <span>TRN Verified (UAE FTA)</span>
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                      <TrendingUp className="size-3.5" />
                      <span>Standard Rate Card Active</span>
                    </span>
                  </div>

                  <span className="text-[11px]">
                    Internal Vendor ID: {vendor.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
