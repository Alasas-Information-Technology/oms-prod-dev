"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Calendar,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Building2,
  Globe,
  DollarSign,
  UserCheck,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import {
  listCandidates,
  listRequisitions,
  getRequisition,
  getAmendment,
  getOnboarding,
} from "@/src/lib/demo-data";
import { Candidate, Requisition } from "@/src/lib/demo-data/entities";

export function CandidatePipelineWorkspace() {
  const searchParams = useSearchParams();
  const initialReqId = searchParams.get("requisitionId") || "all";

  const [selectedReqId, setSelectedReqId] = React.useState<string>(initialReqId);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [groupByReq, setGroupByReq] = React.useState<boolean>(true);

  // Load all candidates and requisitions from canonical demo-data
  const allCandidates = React.useMemo(() => listCandidates(), []);
  const allRequisitions = React.useMemo(() => listRequisitions(), []);

  // Requisitions with candidate activity or targeted empty states
  const trackedRequisitionIds = React.useMemo(
    () => [
      "OMS-2026-0148", // 2 candidates (C-014 evaluated over budget, C-021 awaiting interview)
      "OMS-2026-0119", // 1 candidate (C-030 onboarding onshore)
      "OMS-2026-0102", // 1 candidate (C-031 onboarding offshore)
      "OMS-2026-0161", // 1 candidate (C-040 evaluated & rejected)
      "OMS-2026-0141", // 0 candidates (Procurement sourcing — empty state)
      "OMS-2026-0143", // 0 candidates (Awaiting clarification — empty state)
    ],
    []
  );

  // Filter candidates
  const filteredCandidates = React.useMemo(() => {
    return allCandidates.filter((cand) => {
      // Requisition filter
      if (selectedReqId !== "all" && cand.requisitionId.toUpperCase() !== selectedReqId.toUpperCase()) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "interview" && cand.status !== "SHORTLISTED" && cand.status !== "INTERVIEW_PENDING" && cand.status !== "INTERVIEW_SCHEDULED") {
          return false;
        }
        if (statusFilter === "evaluated" && cand.status !== "EVALUATED" && cand.status !== "QUALIFIED" && cand.status !== "QUALIFIED_PENDING_BUDGET") {
          return false;
        }
        if (statusFilter === "onboarding" && cand.status !== "ONBOARDING") {
          return false;
        }
        if (statusFilter === "rejected" && cand.status !== "REJECTED") {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = cand.candidateRef.toLowerCase().includes(q);
        const matchesName = cand.fullName.toLowerCase().includes(q);
        const matchesReq = cand.requisitionId.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesReq) {
          return false;
        }
      }

      return true;
    });
  }, [allCandidates, selectedReqId, statusFilter, searchQuery]);

  // Summary Metrics
  const stats = React.useMemo(() => {
    const total = allCandidates.length;
    const interviewCount = allCandidates.filter((c) =>
      ["SHORTLISTED", "INTERVIEW_PENDING", "INTERVIEW_SCHEDULED"].includes(c.status)
    ).length;
    const evaluatedCount = allCandidates.filter((c) =>
      ["EVALUATED", "QUALIFIED", "QUALIFIED_PENDING_BUDGET"].includes(c.status)
    ).length;
    const onboardingCount = allCandidates.filter((c) => c.status === "ONBOARDING").length;
    const rejectedCount = allCandidates.filter((c) => c.status === "REJECTED").length;

    return { total, interviewCount, evaluatedCount, onboardingCount, rejectedCount };
  }, [allCandidates]);

  // Group filtered candidates by requisition
  const requisitionsToRender = React.useMemo(() => {
    if (selectedReqId !== "all") {
      const req = getRequisition(selectedReqId);
      return req ? [req] : [];
    }
    return trackedRequisitionIds
      .map((id) => getRequisition(id))
      .filter((r): r is Requisition => r !== null);
  }, [selectedReqId, trackedRequisitionIds]);

  return (
    <div className="flex flex-col min-h-full pb-16 bg-background">
      {/* Top Header Breadcrumb */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Talent & Candidates", href: "/app/candidates" },
          { label: "Pipeline & Workspaces", isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Users className="size-6 text-primary" />
              <span>Candidate Pipeline & Workspaces</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Unified cross-requisition pipeline view for technical interview scheduling, candidate evaluations, and budget amendments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByReq(!groupByReq)}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Layers className="size-3.5 text-muted-foreground" />
              <span>{groupByReq ? "Flat List" : "Group by Requisition"}</span>
            </Button>
          </div>
        </div>

        {/* Metric KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Seed Candidates
            </span>
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Interview Planning
            </span>
            <div className="text-xl font-bold text-blue-600">{stats.interviewCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Evaluated / Amendment
            </span>
            <div className="text-xl font-bold text-indigo-600">{stats.evaluatedCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Vendor Onboarding
            </span>
            <div className="text-xl font-bold text-emerald-600">{stats.onboardingCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Rejected
            </span>
            <div className="text-xl font-bold text-rose-600">{stats.rejectedCount}</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate ref, name, requisition..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Requisition Dropdown */}
            <div className="w-[260px]">
              <Select value={selectedReqId} onValueChange={setSelectedReqId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Requisitions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Requisitions ({allCandidates.length})</SelectItem>
                  {trackedRequisitionIds.map((id) => {
                    const req = getRequisition(id);
                    const count = allCandidates.filter((c) => c.requisitionId === id).length;
                    return (
                      <SelectItem key={id} value={id} className="text-xs">
                        {id} — {req?.positionTitle || "Requisition"} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "interview", label: "Interview" },
                { id: "evaluated", label: "Evaluated" },
                { id: "onboarding", label: "Onboarding" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {requisitionsToRender.map((req) => {
            const reqCandidates = filteredCandidates.filter((c) => c.requisitionId === req.id);
            const amd = getAmendment(req.id);
            const onb = getOnboarding(req.id);

            return (
              <div
                key={req.id}
                className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs transition-all"
              >
                {/* Requisition Section Header */}
                <div className="p-4 bg-muted/40 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted border border-border/60 text-foreground">
                      {req.id}
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                        <Link href={`/app/requests/${req.id}`}>{req.positionTitle}</Link>
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        {req.departmentName} &middot; Stage: <strong>{req.stageLabel}</strong> &middot; Budget: AED {(req.budgetAmount / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="text-xs h-8 gap-1">
                      <Link href={`/app/requests/${req.id}`}>
                        <span>View Request</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <Link href={`/app/candidates/interviews/plan/${req.id}`}>
                        <Calendar className="size-3.5 text-primary" />
                        <span>Interview Planning</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Candidate Rows or Empty State */}
                {reqCandidates.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {reqCandidates.map((cand) => {
                      const costDiff = (cand.expectedAnnualCost || 0) - (cand.approvedBudget || 0);
                      const isOverBudget = costDiff > 0;

                      return (
                        <div
                          key={cand.candidateRef}
                          className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                        >
                          {/* Candidate Bio & Ref */}
                          <div className="flex items-start gap-3.5 min-w-[240px]">
                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                              {cand.candidateRef}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {cand.fullName}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 px-1.5">
                                  {cand.priority}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  ({cand.anonymisedRef})
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Globe className="size-3 text-muted-foreground" />
                                  <span>{cand.residentStatus} &middot; {cand.timezone}</span>
                                </span>
                                <span>&middot;</span>
                                <span>{cand.experienceYears} yrs experience</span>
                                <span>&middot;</span>
                                <span>Notice: {cand.noticePeriod}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-0.5 min-w-[170px]">
                              <div className="text-muted-foreground text-[11px]">Annual Cost / Budget</div>
                              <div className="font-semibold text-foreground">
                                AED {((cand.expectedAnnualCost || 0) / 100).toLocaleString()}{" "}
                                <span className="text-muted-foreground font-normal text-[11px]">
                                  / AED {((cand.approvedBudget || 0) / 100).toLocaleString()}
                                </span>
                              </div>
                              {isOverBudget ? (
                                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                  +AED {(costDiff / 100).toLocaleString()} over budget
                                </div>
                              ) : (
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                  Within approved budget
                                </div>
                              )}
                            </div>

                            {/* Status Chip */}
                            <div className="min-w-[140px]">
                              {cand.status === "QUALIFIED_PENDING_BUDGET" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <AlertTriangle className="size-3.5 text-amber-600" />
                                  <span>Qualified (Over Budget)</span>
                                </span>
                              )}
                              {cand.status === "SHORTLISTED" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                  <Clock className="size-3.5 text-blue-600" />
                                  <span>Interview Pending</span>
                                </span>
                              )}
                              {cand.status === "ONBOARDING" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                                  <span>Onboarding Active</span>
                                </span>
                              )}
                              {cand.status === "REJECTED" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                  <XCircle className="size-3.5 text-rose-600" />
                                  <span>Rejected (CV Purged)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Navigation Action Buttons (Task 4) */}
                          <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                            {/* Candidate C-014: Over budget amendment path */}
                            {cand.candidateRef === "C-014" && (
                              <>
                                <Button asChild variant="outline" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                                  <Link href={`/app/candidates/interviews/evaluate/${req.id}/${cand.candidateRef}`}>
                                    <FileText className="size-3.5 text-indigo-600" />
                                    <span>View Evaluation</span>
                                  </Link>
                                </Button>
                                {amd && (
                                  <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Link href={`/app/requests/${req.id}/amendments/${amd.id}`}>
                                      <span>View Amendment</span>
                                      <ArrowRight className="size-3.5" />
                                    </Link>
                                  </Button>
                                )}
                              </>
                            )}

                            {/* Candidate C-021: Plan interview */}
                            {cand.candidateRef === "C-021" && (
                              <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                                <Link href={`/app/candidates/interviews/plan/${req.id}`}>
                                  <Calendar className="size-3.5" />
                                  <span>Plan Interview</span>
                                  <ArrowRight className="size-3.5" />
                                </Link>
                              </Button>
                            )}

                            {/* Candidates C-030 and C-031: Onboarding case */}
                            {(cand.candidateRef === "C-030" || cand.candidateRef === "C-031") && (
                              <>
                                <Button asChild variant="outline" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                                  <Link href={`/app/candidates/interviews/evaluate/${req.id}/${cand.candidateRef}`}>
                                    <FileText className="size-3.5 text-primary" />
                                    <span>View Evaluation</span>
                                  </Link>
                                </Button>
                                {onb && (
                                  <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Link href={`/vendor/onboarding/${onb.id}/documents`}>
                                      <Briefcase className="size-3.5" />
                                      <span>Onboarding Docs</span>
                                      <ArrowRight className="size-3.5" />
                                    </Link>
                                  </Button>
                                )}
                              </>
                            )}

                            {/* Candidate C-040: Rejected */}
                            {cand.candidateRef === "C-040" && (
                              <Button asChild variant="outline" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                                <Link href={`/app/candidates/interviews/evaluate/${req.id}/${cand.candidateRef}`}>
                                  <FileText className="size-3.5 text-rose-600" />
                                  <span>View Scorecard</span>
                                  <ArrowRight className="size-3.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state tests for 0141 and 0143 */
                  <div className="p-8 text-center bg-muted/10 flex flex-col items-center justify-center gap-2.5">
                    <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <Users className="size-5" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-xs font-semibold text-foreground">
                        {req.id === "OMS-2026-0141"
                          ? "Vendor Sourcing in Progress"
                          : req.id === "OMS-2026-0143"
                          ? "Awaiting Requisition Clarification"
                          : "No candidates in pipeline"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {req.id === "OMS-2026-0141"
                          ? "Salma Al Ketbi (Procurement) has opened requirements to accredited vendor agencies. No candidates submitted to date."
                          : req.id === "OMS-2026-0143"
                          ? "This requisition has an open clarification inquiry (clar-2026-0091). Candidate submissions will open after clarification."
                          : "No candidate submissions have been attached to this requisition yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
