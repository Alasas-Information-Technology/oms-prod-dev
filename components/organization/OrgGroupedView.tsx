"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Users,
  Layers,
  ArrowRightLeft,
  Archive,
  Trash2,
  MoreHorizontal,
  Plus,
  Building2,
  Briefcase,
  FolderTree,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/oms/StatusBadge";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { OrgTypeIcon, UnitPath } from "@/components/oms/org";
import {
  useOrgUnits,
  useOrgUnitTypes,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitSummaryDto,
  OrgUnitEntity,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

export interface OrgGroupedViewProps {
  selectedUnitId?: string | null;
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onOpenDetails?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMoveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onArchiveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDeleteUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddUnit?: () => void;
  initialTypeFilter?: number | null; // 2 for BU, 3 for Department, 4 for Section
  searchQuery?: string;
  className?: string;
}

type PresetFilter = "all" | "no-head" | "archived" | "added-this-year";

/**
 * OrgGroupedView — Flat filterable directory grouped by unit type (Part 3.6).
 *
 * Implements:
 * - Direct replacement of legacy /business-units, /departments, /sections routes.
 * - Preset filters: "No one in charge", "Archived", "Added this year".
 * - Lineage paths for every row using UnitPath.
 * - Row click triggers slide-over detail panel.
 */
export function OrgGroupedView({
  selectedUnitId,
  onSelectUnit,
  onOpenDetails,
  onMoveUnit,
  onArchiveUnit,
  onDeleteUnit,
  onAddUnit,
  initialTypeFilter,
  searchQuery = "",
  className,
}: OrgGroupedViewProps) {
  const { can } = usePermission();

  // Active Type Tab: "all" | "2" (BU) | "3" (DEP) | "4" (SEC)
  const [activeTypeTab, setActiveTypeTab] = React.useState<string>(
    initialTypeFilter ? String(initialTypeFilter) : "all"
  );

  // Preset Filter: "all" | "no-head" | "archived" | "added-this-year"
  const [presetFilter, setPresetFilter] = React.useState<PresetFilter>("all");

  // Local search filter input (synced with parent global search)
  const [localSearch, setLocalSearch] = React.useState("");

  React.useEffect(() => {
    if (searchQuery) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    if (initialTypeFilter) {
      setActiveTypeTab(String(initialTypeFilter));
    }
  }, [initialTypeFilter]);

  // Fetch all units
  const { data: unitsData, isLoading, refetch } = useOrgUnits({
    page: 1,
    pageSize: 100,
    orgUnitTypeId: activeTypeTab !== "all" ? Number(activeTypeTab) : undefined,
  });

  const { data: unitTypes } = useOrgUnitTypes();

  const currentYear = new Date().getFullYear();

  // Filter units based on preset filter and search query
  const filteredUnits = React.useMemo(() => {
    const rawList = unitsData?.data || [];
    const searchLower = localSearch.trim().toLowerCase();

    return rawList.filter((unit) => {
      // 1. Preset Filter
      if (presetFilter === "no-head") {
        const hasHead = Boolean(unit.head?.displayName || unit.head?.userDisplayName);
        if (hasHead) return false;
      } else if (presetFilter === "archived") {
        if (unit.isActive) return false;
      } else if (presetFilter === "added-this-year") {
        if (!unit.effectiveFrom) return false;
        const effectiveDate = new Date(unit.effectiveFrom);
        if (isNaN(effectiveDate.getTime()) || effectiveDate.getFullYear() < currentYear) return false;
      }

      // 2. Search Filter
      if (searchLower) {
        const matchName = unit.name?.toLowerCase().includes(searchLower);
        const matchNameAr = unit.nameAr?.toLowerCase().includes(searchLower);
        const matchCode = unit.code?.toLowerCase().includes(searchLower);
        const matchHead = (unit.head?.displayName || unit.head?.userDisplayName || "")
          .toLowerCase()
          .includes(searchLower);
        const matchParent = unit.parentName?.toLowerCase().includes(searchLower);
        if (!matchName && !matchNameAr && !matchCode && !matchHead && !matchParent) {
          return false;
        }
      }

      return true;
    });
  }, [unitsData, presetFilter, localSearch, currentYear]);

  // Counts for preset filters
  const filterCounts = React.useMemo(() => {
    const rawList = unitsData?.data || [];
    return {
      all: rawList.length,
      noHead: rawList.filter((u) => !u.head?.displayName && !u.head?.userDisplayName).length,
      archived: rawList.filter((u) => !u.isActive).length,
      addedThisYear: rawList.filter((u) => {
        if (!u.effectiveFrom) return false;
        const d = new Date(u.effectiveFrom);
        return !isNaN(d.getTime()) && d.getFullYear() >= currentYear;
      }).length,
    };
  }, [unitsData, currentYear]);

  // Table Columns Definition
  const columns: ColumnDef<OrgUnitSummaryDto>[] = [
    {
      key: "name",
      header: "Unit Name",
      render: (_, unit) => {
        const typeCode = unit.type?.code || unit.orgUnitType?.code || "DEPARTMENT";
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <OrgTypeIcon type={typeCode} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                  {unit.name}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                  {unit.code}
                </span>
              </div>
              {unit.nameAr && (
                <p dir="rtl" lang="ar" className="text-xs text-muted-foreground font-arabic truncate mt-0.5">
                  {unit.nameAr}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (_, unit) => {
        const typeCode = unit.type?.code || unit.orgUnitType?.code || "DEPARTMENT";
        return <OrgTypeIcon type={typeCode} size="sm" showLabel />;
      },
    },
    {
      key: "partOf",
      header: "Part of",
      render: (_, unit) => {
        if (!unit.parentName) {
          return <span className="text-xs text-muted-foreground italic">Top level</span>;
        }
        return (
          <UnitPath
            path={[unit.parentName]}
            currentName={unit.name}
            showCurrent={false}
            className="text-xs"
          />
        );
      },
    },
    {
      key: "head",
      header: "Who's in charge",
      render: (_, unit) => {
        const headName = unit.head?.displayName || unit.head?.userDisplayName;

        if (!headName) {
          return (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>No one in charge</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 text-xs">
            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
              {headName.charAt(0)}
            </div>
            <span className="text-foreground font-medium truncate">{headName}</span>
          </div>
        );
      },
    },
    {
      key: "inside",
      header: "What's inside",
      render: (_, unit) => {
        const childCount = unit.childCount ?? 0;
        const peopleCount = (unit as any).peopleCount ?? (unit as any).assignedUserCount ?? 0;
        const canonicalLevel = unit.type?.canonicalLevel || unit.orgUnitType?.canonicalLevel || (unit as any).depth || 3;
        const childWord = canonicalLevel === 3 ? "sections" : canonicalLevel === 2 ? "departments" : "teams";

        return (
          <span className="text-xs text-muted-foreground">
            {childCount > 0 ? `${childCount} ${childWord}` : "0 teams"} · {peopleCount} {peopleCount === 1 ? "person" : "people"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (_, unit) => {
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border",
              unit.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                unit.isActive ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            {unit.isActive ? "Active" : "Archived"}
          </span>
        );
      },
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-2xs">
        {/* Type Category Tabs */}
        <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab} className="w-full sm:w-auto">
          <TabsList className="h-9 p-1 bg-muted/60">
            <TabsTrigger value="all" className="text-xs font-semibold px-3">
              All Units
            </TabsTrigger>
            <TabsTrigger value="2" className="text-xs font-semibold px-3">
              Business Units
            </TabsTrigger>
            <TabsTrigger value="3" className="text-xs font-semibold px-3">
              Departments
            </TabsTrigger>
            <TabsTrigger value="4" className="text-xs font-semibold px-3">
              Sections
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Local Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search within group..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 h-9 text-xs rounded-xl bg-background"
          />
        </div>
      </div>

      {/* Preset Filter Pills (Part 3.6) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </span>

        <Button
          type="button"
          variant={presetFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setPresetFilter("all")}
          className="h-7 px-3 text-xs rounded-lg font-medium"
        >
          All ({filterCounts.all})
        </Button>

        <Button
          type="button"
          variant={presetFilter === "no-head" ? "default" : "outline"}
          size="sm"
          onClick={() => setPresetFilter("no-head")}
          className={cn(
            "h-7 px-3 text-xs rounded-lg font-medium gap-1.5",
            presetFilter !== "no-head" && "text-amber-700 dark:text-amber-300 border-amber-500/30"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          No one in charge ({filterCounts.noHead})
        </Button>

        <Button
          type="button"
          variant={presetFilter === "archived" ? "default" : "outline"}
          size="sm"
          onClick={() => setPresetFilter("archived")}
          className="h-7 px-3 text-xs rounded-lg font-medium gap-1.5"
        >
          <Archive className="h-3 w-3" />
          Archived ({filterCounts.archived})
        </Button>

        <Button
          type="button"
          variant={presetFilter === "added-this-year" ? "default" : "outline"}
          size="sm"
          onClick={() => setPresetFilter("added-this-year")}
          className="h-7 px-3 text-xs rounded-lg font-medium gap-1.5"
        >
          <Sparkles className="h-3 w-3" />
          Added this year ({filterCounts.addedThisYear})
        </Button>
      </div>

      {/* Grouped Data Table */}
      <DataTable
        columns={columns}
        data={filteredUnits}
        keyField="orgUnitId"
        loading={isLoading}
        onRowClick={(row) => {
          onSelectUnit?.(row);
          onOpenDetails?.(row);
        }}
        emptyMessage={
          localSearch || presetFilter !== "all"
            ? "No organization units match your current filters."
            : "No units found in this category."
        }
      />
    </div>
  );
}
