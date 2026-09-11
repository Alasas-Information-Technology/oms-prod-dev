"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  UserPlus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  Building2,
  FileText,
  BadgeAlert,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Amount } from "@/lib/money";
import { listVendorSubmissions } from "@/src/lib/demo-data";
import {
  VendorSubmissionItem,
  VendorSubmissionStatus,
} from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorSubmissionHistoryWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type FilterTab = "ALL" | "ACTION_REQUIRED" | "IN_REVIEW" | "QUALIFIED" | "NOT_SELECTED";

export function VendorSubmissionHistoryWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorSubmissionHistoryWorkspaceProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<FilterTab>("ALL");

  // Load submissions scoped strictly to calling vendor
  const submissions = React.useMemo(
    () => listVendorSubmissions(vendorId),
    [vendorId]
  );

  // Counts for KPIs and filter tabs
  const actionRequiredCount = React.useMemo(
    () => submissions.filter((s) => s.vendorStatus === "INTERVIEW_PROPOSED").length,
    [submissions]
  );
  const inReviewCount = React.useMemo(
    () =>
      submissions.filter(
        (s) =>
          s.vendorStatus === "SUBMITTED" ||
          s.vendorStatus === "UNDER_REVIEW" ||
          s.vendorStatus === "SHORTLISTED"
      ).length,
    [submissions]
  );
  const qualifiedCount = React.useMemo(
    () =>
      submissions.filter(
        (s) => s.vendorStatus === "QUALIFIED" || s.vendorStatus === "INTERVIEW_CONFIRMED"
      ).length,
    [submissions]
  );
  const notSelectedCount = React.useMemo(
    () => submissions.filter((s) => s.vendorStatus === "NOT_SELECTED").length,
    [submissions]
  );

  // Filter and search
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((item) => {
      // Tab filter
      if (activeTab === "ACTION_REQUIRED" && item.vendorStatus !== "INTERVIEW_PROPOSED") {
        return false;
      }
      if (
        activeTab === "IN_REVIEW" &&
        item.vendorStatus !== "SUBMITTED" &&
        item.vendorStatus !== "UNDER_REVIEW" &&
        item.vendorStatus !== "SHORTLISTED"
      ) {
        return false;
      }
      if (
        activeTab === "QUALIFIED" &&
        item.vendorStatus !== "QUALIFIED" &&
        item.vendorStatus !== "INTERVIEW_CONFIRMED"
      ) {
        return false;
      }
      if (activeTab === "NOT_SELECTED" && item.vendorStatus !== "NOT_SELECTED") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.candidateName.toLowerCase().includes(q);
        const matchesRef = item.candidateRef.toLowerCase().includes(q);
        const matchesReq = item.requisitionId.toLowerCase().includes(q);
        const matchesTitle = item.positionTitle.toLowerCase().includes(q);
        const matchesDept = item.departmentName.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesReq && !matchesTitle && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, activeTab, searchQuery]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dubai",
      }).format(d);
    } catch {
      return iso;
    }
  };

  /**
   * Status Vocabulary per docs/VENDOR-PORTAL-UI.md 4.5:
   * Submitted | Under review | Shortlisted | Interview proposed | Interview confirmed | Qualified | Not selected
   */
  const getStatusBadge = (item: VendorSubmissionItem) => {
    switch (item.vendorStatus) {
      case "INTERVIEW_PROPOSED":
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Interview proposed
            </span>
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Action needed
            </span>
          </div>
        );
      case "INTERVIEW_CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CalendarCheck className="size-3 shrink-0" />
            Interview confirmed
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            Shortlisted
          </span>
        );
      case "QUALIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="size-3 shrink-0" />
            Qualified
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            Submitted
          </span>
        );
      case "NOT_SELECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/80">
            Not selected
          </span>
        );
      case "UNDER_REVIEW":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            Under review
          </span>
        );
    }
  };

  return (
    <div className={cn("w-full flex flex-col bg-background pb-16 space-y-6", className)}>
      {/* 1. Header Bar */}
      <div className="w-full bg-background border-b border-border/70 px-4 sm:px-6 py-4 space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Link href="/vendor" className="hover:text-foreground transition-colors">
                Vendor Portal
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="hover:text-foreground transition-colors">Candidates</span>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">History</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Users className="size-6 text-teal-600 dark:text-teal-400" />
                Submitted Candidates
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border/80">
                {submissions.length} Total Submissions
              </Badge>
              {actionRequiredCount > 0 && (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold text-xs animate-pulse flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {actionRequiredCount} Interview Response Needed
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Track evaluation stages, respond to interview time proposals, and monitor
              onboarding status for all candidates submitted by your organization.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm text-xs sm:text-sm gap-2">
              <Link href="/vendor/submissions">
                <UserPlus className="size-4" />
                Submit a Candidate
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* 2. Top Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "p-3.5 sm:p-4 rounded-xl border bg-card hover:bg-muted/40 transition-all cursor-pointer shadow-2xs",
              activeTab === "ALL" && "ring-2 ring-primary border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium">All Submissions</span>
              <Users className="size-4 opacity-70" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {submissions.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Active & past candidates
            </div>
          </Card>

          <Card
            onClick={() => setActiveTab("ACTION_REQUIRED")}
            className={cn(
              "p-3.5 sm:p-4 rounded-xl border bg-card hover:bg-amber-500/5 transition-all cursor-pointer shadow-2xs",
              actionRequiredCount > 0
                ? "border-amber-400/80 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20"
                : "",
              activeTab === "ACTION_REQUIRED" &&
                "ring-2 ring-amber-500 border-amber-500/50 bg-amber-500/10"
            )}
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1.5">
              <span className="text-xs font-semibold flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                Interviews to Respond
              </span>
              <Clock className="size-4" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300 font-mono">
              {actionRequiredCount}
            </div>
            <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 font-medium mt-1">
              Time-sensitive queue
            </div>
          </Card>

          <Card
            onClick={() => setActiveTab("IN_REVIEW")}
            className={cn(
              "p-3.5 sm:p-4 rounded-xl border bg-card hover:bg-muted/40 transition-all cursor-pointer shadow-2xs",
              activeTab === "IN_REVIEW" && "ring-2 ring-primary border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium">Under Review</span>
              <FileText className="size-4 opacity-70" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {inReviewCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              DIEZ evaluation in progress
            </div>
          </Card>

          <Card
            onClick={() => setActiveTab("QUALIFIED")}
            className={cn(
              "p-3.5 sm:p-4 rounded-xl border bg-card hover:bg-muted/40 transition-all cursor-pointer shadow-2xs",
              activeTab === "QUALIFIED" && "ring-2 ring-primary border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium">Qualified / Hired</span>
              <CheckCircle2 className="size-4 opacity-70 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {qualifiedCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Ready for / in onboarding
            </div>
          </Card>
        </div>

        {/* 3. Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Button
              variant={activeTab === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "h-8 text-xs font-medium rounded-lg",
                activeTab === "ALL" && "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              All Submissions ({submissions.length})
            </Button>
            <Button
              variant={activeTab === "ACTION_REQUIRED" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("ACTION_REQUIRED")}
              className={cn(
                "h-8 text-xs font-medium rounded-lg",
                activeTab === "ACTION_REQUIRED"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : actionRequiredCount > 0
                  ? "border-amber-400/80 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                  : ""
              )}
            >
              Action Needed ({actionRequiredCount})
            </Button>
            <Button
              variant={activeTab === "IN_REVIEW" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("IN_REVIEW")}
              className={cn(
                "h-8 text-xs font-medium rounded-lg",
                activeTab === "IN_REVIEW" && "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              In Review ({inReviewCount})
            </Button>
            <Button
              variant={activeTab === "QUALIFIED" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("QUALIFIED")}
              className={cn(
                "h-8 text-xs font-medium rounded-lg",
                activeTab === "QUALIFIED" && "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              Qualified ({qualifiedCount})
            </Button>
            <Button
              variant={activeTab === "NOT_SELECTED" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("NOT_SELECTED")}
              className={cn(
                "h-8 text-xs font-medium rounded-lg",
                activeTab === "NOT_SELECTED" && "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              Not Selected ({notSelectedCount})
            </Button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate, role, req..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-card"
            />
          </div>
        </div>

        {/* 4. Submissions Table per 4.5 */}
        <Card className="rounded-xl border border-border/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 min-w-[200px]">Candidate</th>
                  <th className="py-3 px-4 min-w-[220px]">Target Requirement</th>
                  <th className="py-3 px-4 min-w-[170px]">Status</th>
                  <th className="py-3 px-4 min-w-[130px] text-right">Quoted Rate</th>
                  <th className="py-3 px-4 min-w-[100px]">Lead Time</th>
                  <th className="py-3 px-4 min-w-[110px]">Submitted</th>
                  <th className="py-3 px-4 min-w-[140px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium">No candidates match this filter.</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search criteria or filter tabs.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((item) => {
                    const isProposed = item.vendorStatus === "INTERVIEW_PROPOSED";

                    return (
                      <tr
                        key={item.candidateRef}
                        className={cn(
                          "group hover:bg-muted/30 transition-colors",
                          isProposed &&
                            "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/40 dark:hover:bg-amber-950/30 font-medium"
                        )}
                      >
                        {/* 1. Candidate Reference & Name */}
                        <td className="py-3 px-4 align-top">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{item.candidateName}</span>
                              {isProposed && (
                                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                              <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60">
                                {item.candidateRef}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Target Requirement */}
                        <td className="py-3 px-4 align-top">
                          <div className="space-y-0.5">
                            <Link
                              href={`/vendor/requisitions/${item.requisitionId}`}
                              className="font-medium text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1"
                            >
                              {item.positionTitle}
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <span className="font-mono text-xs">{item.requisitionId}</span>
                              <span>·</span>
                              <span className="line-clamp-1">{item.departmentName}</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Status (Exact Vocabulary) */}
                        <td className="py-3 px-4 align-top">
                          <div className="space-y-1">
                            {getStatusBadge(item)}
                            {item.vendorStatus === "INTERVIEW_CONFIRMED" &&
                              item.confirmedInterviewSlot && (
                                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                  {formatDate(item.confirmedInterviewSlot.start)}
                                </div>
                              )}
                          </div>
                        </td>

                        {/* 4. Quoted Rate */}
                        <td className="py-3 px-4 align-top text-right">
                          <div className="font-semibold font-mono text-foreground text-xs">
                            <Amount value={item.quotedCost} currency="AED" />
                          </div>
                          <div className="text-[10px] text-muted-foreground">Annual base</div>
                        </td>

                        {/* 5. Lead Time */}
                        <td className="py-3 px-4 align-top">
                          <span className="text-foreground font-medium">
                            {item.leadTimeDays === 0 ? "Immediate" : `${item.leadTimeDays} days`}
                          </span>
                        </td>

                        {/* 6. Submitted Date */}
                        <td className="py-3 px-4 align-top text-muted-foreground font-mono text-[11px]">
                          {formatDate(item.submittedAt)}
                        </td>

                        {/* 7. Action */}
                        <td className="py-3 px-4 align-top text-right">
                          {isProposed ? (
                            <Button
                              asChild
                              size="sm"
                              className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-2xs gap-1.5"
                            >
                              <Link href={`/vendor/submissions/${item.candidateRef}/interview`}>
                                Respond to Slots
                                <ArrowRight className="size-3" />
                              </Link>
                            </Button>
                          ) : item.vendorStatus === "INTERVIEW_CONFIRMED" ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1"
                            >
                              <Link href={`/vendor/submissions/${item.candidateRef}/interview`}>
                                <CalendarCheck className="size-3" />
                                View Schedule
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            >
                              <Link href={`/vendor/requisitions/${item.requisitionId}`}>
                                View Requirement
                                <ArrowUpRight className="size-3" />
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer / compliance note */}
          <div className="p-3 bg-muted/30 border-t border-border/60 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-teal-500" />
              Evaluation progress is updated by DIEZ in real-time. Candidate submissions are strictly
              private to your agency.
            </span>
            <span className="font-mono text-[10px]">
              Showing {filteredSubmissions.length} of {submissions.length} candidates
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
