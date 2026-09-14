"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck2,
  Users,
  MapPin,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listVendorOnboardingCases } from "@/src/lib/demo-data";
import { OnboardingCase } from "@/src/lib/demo-data/entities";
import { computeDocumentHealth } from "@/src/types/vendor-documents";
import { cn } from "@/lib/utils";

interface VendorOnboardingIndexWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type ResidentFilter = "ALL" | "ONSHORE" | "OFFSHORE";

export function VendorOnboardingIndexWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorOnboardingIndexWorkspaceProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [residentFilter, setResidentFilter] = React.useState<ResidentFilter>("ALL");

  // Load cases scoped strictly to calling vendor
  const cases = React.useMemo(() => listVendorOnboardingCases(vendorId), [vendorId]);

  // Metric counts
  const onshoreCount = React.useMemo(
    () => cases.filter((c) => c.residentStatus === "ONSHORE").length,
    [cases]
  );
  const offshoreCount = React.useMemo(
    () => cases.filter((c) => c.residentStatus === "OFFSHORE").length,
    [cases]
  );
  const pendingSignatureCount = React.useMemo(
    () => cases.filter((c) => c.signature.envelopeStatus !== "SIGNED").length,
    [cases]
  );

  // Filtering
  const filteredCases = React.useMemo(() => {
    return cases.filter((onb) => {
      if (residentFilter !== "ALL" && onb.residentStatus !== residentFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = onb.candidate.fullName.toLowerCase().includes(q);
        const matchesRef = onb.candidateRef.toLowerCase().includes(q);
        const matchesPosition = onb.positionTitle.toLowerCase().includes(q);
        const matchesReq = onb.requisitionId.toLowerCase().includes(q);
        const matchesId = onb.id.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesPosition && !matchesReq && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [cases, residentFilter, searchQuery]);

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Candidate Onboarding
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              Active Cases
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Candidate Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Track document packages, background compliance verification, and e-signatures for
            candidates joining DIEZ departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/vendor/documents">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-border/70 hover:bg-muted/40"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Vendor Compliance Repository
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Active Cases</span>
            <p className="text-2xl font-bold text-foreground">{cases.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Users className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">UAE Onshore</span>
            <p className="text-2xl font-bold text-foreground">{onshoreCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <MapPin className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">International Offshore</span>
            <p className="text-2xl font-bold text-foreground">{offshoreCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <Building2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Awaiting E-Signature
            </span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingSignatureCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/60 w-fit">
          <button
            onClick={() => setResidentFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              residentFilter === "ALL"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All Cases</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
              {cases.length}
            </span>
          </button>
          <button
            onClick={() => setResidentFilter("ONSHORE")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              residentFilter === "ONSHORE"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Onshore (UAE)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
              {onshoreCount}
            </span>
          </button>
          <button
            onClick={() => setResidentFilter("OFFSHORE")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              residentFilter === "OFFSHORE"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Offshore</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
              {offshoreCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, ref, role, req..."
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Cases Table / Rows */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <Card className="p-8 rounded-xl border border-dashed text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No onboarding cases found</p>
            <p className="text-xs text-muted-foreground">
              No active onboarding workflows matched your search filters.
            </p>
          </Card>
        ) : (
          filteredCases.map((onb) => {
            // Derived health directly from the SAME function used by the detail page!
            const health = computeDocumentHealth(onb.documents as any, onb.signature as any);
            const completionRatio = `${health.uploaded} of ${health.required}`;
            const percent = Math.round((health.uploaded / health.required) * 100);

            const isSigned = onb.signature.envelopeStatus === "SIGNED";
            const isOnshore = onb.residentStatus === "ONSHORE";

            return (
              <Card
                key={onb.id}
                className="p-5 sm:p-6 rounded-xl border border-border/70 dark:border-white/[0.08] hover:border-teal-500/40 transition-all duration-200 bg-card space-y-4"
              >
                {/* Top Row: Case ID, Resident Badge, Req Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-muted text-foreground border border-border/60">
                      {onb.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Ref: <strong className="text-foreground">{onb.candidateRef}</strong>
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5",
                        isOnshore
                          ? "border-teal-500/30 text-teal-700 dark:text-teal-300 bg-teal-500/10"
                          : "border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-500/10"
                      )}
                    >
                      {isOnshore ? "UAE Onshore" : "Offshore International"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Requisition:</span>
                    <span className="font-semibold text-foreground">
                      {onb.requisitionId}
                    </span>
                  </div>
                </div>

                {/* Middle Grid: Candidate, Position, Joining Date, Document Completion, Signature */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Candidate info (col 4) */}
                  <div className="md:col-span-4 space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      {onb.candidate.fullName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {onb.positionTitle} · {onb.candidate.nationality}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {onb.candidate.email}
                    </p>
                  </div>

                  {/* Joining Date (col 2) */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joining Date
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {onb.candidate.expectedJoining}
                    </p>
                    <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground">
                      {onb.deadline.daysRemaining} days left
                    </span>
                  </div>

                  {/* Document Completion: "3 of 4" computed from health (col 3) */}
                  <div className="md:col-span-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Document Completion
                      </span>
                      <span className="font-bold text-foreground">
                        {completionRatio}
                      </span>
                    </div>

                    {/* Progress Rail */}
                    <div className="w-full bg-muted/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          percent === 100 ? "bg-emerald-500" : "bg-teal-500"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{percent}% verified</span>
                      {health.expiringSoon > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {health.expiringSoon} expiring soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Signature Status (col 3) */}
                  <div className="md:col-span-3 space-y-1.5 sm:text-right">
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      NDA E-Signature
                    </span>
                    {isSigned ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed & Executed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Sent (Pending Signature)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Malware scan passed · Single source of truth reconciliation</span>
                  </div>

                  <Link href={`/vendor/onboarding/${onb.id}/documents`}>
                    <Button
                      size="sm"
                      className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Manage Documents & Signatures
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
