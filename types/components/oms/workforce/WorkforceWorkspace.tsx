"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Building2,
  ShieldAlert,
  UserX,
  UserCheck,
  RefreshCw,
  FileText,
  DollarSign,
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
import { listWorkforceMembers, getRequisition } from "@/src/lib/demo-data";
import { WorkforceMember, WorkforceStatus } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/money";

export function WorkforceWorkspace() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [deptFilter, setDeptFilter] = React.useState<string>("ALL");

  const allMembers = React.useMemo(() => listWorkforceMembers(), []);

  // Filtered members
  const filteredMembers = React.useMemo(() => {
    return allMembers.filter((m) => {
      // Status filter
      if (statusFilter !== "ALL" && m.status !== statusFilter) {
        return false;
      }
      // Department filter
      if (deptFilter !== "ALL" && m.departmentId !== deptFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesTitle = m.positionTitle.toLowerCase().includes(q);
        const matchesReq = m.requisitionId.toLowerCase().includes(q);
        const matchesCandidate = m.candidateRef.toLowerCase().includes(q);
        const matchesDept = m.departmentName.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesReq && !matchesCandidate && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }, [allMembers, statusFilter, deptFilter, searchQuery]);

  // Derived KPI Metrics
  const stats = React.useMemo(() => {
    const total = allMembers.length;
    const activeNormal = allMembers.filter((m) => m.status === "ACTIVE").length;
    const endingSoon = allMembers.filter((m) => m.status === "ENDING_SOON").length;
    const terminated = allMembers.filter((m) => m.status === "TERMINATED").length;
    const totalSpendFils = allMembers
      .filter((m) => m.status !== "TERMINATED")
      .reduce((sum, m) => sum + (m.annualCost || 0), 0);

    return { total, activeNormal, endingSoon, terminated, totalSpendFils };
  }, [allMembers]);

  const departments = React.useMemo(() => {
    const map = new Map<string, string>();
    allMembers.forEach((m) => {
      map.set(m.departmentId, m.departmentName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allMembers]);

  return (
    <div className="flex flex-col min-h-full pb-16 bg-background">
      {/* Page Bar Breadcrumbs */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Workforce & Operations", href: "/app/workforce" },
          { label: "Active Roster", isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Users2 className="size-6 text-primary" />
              <span>Workforce Operations & Deployment</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active outsourced personnel, contract runway watches, and replacement requisition tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <Link href="/app/workforce/onboarding">
                <Clock className="size-3.5 text-primary" />
                <span>Onboarding Tracker</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <Link href="/app/requests">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>All Requisitions</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* ── KPI Metrics Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Roster
            </span>
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Active (Normal Runway)
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.activeNormal}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-300 tracking-wider flex items-center gap-1">
              <AlertTriangle className="size-3 text-amber-600" />
              Ending Soon (&le; 30d)
            </span>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {stats.endingSoon}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Terminated / Replaced
            </span>
            <div className="text-xl font-bold text-muted-foreground">
              {stats.terminated}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Annual Active Run-Rate
            </span>
            <div className="text-xl font-bold text-foreground">
              AED {(stats.totalSpendFils / 100).toLocaleString()}
            </div>
          </div>
        </div>

        {/* ── Filter Toolbar ── */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor name, role, requisition..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Department Filter */}
            <div className="w-[200px]">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: "ALL", label: "All" },
                { id: "ACTIVE", label: "Active" },
                { id: "ENDING_SOON", label: "Ending Soon (30d)" },
                { id: "TERMINATED", label: "Terminated" },
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

        {/* ── Workforce Members Roster Cards ── */}
        <div className="space-y-4">
          {filteredMembers.map((member) => {
            const isEndingSoon = member.status === "ENDING_SOON";
            const isTerminated = member.status === "TERMINATED";
            const isActive = member.status === "ACTIVE";

            return (
              <div
                key={member.id}
                className={cn(
                  "p-5 rounded-xl border bg-card shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5",
                  isEndingSoon
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                    : isTerminated
                    ? "border-border/60 bg-muted/20 opacity-85 hover:opacity-100"
                    : "border-border/70 hover:border-border"
                )}
              >
                {/* Left: Contractor & Role Info */}
                <div className="flex items-start gap-4 min-w-[280px]">
                  <div
                    className={cn(
                      "size-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border",
                      isEndingSoon
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        : isTerminated
                        ? "bg-muted text-muted-foreground border-border"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    )}
                  >
                    {member.candidateRef}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">
                        {member.fullName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-foreground">
                        {member.requisitionId}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-foreground flex items-center gap-2">
                      <span>{member.positionTitle}</span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className="text-muted-foreground">{member.departmentName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span>Joined: {member.joinedDate}</span>
                      </span>
                      <span>&middot;</span>
                      <span>
                        Contract End: <strong className="text-foreground">{member.contractEndDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Status & Runway Alert */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  {/* Status Badge */}
                  <div>
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Active · Normal ({member.daysRemaining}d remaining)</span>
                      </span>
                    )}

                    {isEndingSoon && (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                          <AlertTriangle className="size-3.5 text-amber-600 animate-pulse" />
                          <span>Ending in {member.daysRemaining} days · Action required</span>
                        </span>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 pl-1">
                          Within 30-day runway window. Extension or replacement needed.
                        </p>
                      </div>
                    )}

                    {isTerminated && (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          <XCircle className="size-3.5 text-rose-600" />
                          <span>Terminated on {member.terminationDate}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Financial Rate */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-0.5 min-w-[170px]">
                    <div className="text-muted-foreground text-[11px]">Monthly / Annual Rate</div>
                    <div className="font-semibold text-foreground">
                      AED {((member.monthlyRate || 0) / 100).toLocaleString()}{" "}
                      <span className="text-muted-foreground font-normal text-[11px]">
                        / AED {((member.annualCost || 0) / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Replacement Links (TASK 3) */}
                <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                  {/* Link to original request */}
                  <Button asChild variant="ghost" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer">
                    <Link href={`/app/requests/${member.requisitionId}`}>
                      <span>View Request</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </Button>

                  {/* Terminated Case (0074): Mandatory link to replacement requisition 0074-R */}
                  {isTerminated && member.replacementRequisitionId && (
                    <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer bg-primary text-primary-foreground">
                      <Link href={`/app/requests/${member.replacementRequisitionId}`}>
                        <span>Replacement ({member.replacementRequisitionId})</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  )}

                  {/* Ending Soon Case (0081): Extension / Replacement Action */}
                  {isEndingSoon && (
                    <Button asChild variant="default" size="sm" className="text-xs h-8.5 gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white">
                      <Link href={`/app/requests/${member.requisitionId}`}>
                        <span>Review Extension</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
