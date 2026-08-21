"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  FolderTree,
  Plus,
  Download,
  Search,
  ExternalLink,
  ArrowRightLeft,
  Trash2,
  Power,
  Crown,
  Layers,
  Loader2,
  Briefcase,
  Building,
  CheckCircle2,
  ChevronsUpDown,
  LayoutGrid,
  ListTree,
  Network,
  ChevronRight,
  Eye,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OrgChartCanvas } from "@/components/organization/OrgChartCanvas";
import { OrgTree } from "@/components/organization/OrgTree";
import { OrgUnitDetailView } from "@/components/organization/OrgUnitDetailView";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { OrgTypeIcon, UnitPath } from "@/components/oms/org";

import {
  useOrgUnit,
  useOrgUnits,
  useOrgUnitTypes,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import { orgUnitsApi } from "@/lib/api/organization";
import {
  OrgUnitSummaryDto,
  OrgUnitDetailDto,
  OrgUnitEntity,
  CreateOrgUnitDto,
  OrgUnitTypeDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

const STORAGE_KEY_VIEW_MODE = "oms_org_view_mode_v2";

export default function OrganizationPage() {
  return (
    <React.Suspense fallback={<div className="p-6">Loading organisation...</div>}>
      <OrganizationPageContent />
    </React.Suspense>
  );
}

function OrganizationPageContent() {
  const { can } = usePermission();
  const searchParams = useSearchParams();

  // Read deep-linked unit if provided (?unit=<id> or ?node=<id>)
  const deepLinkUnitId = searchParams.get("unit") || searchParams.get("node");

  // View Mode: "chart" (default) | "list" | "grouped" (Part 3.1)
  const [viewMode, setViewMode] = React.useState<"chart" | "list" | "grouped">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY_VIEW_MODE);
        if (saved === "chart" || saved === "list" || saved === "grouped") return saved;
      } catch {
        // Fallback
      }
    }
    return "chart";
  });

  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(deepLinkUnitId || null);
  const [detailPanelUnitId, setDetailPanelUnitId] = React.useState<string | null>(deepLinkUnitId || null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(Boolean(deepLinkUnitId));

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createParentUnit, setCreateParentUnit] = React.useState<OrgUnitSummaryDto | OrgUnitEntity | null>(null);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [moveTargetUnit, setMoveTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteTargetUnit, setDeleteTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [treeExpandAll, setTreeExpandAll] = React.useState<boolean | undefined>(undefined);

  // Grouped view states
  const [groupedFilterType, setGroupedFilterType] = React.useState<number | null>(null);
  const [groupedSearchQuery, setGroupedSearchQuery] = React.useState("");

  const { data: typesData } = useOrgUnitTypes();

  // Load units for metrics and grouped tables
  const { data: allUnitsData, isLoading: isLoadingAllUnits, refetch: refetchUnits } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  // Save view mode
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
      } catch {
        // Ignore
      }
    }
  }, [viewMode]);

  // Compute Quick Metrics
  const stats = React.useMemo(() => {
    const all = allUnitsData?.data || [];
    const buCount = all.filter((u) => u.orgUnitTypeId === 2).length;
    const deptCount = all.filter((u) => u.orgUnitTypeId === 3).length;
    const secCount = all.filter((u) => u.orgUnitTypeId === 4).length;
    return { total: all.length, businessUnits: buCount, departments: deptCount, sections: secCount };
  }, [allUnitsData]);

  // Handle open details for unit
  const handleOpenDetails = React.useCallback((unit: OrgUnitSummaryDto | OrgUnitEntity) => {
    setSelectedUnitId(unit.orgUnitId);
    setDetailPanelUnitId(unit.orgUnitId);
    setIsDetailOpen(true);
  }, []);

  // Handle Create Submit
  const handleCreateSubmit = async (values: CreateOrgUnitDto) => {
    try {
      const created = await createMutation.mutateAsync(values);
      toast.success(`Unit ${created.name} (${created.code}) created successfully.`);
      setIsCreateOpen(false);
      refetchUnits();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create organization unit.";
      toast.error(errorMsg);
    }
  };

  // Handle Export (Tier 7 rate limit, gated on can(ORG.EXPORT))
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await orgUnitsApi.exportUnits();
      if ("data" in res && res.data instanceof Blob) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Hierarchy exported successfully.");
      } else if ("downloadUrl" in res && typeof res.downloadUrl === "string") {
        window.open(res.downloadUrl, "_blank");
        toast.success("Hierarchy exported successfully.");
      } else {
        toast.info((res as any).message || "Export job queued for background processing.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Export failed.";
      toast.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  // Grouped Filter Data
  const filteredGroupedUnits = React.useMemo(() => {
    let list = allUnitsData?.data || [];
    if (groupedFilterType !== null) {
      list = list.filter((u) => u.orgUnitTypeId === groupedFilterType);
    }
    if (groupedSearchQuery.trim()) {
      const q = groupedSearchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q) ||
          (u.nameAr && u.nameAr.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allUnitsData, groupedFilterType, groupedSearchQuery]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-20">
      {/* ========================================================================= */}
      {/* Top Header: "Organisation" + 3-View Segmented Control + Add Primary CTA   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Organisation
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore and understand the reporting lines, departments, teams, and leadership.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented 3-View Control (Part 3.1) */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            <Button
              type="button"
              variant={viewMode === "chart" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("chart")}
              className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all"
            >
              <Network className="h-3.5 w-3.5" />
              Chart
            </Button>

            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all"
            >
              <ListTree className="h-3.5 w-3.5" />
              List
            </Button>

            <Button
              type="button"
              variant={viewMode === "grouped" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grouped")}
              className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grouped
            </Button>
          </div>

          {/* Export Action */}
          {can(ORG_PERMISSIONS.EXPORT) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 text-xs h-9 rounded-xl"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export
            </Button>
          )}

          {/* Primary Action (⊕ Add) Gated on ORG.CREATE */}
          {can(ORG_PERMISSIONS.CREATE) && (
            <Button
              size="sm"
              onClick={() => {
                setCreateParentUnit(null);
                setIsCreateOpen(true);
              }}
              className="gap-1.5 text-xs h-9 font-semibold rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* View 1: Chart View (Canvas + Slide-over Drawer)                           */}
      {/* ========================================================================= */}
      {viewMode === "chart" && (
        <div className="space-y-4">
          <OrgChartCanvas
            selectedUnitId={selectedUnitId}
            onSelectUnit={(unit) => setSelectedUnitId(unit.orgUnitId)}
            onOpenDetails={handleOpenDetails}
            onAddUnit={() => {
              setCreateParentUnit(null);
              setIsCreateOpen(true);
            }}
            deepLinkUnitId={deepLinkUnitId}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* View 2: List View (Indented Tree + Detail Split Pane)                     */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <Card className="border border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ListTree className="h-4 w-4 text-primary" />
                    Organisation List
                  </CardTitle>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1"
                    onClick={() => setTreeExpandAll((prev) => (prev === true ? false : true))}
                  >
                    <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                    {treeExpandAll ? "Collapse All" : "Expand All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[680px]">
                  <OrgTree
                    selectedId={selectedUnitId}
                    forceExpandAll={treeExpandAll}
                    onSelectUnit={(unit) => {
                      setSelectedUnitId(unit.orgUnitId);
                      setDetailPanelUnitId(unit.orgUnitId);
                    }}
                    onAddChild={(parent) => {
                      setCreateParentUnit(parent);
                      setIsCreateOpen(true);
                    }}
                    onMoveUnit={(unit) => {
                      setMoveTargetUnit(unit as OrgUnitDetailDto);
                      setIsMoveOpen(true);
                    }}
                    onDeleteUnit={(unit) => {
                      setDeleteTargetUnit(unit as OrgUnitDetailDto);
                      setIsDeleteOpen(true);
                    }}
                    className="h-full border-none rounded-none shadow-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {selectedUnitId ? (
              <Card className="border border-border shadow-xs p-5 sm:p-6 min-h-[740px]">
                <OrgUnitDetailView
                  unitId={selectedUnitId}
                  onNavigateUnit={(targetId) => setSelectedUnitId(targetId || null)}
                />
              </Card>
            ) : (
              <Card className="border border-border shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[600px] space-y-3">
                <Building2 className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Select a Department or Team</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Click any node in the list to inspect structured metadata, direct teams, leadership timeline, and change history.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* View 3: Grouped View (Flat Categorized Directory with Full Paths)         */}
      {/* ========================================================================= */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {/* Preset Filters & Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={groupedFilterType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupedFilterType(null)}
                className="text-xs h-8 rounded-lg"
              >
                All ({stats.total})
              </Button>
              <Button
                variant={groupedFilterType === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupedFilterType(2)}
                className="text-xs h-8 rounded-lg"
              >
                Business Units ({stats.businessUnits})
              </Button>
              <Button
                variant={groupedFilterType === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupedFilterType(3)}
                className="text-xs h-8 rounded-lg"
              >
                Departments ({stats.departments})
              </Button>
              <Button
                variant={groupedFilterType === 4 ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupedFilterType(4)}
                className="text-xs h-8 rounded-lg"
              >
                Sections ({stats.sections})
              </Button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={groupedSearchQuery}
                onChange={(e) => setGroupedSearchQuery(e.target.value)}
                placeholder="Search by name or code..."
                className="h-8 pl-8 text-xs rounded-lg"
              />
            </div>
          </div>

          {/* Grouped Table List */}
          <Card className="border border-border shadow-xs overflow-hidden">
            <div className="divide-y divide-border">
              {filteredGroupedUnits.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No matching departments or teams found.
                </div>
              ) : (
                filteredGroupedUnits.map((unit) => (
                  <div
                    key={unit.orgUnitId}
                    onClick={() => handleOpenDetails(unit)}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <OrgTypeIcon type={unit.orgUnitTypeId} size="sm" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {unit.name}
                          </span>
                          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                            {unit.code}
                          </span>
                          {!unit.isActive && (
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              Archived
                            </Badge>
                          )}
                        </div>
                        {unit.parentName ? (
                          <p className="text-xs text-muted-foreground truncate">
                            Part of <strong className="font-medium text-foreground">{unit.parentName}</strong>
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Root Organisation</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-foreground">
                          {unit.head?.displayName || unit.head?.userDisplayName || (
                            <span className="text-muted-foreground italic">No head assigned</span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {unit.childCount || 0} sub-units
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Slide-over Detail Panel (Part 3.4)                                        */}
      {/* ========================================================================= */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-6 bg-card border-l border-border shadow-xl"
        >
          <SheetHeader className="pb-2 border-b border-border/50">
            <SheetTitle className="text-lg font-bold">Department Details</SheetTitle>
            <SheetDescription className="text-xs">
              Structured metadata, reporting hierarchy, leadership timeline, and history log.
            </SheetDescription>
          </SheetHeader>

          {detailPanelUnitId && (
            <div className="pt-4">
              <OrgUnitDetailView
                unitId={detailPanelUnitId}
                onNavigateUnit={(targetId) => {
                  if (targetId) {
                    setDetailPanelUnitId(targetId);
                    setSelectedUnitId(targetId);
                  }
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* Dialogs: Add, Move, Delete                                               */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {createParentUnit ? `Add Sub-Unit under ${createParentUnit.name}` : "Add Organisation"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {createParentUnit
                ? `Creating a new department or section situated beneath ${createParentUnit.name} (${createParentUnit.code}).`
                : "Register a top-level organisation entity."}
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            parentUnit={createParentUnit}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={moveTargetUnit}
        onSuccess={() => refetchUnits()}
      />

      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={deleteTargetUnit}
        onSuccess={() => refetchUnits()}
      />
    </div>
  );
}
