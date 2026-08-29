"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Lock, SlidersHorizontal, RotateCcw } from "lucide-react";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const [simulatedScope, setSimulatedScope] = React.useState<"GLOBAL" | "DEPT_LOCKED">("GLOBAL");

  const userHasDeptScope = React.useMemo(() => {
    if (simulatedScope === "DEPT_LOCKED") return true;
    const hasDeptScopeCode = user?.scopes?.some((s) => s.scopeCode === "DEPARTMENT" || s.departmentId);
    const isFinanceAnalyst = user?.roles?.includes("FINANCE_ANALYST");
    return Boolean(hasDeptScopeCode || isFinanceAnalyst);
  }, [user, simulatedScope]);

  const DEFAULT_DIEZ_ORG_ID = "org-diez-grp";
  const DEFAULT_CORP_BU_ID = "bu-corp-tech";
  const DEFAULT_DIGITAL_DEPT_ID = "dept-dig-002";

  const isOrgLocked = userHasDeptScope;
  const isBuLocked = userHasDeptScope;
  const isDeptLocked = userHasDeptScope;

  const [localSearch, setLocalSearch] = React.useState(filters.search || "");

  React.useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

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

  const handleOrgChange = (unit: OrgUnitSummaryDto | null) => {
    if (isOrgLocked) return;
    onChange({
      ...filters,
      orgUnitId: unit?.orgUnitId || undefined,
      businessUnitId: undefined,
      departmentId: undefined,
    });
  };

  const handleBuChange = (unit: OrgUnitSummaryDto | null) => {
    if (isBuLocked) return;
    onChange({
      ...filters,
      businessUnitId: unit?.orgUnitId || undefined,
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
      <div className={`p-2 rounded-md border border-border/80 bg-card/60 backdrop-blur-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-xs ${className || ""}`}>
        
        {/* Filter Controls Row */}
        <div className="flex flex-1 items-center gap-3 w-full overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
          <div className="flex items-center gap-2 shrink-0 pl-1">
            <SlidersHorizontal className="size-4 text-primary" />
            <span className="text-xs font-semibold hidden md:inline">Filters</span>
          </div>

          <div className="flex items-center flex-1 gap-2 min-w-[600px] xl:min-w-0">
            {/* 1. Organisation */}
            <div className="w-1/4 relative">
              <OrgUnitPicker
                value={filters.orgUnitId || (isOrgLocked ? DEFAULT_DIEZ_ORG_ID : null)}
                onChange={handleOrgChange}
                filterByType={1}
                disabled={isOrgLocked}
                placeholder={isOrgLocked ? "DIEZ (Locked)" : "Organisation..."}
                className={isOrgLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
              />
            </div>

            {/* 2. Business Unit */}
            <div className="w-1/4 relative">
              <OrgUnitPicker
                value={filters.businessUnitId || (isBuLocked ? DEFAULT_CORP_BU_ID : null)}
                onChange={handleBuChange}
                filterByType={2}
                parentOrgUnitId={filters.orgUnitId}
                disabled={isBuLocked}
                placeholder={isBuLocked ? "Corp Tech (Locked)" : "Business Unit..."}
                className={isBuLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
              />
            </div>

            {/* 3. Department */}
            <div className="w-1/4 relative">
              <OrgUnitPicker
                value={filters.departmentId || (isDeptLocked ? DEFAULT_DIGITAL_DEPT_ID : null)}
                onChange={handleDeptChange}
                filterByType={3}
                parentOrgUnitId={filters.businessUnitId}
                disabled={isDeptLocked}
                placeholder={isDeptLocked ? "Digital Trans (Locked)" : "Department..."}
                className={isDeptLocked ? "opacity-90 bg-muted/30 pointer-events-none" : ""}
              />
            </div>

            {/* 4. Search */}
            <div className="relative w-1/4">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-7 text-xs h-9 rounded-lg border-border/80 bg-background shadow-xs focus-visible:ring-1"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearNonLockedFilters}
                className="text-[11px] h-8 px-2 shrink-0 text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer font-medium"
                title="Reset Filters"
              >
                <RotateCcw className="size-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Side: Scope Simulator */}
        <div className="flex items-center shrink-0 pr-1">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSimulatedScope("GLOBAL")}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
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
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                simulatedScope === "DEPT_LOCKED"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="size-2.5" />
              Dept Analyst
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
