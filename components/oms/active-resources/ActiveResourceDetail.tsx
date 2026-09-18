"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  IdCard,
  Building2,
  User,
  Calendar,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  ChevronRight,
  Laptop,
  Key,
  Building,
  Bell,
  RefreshCw,
  MoreVertical,
  UserX,
  UserPlus,
  Eye,
  Download,
  Check,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageBarBreadcrumbs } from "@/components/ui/layouts/page-bar-context";
import {
  getActiveResourceById,
  ActiveResource,
} from "@/src/lib/demo-data/active-resources";
import { cn } from "@/lib/utils";

interface ActiveResourceDetailProps {
  resourceId: string;
}

export function ActiveResourceDetail({ resourceId }: ActiveResourceDetailProps) {
  const resource = getActiveResourceById(resourceId) || getActiveResourceById("RES-2026-0042")!;
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "documents" | "engagement" | "work_completion" | "leave" | "audit"
  >("overview");

  return (
    <div className="flex flex-col min-h-full pb-24 bg-[#F8FAFC] dark:bg-background text-foreground">
      {/* Page Bar Breadcrumbs */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Active Resources", href: "/app/active-resources" },
          { label: resource.id, isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-8 pt-6 pb-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* ── Top Header Section ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Active Resource Record
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                <CheckCircle2 className="size-3.5 fill-emerald-600 text-white dark:fill-emerald-400 dark:text-black" />
                Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{resource.fullName}</span>
              <span className="text-slate-400">•</span>
              <span>{resource.positionTitle}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-300">
            <Lock className="size-3.5 text-slate-500" />
            <span>Restricted personal data</span>
          </div>
        </div>

        {/* ── Key Metadata Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs">
          {/* Resource ID */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <IdCard className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Resource ID</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground font-mono">{resource.id}</div>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <Shield className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Department</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground">{resource.department}</div>
            </div>
          </div>

          {/* Reporting Line Manager */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <User className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Reporting Line Manager</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground">{resource.manager}</div>
            </div>
          </div>

          {/* Work location */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <Building2 className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Work location</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground">{resource.workLocation}</div>
            </div>
          </div>

          {/* Joined */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <Calendar className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Joined</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground">{resource.joinedDate}</div>
            </div>
          </div>

          {/* Contract end */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground">Contract end</div>
              <div className="text-xs font-bold text-slate-900 dark:text-foreground">{resource.contractEndDate}</div>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="border-b border-slate-200 dark:border-border">
          <div className="flex items-center gap-8 overflow-x-auto text-xs font-medium">
            {[
              { id: "overview", label: "Overview" },
              { id: "documents", label: "Documents" },
              { id: "engagement", label: "Engagement" },
              { id: "work_completion", label: "Work Completion" },
              { id: "leave", label: "Leave" },
              { id: "audit", label: "Audit" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "pb-3 pt-1 transition-colors border-b-2 font-semibold whitespace-nowrap cursor-pointer",
                    isActive
                      ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW CONTENT ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT COLUMN (5 cols) ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Engagement Overview Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Engagement Overview
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      Request
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground font-mono">
                      {resource.engagement.requestRef}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      LPO
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground font-mono">
                      {resource.engagement.lpoRef}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="size-3.5 text-slate-400" />
                      Engagement duration
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">
                      {resource.engagement.duration}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <User className="size-3.5 text-slate-400" />
                      Grade
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">
                      {resource.engagement.grade}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <Shield className="size-3.5 text-slate-400" />
                      Candidate cost (Total LPO)
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">
                      {resource.engagement.candidateCost}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <User className="size-3.5 text-slate-400" />
                      Work Completion assignees
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground text-right max-w-[200px]">
                      {resource.engagement.wcrAssignees}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <Shield className="size-3.5 text-slate-400" />
                      Attendance monitoring
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">
                      {resource.engagement.attendanceMonitoring}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-2">
                      <Shield className="size-3.5 text-slate-400" />
                      Biometric presence reference
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[220px]">
                      {resource.engagement.biometricRef}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Health Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Document Health
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      Passport
                    </span>
                    <span className="text-slate-900 dark:text-foreground font-medium">
                      {resource.documentHealth.passport.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      Emirates ID
                    </span>
                    <span className="text-slate-900 dark:text-foreground font-medium">
                      {resource.documentHealth.emiratesId.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      Police Clearance
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-foreground font-medium">
                        {resource.documentHealth.policeClearance.text}
                      </span>
                      {resource.documentHealth.policeClearance.isExpiring && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          <AlertTriangle className="size-3 text-amber-600" />
                          {resource.documentHealth.policeClearance.daysLeft}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                      <FileText className="size-3.5 text-slate-400" />
                      NDA
                    </span>
                    <span className="text-slate-900 dark:text-foreground font-medium">
                      {resource.documentHealth.nda.text}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-border/60 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-muted-foreground font-medium">Overall</span>
                    <span className="ml-3 font-bold text-slate-900 dark:text-foreground">
                      {resource.documentHealth.validCount} valid, {resource.documentHealth.expiringCount} expiring
                    </span>
                  </div>

                  <Button
                    onClick={() => setActiveTab("documents")}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold px-3 border-slate-300 dark:border-border bg-white dark:bg-card hover:bg-slate-50 cursor-pointer"
                  >
                    Review documents
                  </Button>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN (7 cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contract & Cost Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Contract & Cost
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground font-medium text-[11px]">Locked allocation</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.contractCost.lockedAllocation}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground font-medium text-[11px]">Consumed</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.contractCost.consumed}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground font-medium text-[11px]">Remaining</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.contractCost.remaining}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground font-medium text-[11px]">Next WCR due</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.contractCost.nextWcrDue}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground font-medium text-[11px]">Forecast</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="size-3 fill-emerald-600 text-white" />
                      {resource.contractCost.forecast}
                    </div>
                  </div>
                </div>

                {/* Consumption Progress Bar */}
                <div className="pt-2 space-y-1">
                  <div className="h-6 rounded-lg bg-teal-800 flex overflow-hidden text-[11px] font-bold text-white shadow-inner">
                    <div
                      style={{ width: `${resource.contractCost.consumedPercent}%` }}
                      className="bg-[#002B36] flex items-center justify-center border-r border-teal-600/40 px-2"
                    >
                      {resource.contractCost.consumedPercent}% Consumed
                    </div>
                    <div
                      style={{ width: `${resource.contractCost.remainingPercent}%` }}
                      className="bg-[#006064] flex items-center justify-center px-2"
                    >
                      {resource.contractCost.remainingPercent}% Remaining
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Readiness Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Operational Readiness
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  {/* Saned provisioning */}
                  <div className="flex items-start gap-2.5">
                    <Shield className="size-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Saned provisioning</div>
                      <div className="font-semibold text-slate-900 dark:text-foreground mt-0.5">
                        {resource.operationalReadiness.saned}
                      </div>
                    </div>
                  </div>

                  {/* DIEZ laptop */}
                  <div className="flex items-start gap-2.5">
                    <Laptop className="size-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-500 dark:text-muted-foreground text-[11px]">DIEZ laptop</div>
                      <div className="font-semibold text-slate-900 dark:text-foreground mt-0.5">
                        {resource.operationalReadiness.laptop}
                      </div>
                    </div>
                  </div>

                  {/* Security token */}
                  <div className="flex items-start gap-2.5">
                    <Key className="size-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Security token</div>
                      <div className="font-semibold text-slate-900 dark:text-foreground mt-0.5">
                        {resource.operationalReadiness.token}
                      </div>
                    </div>
                  </div>

                  {/* Building access */}
                  <div className="flex items-start gap-2.5">
                    <Building className="size-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Building access</div>
                      <div className="font-semibold text-slate-900 dark:text-foreground mt-0.5">
                        {resource.operationalReadiness.buildingAccess}
                      </div>
                    </div>
                  </div>

                  {/* Remote access */}
                  <div className="flex items-start gap-2.5">
                    <Laptop className="size-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Remote access</div>
                      <div className="font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {resource.operationalReadiness.remoteAccess}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Snapshot Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                    Leave Snapshot
                  </h3>
                  <button
                    onClick={() => setActiveTab("leave")}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View leave history &gt;
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Annual leave entitlement</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.leaveSnapshot.entitlementDays} days
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Used</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.leaveSnapshot.usedDays} days
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Pending approval</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
                      {resource.leaveSnapshot.pendingDays} days
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-muted-foreground text-[11px]">Remaining</div>
                    <div className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                      {resource.leaveSnapshot.remainingDays} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifecycle Timeline Card */}
              <div className="p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Lifecycle Timeline
                </h3>

                <div className="pt-3 pb-2 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[560px] relative">
                    {/* Connecting Line */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-border -z-0" />

                    {resource.timeline.map((step, idx) => {
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";
                      const isWarning = step.status === "warning";

                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center text-center space-y-1.5 px-2 max-w-[110px]">
                          {/* Circle Icon Node */}
                          <div
                            className={cn(
                              "size-8 rounded-full flex items-center justify-center font-bold text-xs transition-transform shadow-xs",
                              isCompleted && "bg-teal-700 text-white dark:bg-teal-600",
                              isCurrent && "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-950",
                              isWarning && "bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950",
                              !isCompleted && !isCurrent && !isWarning && "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            {isCompleted && <Check className="size-4 stroke-[3]" />}
                            {isCurrent && <FileText className="size-4" />}
                            {isWarning && <AlertTriangle className="size-4" />}
                            {!isCompleted && !isCurrent && !isWarning && <Calendar className="size-4" />}
                          </div>

                          {/* Label */}
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {step.label}
                          </div>

                          {/* Date */}
                          <div className="text-[10px] text-slate-500 dark:text-muted-foreground font-medium">
                            {step.date}
                          </div>

                          {/* Subtext */}
                          {step.subtext && (
                            <div className="text-[9px] text-slate-400 dark:text-slate-500">
                              {step.subtext}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: DOCUMENTS ── */}
        {activeTab === "documents" && (
          <div className="p-6 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                  Compliance & Identity Documents
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                  Verified HR documents, visa passes, police clearance, and signed legal agreements.
                </p>
              </div>

              <Button size="sm" className="text-xs gap-1.5 font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer">
                <Download className="size-3.5" />
                <span>Export Document Pack</span>
              </Button>
            </div>

            <div className="border border-slate-200/80 dark:border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-muted/50 border-b border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                  {resource.documentsList.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                        <FileText className="size-4 text-slate-400" />
                        {doc.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{doc.type}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{doc.issueDate}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-foreground">{doc.expiryDate}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{doc.verifiedBy}</td>
                      <td className="py-3 px-4">
                        {doc.status === "VALID" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="size-3" />
                            Expiring Soon
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-teal-700 hover:text-teal-800">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: ENGAGEMENT ── */}
        {activeTab === "engagement" && (
          <div className="p-6 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
              Engagement & Commercial Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-muted/40 border border-slate-200/60 dark:border-border space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-foreground text-xs uppercase tracking-wider">
                  Requisition & Commercial Contract
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor Name:</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{resource.vendorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requisition ID:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-foreground">{resource.engagement.requestRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LPO Reference:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-foreground">{resource.engagement.lpoRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Contract Value:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">{resource.engagement.candidateCost}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-muted/40 border border-slate-200/60 dark:border-border space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-foreground text-xs uppercase tracking-wider">
                  Operational Guidelines
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grade Level:</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{resource.engagement.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attendance Monitoring:</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{resource.engagement.attendanceMonitoring}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biometric Reference:</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{resource.engagement.biometricRef}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: WORK COMPLETION ── */}
        {activeTab === "work_completion" && (
          <div className="p-6 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
              Work Completion Reports (WCR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-muted-foreground">
              Monthly milestone sign-offs, deliverable verifications, and payment authorization records.
            </p>

            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-teal-900 dark:text-teal-200">Next WCR Submission Due</div>
                <div className="text-teal-700 dark:text-teal-300 mt-0.5">30 Sep 2026 (Monthly WCR for September 2026)</div>
              </div>
              <Badge className="bg-teal-700 text-white font-semibold">On Schedule</Badge>
            </div>
          </div>
        )}

        {/* ── TAB 5: LEAVE ── */}
        {activeTab === "leave" && (
          <div className="p-6 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
              Leave History & Records
            </h3>

            <div className="border border-slate-200/80 dark:border-border rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-muted/50 border-b border-slate-200 dark:border-border text-slate-600 font-semibold">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Approved By</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                  {resource.leaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No prior leave requests submitted.
                      </td>
                    </tr>
                  ) : (
                    resource.leaveHistory.map((l) => (
                      <tr key={l.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground">{l.type}</td>
                        <td className="py-3 px-4 text-slate-600">{l.startDate}</td>
                        <td className="py-3 px-4 text-slate-600">{l.endDate}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{l.days} days</td>
                        <td className="py-3 px-4 text-slate-600">{l.approvedBy}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 6: AUDIT ── */}
        {activeTab === "audit" && (
          <div className="p-6 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
              <Lock className="size-4 text-slate-500" />
              <span>Access & Export Audit Log</span>
            </h3>

            <div className="border border-slate-200/80 dark:border-border rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-muted/50 border-b border-slate-200 dark:border-border text-slate-600 font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                  {resource.auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground">{log.action}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.performedBy}</td>
                      <td className="py-3 px-4 text-slate-500">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Footer Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-slate-200 dark:border-border py-3 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Audit Notice */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground font-medium">
            <Lock className="size-3.5 text-slate-400 shrink-0" />
            <span>Every view and export is audited. Data minimisation and retention policy apply.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold px-3.5 border-slate-300 dark:border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer"
            >
              <Bell className="size-3.5 text-slate-500" />
              <span>Create Reminder</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold px-3.5 border-slate-300 dark:border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5 text-slate-500" />
              <span>Start Renewal</span>
            </Button>

            {/* Dropdown Menu for More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold px-3.5 border-slate-300 dark:border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer"
                >
                  <MoreVertical className="size-3.5 text-slate-500" />
                  <span>More Actions</span>
                  <ChevronDown className="size-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs font-medium">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <UserPlus className="size-3.5 text-slate-500" />
                  <span>Replacement</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600">
                  <UserX className="size-3.5 text-red-500" />
                  <span>Termination</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
