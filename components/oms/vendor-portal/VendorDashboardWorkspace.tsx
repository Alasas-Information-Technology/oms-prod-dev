"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CalendarClock,
  UserCheck,
  ShieldAlert,
  FileCheck2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Building2,
  Sparkles,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Filter,
  FileText,
} from "lucide-react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getVendorDashboard,
  listVendorRequisitions,
  getVendorRateCards,
  getVendorComplianceDocuments,
} from "@/src/lib/demo-data";
import { VendorActionItem, VendorRequisition } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorDashboardWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type ActionFilterTab = "ALL" | "INTERVIEW" | "ONBOARDING" | "REQUISITION" | "COMPLIANCE";

export function VendorDashboardWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorDashboardWorkspaceProps) {
  // Query pure demo data functions (tied directly into shared demo-data module per Part 6)
  const dashboardData = React.useMemo(() => getVendorDashboard(vendorId), [vendorId]);
  const requisitions = React.useMemo(() => listVendorRequisitions(vendorId), [vendorId]);
  const rateCards = React.useMemo(() => getVendorRateCards(vendorId), [vendorId]);
  const complianceDocs = React.useMemo(() => getVendorComplianceDocuments(vendorId), [vendorId]);

  const [activeTab, setActiveTab] = React.useState<ActionFilterTab>("ALL");

  const { kpis, actionItems } = dashboardData;

  // Filter action items based on active tab
  const filteredActionItems = React.useMemo(() => {
    if (activeTab === "ALL") return actionItems;
    if (activeTab === "INTERVIEW") {
      return actionItems.filter((i) => i.type === "INTERVIEW_PROPOSAL");
    }
    if (activeTab === "ONBOARDING") {
      return actionItems.filter((i) => i.type === "ONBOARDING_DOCUMENT");
    }
    if (activeTab === "REQUISITION") {
      return actionItems.filter((i) => i.type === "SUBMISSION_WINDOW");
    }
    if (activeTab === "COMPLIANCE") {
      return actionItems.filter((i) => i.type === "COMPLIANCE_EXPIRY");
    }
    return actionItems;
  }, [actionItems, activeTab]);

  // Type visual configurations
  const getTypeBadge = (type: VendorActionItem["type"]) => {
    switch (type) {
      case "INTERVIEW_PROPOSAL":
        return {
          label: "Interview Slot",
          icon: CalendarClock,
          className:
            "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        };
      case "ONBOARDING_DOCUMENT":
        return {
          label: "Onboarding Docs",
          icon: FileCheck2,
          className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        };
      case "SUBMISSION_WINDOW":
        return {
          label: "Sourcing Window",
          icon: Briefcase,
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "COMPLIANCE_EXPIRY":
        return {
          label: "Compliance Renewal",
          icon: ShieldAlert,
          className:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
    }
  };

  const getUrgencyBadge = (urgency: VendorActionItem["urgency"], daysRemaining: number) => {
    if (urgency === "CRITICAL" || daysRemaining <= 2) {
      return {
        label: `${daysRemaining}d remaining`,
        className:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold",
      };
    }
    if (urgency === "HIGH" || daysRemaining <= 5) {
      return {
        label: `${daysRemaining}d remaining`,
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium",
      };
    }
    return {
      label: `${daysRemaining}d remaining`,
      className:
        "bg-muted/60 text-muted-foreground border-border/40 font-normal",
    };
  };

  return (
    <div className={cn("w-full flex flex-col bg-background pb-16 space-y-6", className)}>
      {/* 1. Vendor Context Header Bar */}
      <div className="w-full bg-background border-b border-border/70 px-4 sm:px-6 py-4 space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                href="/vendor"
                className="hover:text-foreground transition-colors"
              >
                Vendor Portal
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">Overview</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Falcon Tech Resourcing
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                Primary Talent Partner
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Supplier ID: #10842 · DIEZA Certified
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Signed in as <strong className="text-foreground">Layla Hassan</strong> (Managing Director) · Direct Procurement Channel
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <Link href="/vendor/requisitions">
                <Briefcase className="size-3.5" />
                Browse Requirements
              </Link>
            </Button>
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
        {/* 2. Five KPI Cards Strip per Part 4.1 (Reusing internal SimpleKpiCard) */}
        <section aria-label="Vendor Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* KPI 1: Open requirements */}
            <SimpleKpiCard
              title="Open requirements"
              value={kpis.openRequirements}
              description="Active sourcing windows"
              href="/vendor/requisitions"
              icon="lucide:briefcase"
              sparkline={[2, 3, 3, 2, 4, 3, 3]}
              zeroMeaning="NO_DATA"
              zeroLabel="No open requirements"
            />

            {/* KPI 2: Candidates awaiting review */}
            <SimpleKpiCard
              title="Candidates awaiting review"
              value={kpis.candidatesAwaitingReview}
              description="Under DIEZ screening"
              href="/vendor/submissions/history"
              icon="lucide:users"
              sparkline={[1, 2, 2, 3, 2, 2, 2]}
              zeroMeaning="GOOD"
              zeroLabel="All reviewed"
            />

            {/* KPI 3: Interviews to respond to */}
            <SimpleKpiCard
              title="Interviews to respond to"
              value={kpis.interviewsToRespond}
              description="Proposed slots pending reply"
              href="/vendor/submissions/C-021/interview"
              icon="lucide:calendar-clock"
              sparkline={[0, 1, 0, 0, 1, 1, 1]}
              zeroMeaning="GOOD"
              zeroLabel="No pending slots"
            />

            {/* KPI 4: Onboarding in progress */}
            <SimpleKpiCard
              title="Onboarding in progress"
              value={kpis.onboardingInProgress}
              description="Active compliance verification"
              href="/vendor/onboarding"
              icon="lucide:user-check"
              sparkline={[0, 1, 1, 1, 2, 2, 2]}
              zeroMeaning="NO_DATA"
              zeroLabel="No active cases"
            />

            {/* KPI 5: Documents expiring within 30 days */}
            <SimpleKpiCard
              title="Documents expiring in 30d"
              value={kpis.documentsExpiringSoon}
              description="Company compliance renewal"
              href="/vendor/documents"
              icon="lucide:file-warning"
              sparkline={[0, 0, 1, 1, 1, 1, 1]}
              zeroMeaning="GOOD"
              zeroLabel="All documents valid"
            />
          </div>
        </section>

        {/* 3. "Needs My Action" Action Table Scoped to Vendor */}
        <section aria-labelledby="needs-action-heading" className="space-y-3">
          <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card shadow-2xs overflow-hidden">
            {/* Header & Filter Row */}
            <div className="px-5 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      id="needs-action-heading"
                      className="text-sm font-semibold text-foreground tracking-tight"
                    >
                      Needs My Action
                    </h2>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-semibold px-2 py-0 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20"
                    >
                      {actionItems.length} pending
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Actionable queue items scoped to Falcon Tech Resourcing
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { key: "ALL", label: `All (${actionItems.length})` },
                    { key: "INTERVIEW", label: "Interviews" },
                    { key: "ONBOARDING", label: "Onboarding" },
                    { key: "REQUISITION", label: "Requirements" },
                    { key: "COMPLIANCE", label: "Compliance" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                      activeTab === tab.key
                        ? "bg-foreground text-background font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Items List / Table */}
            {filteredActionItems.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">
                  All caught up!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No active items currently require attention under this filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredActionItems.map((item) => {
                  const typeBadge = getTypeBadge(item.type);
                  const urgencyBadge = getUrgencyBadge(item.urgency, item.daysRemaining);
                  const TypeIcon = typeBadge.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      {/* Left: Type Icon + Reference + Title + Context */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                            typeBadge.className
                          )}
                        >
                          <TypeIcon className="size-4" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border",
                                typeBadge.className
                              )}
                            >
                              {typeBadge.label}
                            </span>
                            <span className="text-xs font-semibold text-foreground/80 px-1.5 py-0.5 rounded bg-muted/70 border border-border/50">
                              {item.subjectRef}
                            </span>
                            <span
                              className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
                                urgencyBadge.className
                              )}
                            >
                              <Clock className="size-3" />
                              {urgencyBadge.label}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-xs text-muted-foreground truncate">
                            {item.context}
                          </p>
                        </div>
                      </div>

                      {/* Right: SLA Due Date & Deep Link Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0">
                        <div className="text-right hidden lg:block">
                          <div className="text-xs font-medium text-foreground">
                            Due {new Date(item.dueAt).toLocaleDateString("en-AE", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            SLA Window
                          </div>
                        </div>

                        <Button
                          asChild
                          size="sm"
                          variant={item.urgency === "CRITICAL" ? "default" : "outline"}
                          className={cn(
                            "h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs",
                            item.urgency === "CRITICAL" && "bg-amber-600 hover:bg-amber-700 text-white"
                          )}
                        >
                          <Link href={item.href}>
                            {item.type === "INTERVIEW_PROPOSAL" && "Respond to Slots"}
                            {item.type === "ONBOARDING_DOCUMENT" && "Review & Sign"}
                            {item.type === "SUBMISSION_WINDOW" && "Submit Candidate"}
                            {item.type === "COMPLIANCE_EXPIRY" && "Renew Licence"}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        {/* 4. Two Lower Panels: Active Sourcing Windows + Contracts & Rates Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Sourcing Windows (Zero Budget Concealment Enforced) */}
          <section className="lg:col-span-7 space-y-3">
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card shadow-2xs overflow-hidden flex flex-col h-full">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="size-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">
                    Active Sourcing Windows
                  </h2>
                </div>
                <Link
                  href="/vendor/requisitions"
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  View All ({requisitions.length})
                  <ChevronRight className="size-3" />
                </Link>
              </div>

              <div className="divide-y divide-border/40 flex-1">
                {requisitions.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:px-5 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground/80 px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
                          {req.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {req.departmentName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          {req.positions.required} Resource{req.positions.required > 1 ? "s" : ""}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-foreground">
                        {req.positionTitle}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{req.workLocation}</span>
                        <span>·</span>
                        <span>{req.engagementMonths} Months</span>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {req.submissionWindow.daysRemaining} days left in window
                        </span>
                        <span>·</span>
                        <span className="text-teal-600 dark:text-teal-400">
                          {req.mySubmissionsCount} submitted by Falcon Tech
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs font-medium gap-1.5"
                      >
                        <Link href={`/vendor/submissions?requisitionId=${req.id}`}>
                          Submit CV
                          <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Right: Published Rates & Compliance Health */}
          <section className="lg:col-span-5 space-y-4">
            {/* Rate Cards Card */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <Coins className="size-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">
                    Published Rate Cards
                  </h2>
                </div>
                <Link
                  href="/vendor/rates"
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Manage Rates
                  <ChevronRight className="size-3" />
                </Link>
              </div>

              <div className="p-4 space-y-3">
                {rateCards.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {rc.name}
                      </span>
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
                        {rc.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Templates: DIEZA Premises · UAE Remote (WFH)
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30">
                      <span className="text-muted-foreground">
                        Grades: {rc.grades.map((g) => g.gradeCode).join(", ")}
                      </span>
                      <span className="text-muted-foreground">
                        Valid thru {rc.effectiveTo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Compliance Documents Card */}
            <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">
                    Corporate Compliance
                  </h2>
                </div>
                <Link
                  href="/vendor/documents"
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  View Repository
                  <ChevronRight className="size-3" />
                </Link>
              </div>

              <div className="p-4 space-y-2.5">
                {complianceDocs.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {doc.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                          doc.severity === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        {doc.daysRemaining <= 30
                          ? `Expires in ${doc.daysRemaining}d`
                          : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
