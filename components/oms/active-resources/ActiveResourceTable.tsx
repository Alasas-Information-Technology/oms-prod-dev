"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  Lock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
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
import { PageBarBreadcrumbs } from "@/components/ui/layouts/page-bar-context";
import { ACTIVE_RESOURCES, ActiveResource } from "@/src/lib/demo-data/active-resources";

export function ActiveResourceTable() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [deptFilter, setDeptFilter] = React.useState<string>("ALL");

  const filteredResources = React.useMemo(() => {
    return ACTIVE_RESOURCES.filter((res) => {
      // Status filter
      if (statusFilter !== "ALL" && res.status.toUpperCase() !== statusFilter) {
        return false;
      }
      // Department filter
      if (deptFilter !== "ALL" && res.department !== deptFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = res.id.toLowerCase().includes(q);
        const matchesName = res.fullName.toLowerCase().includes(q);
        const matchesTitle = res.positionTitle.toLowerCase().includes(q);
        const matchesDept = res.department.toLowerCase().includes(q);
        const matchesManager = res.manager.toLowerCase().includes(q);
        const matchesVendor = res.vendorName.toLowerCase().includes(q);

        if (
          !matchesId &&
          !matchesName &&
          !matchesTitle &&
          !matchesDept &&
          !matchesManager &&
          !matchesVendor
        ) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, statusFilter, deptFilter]);

  // Derived Metrics
  const stats = React.useMemo(() => {
    const total = ACTIVE_RESOURCES.length;
    const active = ACTIVE_RESOURCES.filter((r) => r.status === "Active").length;
    const endingSoon = ACTIVE_RESOURCES.filter((r) => r.status === "Ending Soon").length;
    const documentAlerts = ACTIVE_RESOURCES.filter((r) => r.documentHealth.expiringCount > 0).length;

    return { total, active, endingSoon, documentAlerts };
  }, []);

  const departments = React.useMemo(() => {
    const set = new Set<string>();
    ACTIVE_RESOURCES.forEach((r) => set.add(r.department));
    return Array.from(set);
  }, []);

  return (
    <div className="flex flex-col min-h-full pb-16 bg-background">
      {/* Page Bar Breadcrumbs */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "Workforce & Operations", href: "/app/workforce" },
          { label: "Active Resources", isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        {/* Header Title */}
        <div className="border-b border-border/40 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="size-6 text-primary" />
            <span>Active Resources</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Active outsourced personnel, compliance document tracking, contract runway watches, and operational readiness.
          </p>
        </div>

        {/* ── KPI Metrics Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Active Resources
            </span>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Normal Runway
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Ending Soon (&lt; 90 days)
            </span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.endingSoon}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Document Expiry Warnings
            </span>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.documentAlerts}
            </div>
          </div>
        </div>

        {/* ── Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border border-border/60 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, position, department, manager or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="size-3 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ENDING SOON">Ending Soon</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Resource Table ── */}
        <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">Employee / Role</th>
                  <th className="py-3 px-3">Department & Location</th>
                  <th className="py-3 px-3">Line Manager</th>
                  <th className="py-3 px-3">LPO & Cost</th>
                  <th className="py-3 px-3">Contract End</th>
                  <th className="py-3 px-3">Document Health</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center w-[50px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                      No active resources match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      {/* Name, ID & Role */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-foreground text-xs">{res.fullName}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">({res.id})</span>
                          {res.restricted && (
                            <span title="Restricted personal data">
                              <Lock className="size-3 text-amber-500 inline" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                          {res.positionTitle}
                        </div>
                      </td>

                      {/* Department & Location */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-foreground">{res.department}</div>
                        <div className="text-[11px] text-muted-foreground">{res.workLocation}</div>
                      </td>

                      {/* Line Manager */}
                      <td className="py-3 px-3 whitespace-nowrap text-foreground font-medium">
                        {res.manager}
                      </td>

                      {/* LPO & Cost */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-foreground font-medium">
                          {res.contractCost.lockedAllocation}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {res.engagement.lpoRef}
                        </div>
                      </td>

                      {/* Contract End */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-foreground">{res.contractEndDate}</div>
                        <div className="text-[11px] text-muted-foreground">Joined: {res.joinedDate}</div>
                      </td>

                      {/* Document Health */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {res.documentHealth.expiringCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <AlertTriangle className="size-3" />
                            {res.documentHealth.validCount} valid, {res.documentHealth.expiringCount} expiring
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <ShieldCheck className="size-3" />
                            All {res.documentHealth.validCount} valid
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {res.status === "Active" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 font-medium">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 font-medium">
                            <AlertTriangle className="size-3" />
                            Ending Soon
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center w-[50px] whitespace-nowrap">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
                          title="View Detail Record"
                        >
                          <Link href={`/app/active-resources/${res.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
