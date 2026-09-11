"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Users,
  Building2,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listVendorRequisitions } from "@/src/lib/demo-data";
import { VendorRequisition } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorRequisitionsWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type FilterTab = "ALL" | "OPEN" | "CLOSED";

export function VendorRequisitionsWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorRequisitionsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<FilterTab>("ALL");

  const allRequisitions = React.useMemo(
    () => listVendorRequisitions(vendorId),
    [vendorId]
  );

  const filteredRequisitions = React.useMemo(() => {
    return allRequisitions.filter((req) => {
      // Tab filter
      if (activeTab === "OPEN" && !req.submissionWindow.isOpen) return false;
      if (activeTab === "CLOSED" && req.submissionWindow.isOpen) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.positionTitle.toLowerCase().includes(q);
        const matchesId = req.id.toLowerCase().includes(q);
        const matchesDept = req.departmentName.toLowerCase().includes(q);
        const matchesSkills = req.requiredSkills.some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesId && !matchesDept && !matchesSkills) {
          return false;
        }
      }
      return true;
    });
  }, [allRequisitions, activeTab, searchQuery]);

  const openCount = allRequisitions.filter((r) => r.submissionWindow.isOpen).length;
  const closedCount = allRequisitions.length - openCount;

  const getWindowBadge = (window: VendorRequisition["submissionWindow"]) => {
    if (!window.isOpen) {
      return {
        label: "Closed",
        severityClass:
          "bg-muted/70 text-muted-foreground border-border/60",
        icon: Lock,
      };
    }
    if (window.daysRemaining <= 1) {
      return {
        label: `${window.daysRemaining}d left · Urgent`,
        severityClass:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold animate-pulse",
        icon: Clock,
      };
    }
    if (window.daysRemaining <= 2) {
      return {
        label: `${window.daysRemaining} of 5 working days left`,
        severityClass:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium",
        icon: Clock,
      };
    }
    return {
      label: `${window.daysRemaining} of 5 working days left`,
      severityClass:
        "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 font-medium",
      icon: Clock,
    };
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
              <span className="text-foreground font-semibold">Requirements</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Open Requirements
              </h1>
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2.5 py-0.5 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20"
              >
                {openCount} Active Windows
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct talent sourcing invitations for Falcon Tech Resourcing · Strictly isolated vendor view
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            >
              <Link href="/vendor/submissions">
                <Sparkles className="size-3.5" />
                Submit Candidate
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* 2. Controls Row: Search + Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, code, department, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/50 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "ALL"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({allRequisitions.length})
            </button>
            <button
              onClick={() => setActiveTab("OPEN")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "OPEN"
                  ? "bg-background text-foreground shadow-2xs font-semibold text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Open Windows ({openCount})
            </button>
            <button
              onClick={() => setActiveTab("CLOSED")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                activeTab === "CLOSED"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Closed ({closedCount})
            </button>
          </div>
        </div>

        {/* 3. Requisition Cards Grid / List */}
        {filteredRequisitions.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-muted/10 border border-border/50 rounded-xl">
            <Briefcase className="size-10 text-muted-foreground/60 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">
              No matching requirements found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query or switching the filter tabs above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequisitions.map((req) => {
              const windowBadge = getWindowBadge(req.submissionWindow);
              const WindowIcon = windowBadge.icon;
              const isClosed = !req.submissionWindow.isOpen;

              return (
                <Card
                  key={req.id}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden select-none group",
                    isClosed
                      ? "border-border/50 bg-muted/15 opacity-85"
                      : "border-border/70 dark:border-white/[0.08] bg-card hover:border-teal-500/40 hover:shadow-xs"
                  )}
                >
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Requisition Metadata & Details */}
                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted/80 text-foreground border border-border/50">
                          {req.id}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Building2 className="size-3 text-muted-foreground" />
                          {req.departmentName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium">
                          {req.positions.required} Resource{req.positions.required > 1 ? "s" : ""} Needed
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono">
                          Grade {req.salaryGrade}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          <Link href={`/vendor/requisitions/${req.id}`}>
                            {req.positionTitle}
                          </Link>
                        </h2>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {req.justification}
                        </p>
                      </div>

                      {/* Required Skills Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {req.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/40 text-foreground/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Info strip */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                        <span>Work Location: <strong className="text-foreground font-medium">{req.workLocation}</strong></span>
                        <span>·</span>
                        <span>Duration: <strong className="text-foreground font-medium">{req.engagementMonths} Months</strong></span>
                        <span>·</span>
                        <span>Expected Start: <strong className="text-foreground font-medium">{req.expectedStartDate}</strong></span>
                      </div>
                    </div>

                    {/* Right: Sourcing Window Status & Vendor Submission Progress */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border/50 lg:pl-6 shrink-0 lg:w-72">
                      <div className="space-y-1.5 w-full text-left lg:text-right">
                        {/* Submission Window Severity Badge */}
                        <div className="flex items-center lg:justify-end gap-1.5">
                          <span
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5",
                              windowBadge.severityClass
                            )}
                          >
                            <WindowIcon className="size-3.5 shrink-0" />
                            {windowBadge.label}
                          </span>
                        </div>

                        {/* Closed Reason or Deadline */}
                        {isClosed ? (
                          <p className="text-[11px] text-muted-foreground italic lg:text-right">
                            {req.submissionWindow.closedReason || "Submission window closed."}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between lg:justify-end gap-2 text-xs">
                              <span className="text-muted-foreground">Falcon Tech Submissions:</span>
                              <span className="font-semibold text-foreground tabular-nums">
                                {req.mySubmissionsCount} of {req.submissionWindow.maxBatchSize} CVs
                              </span>
                            </div>
                            {/* Visual batch limit progress */}
                            <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  req.mySubmissionsCount >= 10
                                    ? "bg-rose-500"
                                    : req.mySubmissionsCount > 0
                                    ? "bg-teal-500"
                                    : "bg-transparent"
                                )}
                                style={{
                                  width: `${Math.min(
                                    (req.mySubmissionsCount / req.submissionWindow.maxBatchSize) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground/80 lg:text-right font-mono">
                              RFP 10-CV batch ceiling enforced
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto lg:w-full lg:justify-end">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-medium flex-1 sm:flex-none lg:flex-1"
                        >
                          <Link href={`/vendor/requisitions/${req.id}`}>
                            View Details
                          </Link>
                        </Button>

                        {isClosed ? (
                          <Button
                            size="sm"
                            disabled
                            variant="secondary"
                            className="h-8 px-3 text-xs font-medium cursor-not-allowed flex-1 sm:flex-none lg:flex-1"
                          >
                            Window Closed
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs gap-1 flex-1 sm:flex-none lg:flex-1"
                          >
                            <Link href={`/vendor/submissions?requisitionId=${req.id}`}>
                              Submit CV
                              <ArrowRight className="size-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
