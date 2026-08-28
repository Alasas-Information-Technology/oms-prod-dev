"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Lock, SlidersHorizontal, RotateCcw, ShieldAlert, Sparkles, Building, Layers, Landmark } from "lucide-react";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";

export interface BudgetFilterValues {
  orgUnitId?: string;
  businessUnitId?: string;
  departmentId?: string;
  search?: string;
}

export interface BudgetFilterRowProps {
  filters: BudgetFilterValues;
  onChange: (filters: BudgetFilterValues) => void;
  className?: string;
}

export function BudgetFilterRow({
  filters,
  onChange,
  className,
}: BudgetFilterRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ── Scope Simulation Mode (Allows switching between Global and Department Scope) ──
  const [simulatedScope, setSimulatedScope] = React.useState<"GLOBAL" | "DEPT_LOCKED">("GLOBAL");

  // Determine user's real scope from Auth session
  const userHasDeptScope = React.useMemo(() => {
    if (simulatedScope === "DEPT_LOCKED") return true;
    const hasDeptScopeCode = user?.scopes?.some((s) => s.scopeCode === "DEPARTMENT" || s.departmentId);
    const isFinanceAnalyst = user?.roles?.includes("FINANCE_ANALYST");
    return Boolean(hasDeptScopeCode || isFinanceAnalyst);
  }, [user, simulatedScope]);

  // Default IDs for DIEZ Department Scoped test viewer (Part 2.5)
  const DEFAULT_DIEZ_ORG_ID = "org-diez-grp";
  const DEFAULT_CORP_BU_ID = "bu-corp-tech";
  const DEFAULT_DIGITAL_DEPT_ID = "dept-dig-002";

  // Lock status calculation
  const isOrgLocked = userHasDeptScope;
  const isBuLocked = userHasDeptScope;
  const isDeptLocked = userHasDeptScope;

  // Local state for debounced search input (snappy keystroke response)
  const [localSearch, setLocalSearch] = React.useState(filters.search || "");

  // Sync internal search when external prop changes (e.g., browser Back button)
  React.useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Enforce Scope Prefill on initial load or scope mode switch
  React.useEffect(() => {
    if (userHasDeptScope) {
      const currentOrg = filters.orgUnitId || DEFAULT_DIEZ_ORG_ID;
      const currentBu = filters.businessUnitId || DEFAULT_CORP_BU_ID;
      const currentDept = filters.departmentId || DEFAULT_DIGITAL_DEPT_ID;

      if (
        filters.orgUnitId !== currentOrg ||
        filters.businessUnitId !== currentBu ||
        filters.departmentId !== currentDept
      ) {
        onChange({
          ...filters,
          orgUnitId: currentOrg,
          businessUnitId: currentBu,
          departmentId: currentDept,
        });
      }
    }
  }, [userHasDeptScope]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search input by 500ms (rate tier 5 per requirement 6)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) {
        onChange({
          ...filters,
          search: localSearch.trim() || undefined,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  // ── Cascading Handlers ───────────────────────────────────────────────────────

  const handleOrgChange = (unit: OrgUnitSummaryDto | null) => {
    if (isOrgLocked) return;
    const newOrgId = unit?.orgUnitId || undefined;
    onChange({
      ...filters,
      orgUnitId: newOrgId,
      // Cascading reset: clearing Org clears child BU and Dept
      businessUnitId: undefined,
      departmentId: undefined,
    });
  };

  const handleBuChange = (unit: OrgUnitSummaryDto | null) => {
    if (isBuLocked) return;
    const newBuId = unit?.orgUnitId || undefined;
    onChange({
      ...filters,
      businessUnitId: newBuId,
      // Cascading reset: clearing/changing BU clears child Dept
      departmentId: undefined,
    });
  };

  const handleDeptChange = (unit: OrgUnitSummaryDto | null) => {
    if (isDeptLocked) return;
    onChange({
      ...filters,
      departmentId: unit?.orgUnitId || undefined,
    });
  };

  const handleClearNonLockedFilters = () => {
    setLocalSearch("");
    if (userHasDeptScope) {
      onChange({
        orgUnitId: DEFAULT_DIEZ_ORG_ID,
        businessUnitId: DEFAULT_CORP_BU_ID,
        departmentId: DEFAULT_DIGITAL_DEPT_ID,
        search: undefined,
      });
    } else {
      onChange({
        orgUnitId: undefined,
        businessUnitId: undefined,
        departmentId: undefined,
        search: undefined,
      });
    }
  };

  const hasActiveFilters = Boolean(
    (!userHasDeptScope && (filters.orgUnitId || filters.businessUnitId || filters.departmentId)) ||
    localSearch
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs space-y-3 shadow-xs ${className || ""}`}>
        {/* Top meta strip: Filter bar title + Scope simulation badge */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-1 border-b border-border/40">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Scope & Line Filters
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              · Filter budget view by organizational hierarchy
            </span>
          </div>

          {/* Scope Mode Switcher (Deliberate test & verification control) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium hidden md:inline">
              Scope Mode:
            </span>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSimulatedScope("GLOBAL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  simulatedScope === "GLOBAL"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Global Admin
              </button>
              <button
                type="button"
                onClick={() => setSimulatedScope("DEPT_LOCKED")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  simulatedScope === "DEPT_LOCKED"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="size-3" />
                Finance Analyst (Dept-Scoped)
              </button>
            </div>
          </div>
        </div>

        {/* ── Main 4-Column Controls Row: Org, BU, Dept, Search ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* 1. Organisation Picker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-0.5">
              <span className="flex items-center gap-1">
                <Landmark className="size-3 text-muted-foreground" />
                Organisation
              </span>
              {isOrgLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold cursor-help">
                      <Lock className="size-2.5" />
                      Locked
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Organisation level is pre-selected and locked by user scope authorization.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <OrgUnitPicker
              value={filters.orgUnitId || (isOrgLocked ? DEFAULT_DIEZ_ORG_ID : null)}
              onChange={handleOrgChange}
              filterByType={1}
              disabled={isOrgLocked}
              placeholder={isOrgLocked ? "DIEZ Authority (Locked)" : "All Organisations"}
              className={isOrgLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
            />
          </div>

          {/* 2. Business Unit Picker (Cascading from Organisation) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-0.5">
              <span className="flex items-center gap-1">
                <Building className="size-3 text-muted-foreground" />
                Business Unit
              </span>
              {isBuLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold cursor-help">
                      <Lock className="size-2.5" />
                      Locked
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Business Unit is fixed to your assigned departmental division.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <OrgUnitPicker
              value={filters.businessUnitId || (isBuLocked ? DEFAULT_CORP_BU_ID : null)}
              onChange={handleBuChange}
              filterByType={2}
              parentOrgUnitId={filters.orgUnitId}
              disabled={isBuLocked}
              placeholder={isBuLocked ? "Corporate Technology (Locked)" : "All Business Units"}
              className={isBuLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
            />
          </div>

          {/* 3. Department Picker (Cascading from Business Unit) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-0.5">
              <span className="flex items-center gap-1">
                <Layers className="size-3 text-muted-foreground" />
                Department
              </span>
              {isDeptLocked ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold cursor-help">
                      <Lock className="size-2.5" />
                      Scoped
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Department pre-filled and locked to your assigned operational domain.
                  </TooltipContent>
                </Tooltip>
              ) : (
                filters.businessUnitId && (
                  <span className="text-[10px] text-primary font-semibold">
                    Filtered by BU
                  </span>
                )
              )}
            </div>
            <OrgUnitPicker
              value={filters.departmentId || (isDeptLocked ? DEFAULT_DIGITAL_DEPT_ID : null)}
              onChange={handleDeptChange}
              filterByType={3}
              parentOrgUnitId={filters.businessUnitId}
              disabled={isDeptLocked}
              placeholder={isDeptLocked ? "Digital Transformation (Locked)" : "All Departments"}
              className={isDeptLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
            />
          </div>

          {/* 4. Budget Line Search (Debounced 500ms) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-0.5">
              <span className="flex items-center gap-1">
                <Search className="size-3 text-muted-foreground" />
                Line Code or Name
              </span>
              {localSearch && (
                <span className="text-[10px] text-primary font-semibold">
                  Debounced 500ms
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search line (e.g. CS-DIG-001)..."
                className="pl-8 pr-8 text-xs h-9 rounded-lg border-border/80 bg-background shadow-xs focus-visible:ring-1"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Active Filters & Scope Assurance Banner ── */}
        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {userHasDeptScope && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-medium gap-1 py-0.5 px-2"
              >
                <Lock className="size-3 shrink-0" />
                <span>Departmental scope enforced: Digital Transformation & Cybersecurity</span>
              </Badge>
            )}

            {localSearch && (
              <Badge
                variant="secondary"
                className="text-[11px] font-normal gap-1.5 py-0.5 px-2"
              >
                <span>Search: &ldquo;{localSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="hover:text-destructive cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearNonLockedFilters}
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer font-medium"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
