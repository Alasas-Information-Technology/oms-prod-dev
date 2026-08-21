"use client";

import * as React from "react";
import Link from "next/link";
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
  ChevronRight,
  Eye,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgTree } from "@/components/organization/OrgTree";
import { OrgUnitDetailView } from "@/components/organization/OrgUnitDetailView";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
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

export default function OrganizationTreePage() {
  const { can } = usePermission();

  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createParentUnit, setCreateParentUnit] = React.useState<OrgUnitSummaryDto | OrgUnitEntity | null>(null);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [moveTargetUnit, setMoveTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteTargetUnit, setDeleteTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [expandAll, setExpandAll] = React.useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = React.useState<"tree" | "cards">("tree");
  const [cardsFilterType, setCardsFilterType] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: typesData } = useOrgUnitTypes();

  // Load all units for quick metric summary and card view
  const { data: allUnitsData, isLoading: isLoadingAllUnits } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const typesMap = React.useMemo(() => {
    const map = new Map<number, OrgUnitTypeDto>();
    typesData?.forEach((t) => map.set(t.orgUnitTypeId, t));
    return map;
  }, [typesData]);

  // Compute Quick Stats
  const stats = React.useMemo(() => {
    const all = allUnitsData?.data || [];
    const buCount = all.filter((u) => u.orgUnitTypeId === 2).length;
    const deptCount = all.filter((u) => u.orgUnitTypeId === 3).length;
    const secCount = all.filter((u) => u.orgUnitTypeId === 4).length;
    return { total: all.length, businessUnits: buCount, departments: deptCount, sections: secCount };
  }, [allUnitsData]);

  // Auto-select root on load if none selected
  React.useEffect(() => {
    if (!selectedUnitId && allUnitsData?.data && allUnitsData.data.length > 0) {
      const root = allUnitsData.data.find((u) => u.depth === 0) || allUnitsData.data[0];
      setSelectedUnitId(root.orgUnitId);
    }
  }, [allUnitsData, selectedUnitId]);

  const filteredCards = React.useMemo(() => {
    let units = allUnitsData?.data || [];
    if (cardsFilterType !== null) {
      units = units.filter((u) => u.orgUnitTypeId === cardsFilterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      units = units.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q) ||
          (u.nameAr && u.nameAr.toLowerCase().includes(q))
      );
    }
    return units;
  }, [allUnitsData, cardsFilterType, searchQuery]);

  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  const handleCreateSubmit = async (data: CreateOrgUnitDto) => {
    try {
      const created = await createMutation.mutateAsync(data);
      toast.success(`Organization unit ${created.name} (${created.code}) created successfully.`);
      setIsCreateOpen(false);
      setSelectedUnitId(created.orgUnitId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create organization unit.";
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async (unit: OrgUnitSummaryDto | OrgUnitEntity | OrgUnitDetailDto) => {
    try {
      if (unit.isActive) {
        await deactivateMutation.mutateAsync({
          id: unit.orgUnitId,
          effectiveTo: new Date().toISOString().split("T")[0],
        });
        toast.success(`Unit ${unit.name} deactivated.`);
      } else {
        await activateMutation.mutateAsync(unit.orgUnitId);
        toast.success(`Unit ${unit.name} activated.`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update unit status.";
      toast.error(errorMsg);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await orgUnitsApi.exportUnits({});
      if ("data" in res && res.data instanceof Blob) {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Excel report exported successfully.");
      } else if ("queued" in res && res.queued) {
        toast.info(res.message || "Export job queued for background processing.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Export failed.";
      toast.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-20">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Organization Master
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore and manage the corporate organizational structure, budget owners, reporting hierarchy, and leadership appointments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {can(ORG_PERMISSIONS.EXPORT) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 text-xs h-9"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export Hierarchy
            </Button>
          )}

          {can(ORG_PERMISSIONS.CREATE) && (
            <Button
              size="sm"
              onClick={() => {
                setCreateParentUnit(null);
                setIsCreateOpen(true);
              }}
              className="gap-2 text-xs h-9"
            >
              <Plus className="h-4 w-4" />
              New Organization Unit
            </Button>
          )}
        </div>
      </div>

      {/* Top Level Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setCardsFilterType(null);
            setViewMode("cards");
          }}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-primary/50 hover:shadow-xs",
            cardsFilterType === null && viewMode === "cards" ? "ring-2 ring-primary/20 border-primary bg-primary/5" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">All Units</span>
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Across all hierarchy levels</span>
        </div>

        <div
          onClick={() => {
            setCardsFilterType(2);
            setViewMode("cards");
          }}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-xs",
            cardsFilterType === 2 && viewMode === "cards" ? "ring-2 ring-blue-500/20 border-blue-500 bg-blue-500/5" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Business Units</span>
            <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.businessUnits || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Level 2 executive divisions</span>
        </div>

        <div
          onClick={() => {
            setCardsFilterType(3);
            setViewMode("cards");
          }}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-xs",
            cardsFilterType === 3 && viewMode === "cards" ? "ring-2 ring-emerald-500/20 border-emerald-500 bg-emerald-500/5" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Departments</span>
            <FolderTree className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.departments || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Budget owners & cost centers</span>
        </div>

        <div
          onClick={() => {
            setCardsFilterType(4);
            setViewMode("cards");
          }}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-xs",
            cardsFilterType === 4 && viewMode === "cards" ? "ring-2 ring-amber-500/20 border-amber-500 bg-amber-500/5" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Sections</span>
            <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.sections || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Operational subunits</span>
        </div>
      </div>

      {/* Main Two-Pane Split Layout (Part 3.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Explorer Pane: Fixed Width Tree / Cards Directory */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-primary" />
                  Organization Tree
                </CardTitle>

                {/* View Switcher & Expand Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {viewMode === "tree" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1"
                      onClick={() => setExpandAll((prev) => (prev === true ? false : true))}
                    >
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                      {expandAll ? "Collapse" : "Expand"}
                    </Button>
                  )}

                  <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50">
                    <Button
                      variant={viewMode === "tree" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1"
                      onClick={() => setViewMode("tree")}
                    >
                      <ListTree className="h-3 w-3" />
                      Tree
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1"
                      onClick={() => setViewMode("cards")}
                    >
                      <LayoutGrid className="h-3 w-3" />
                      Cards
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3">
              {viewMode === "tree" ? (
                <div className="h-[680px]">
                  <OrgTree
                    selectedId={selectedUnitId}
                    forceExpandAll={expandAll}
                    onSelectUnit={(unit) => setSelectedUnitId(unit.orgUnitId)}
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
                    onToggleActiveUnit={(unit) => handleToggleActive(unit)}
                    className="h-full border-none rounded-none shadow-none"
                  />
                </div>
              ) : (
                /* Cards Directory Grid */
                <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter cards..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredCards.map((unit) => (
                      <div
                        key={unit.orgUnitId}
                        onClick={() => setSelectedUnitId(unit.orgUnitId)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          selectedUnitId === unit.orgUnitId
                            ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                            : "bg-card hover:bg-muted/40 border-border"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground truncate">{unit.name}</span>
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {unit.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {unit.parentName ? `Reports to: ${unit.parentName}` : "Root Holding Entity"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Detail Pane: Structured Unit Details with Tabs (Part 3.1 & 3.2) */}
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
                <h3 className="text-base font-bold text-foreground">Select an Organization Unit</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Click any node in the hierarchy tree to inspect structured metadata, direct sub-units, leadership timeline, and change history.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {createParentUnit ? `Add Sub-Unit under ${createParentUnit.name}` : "Create Root Organization Unit"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {createParentUnit
                ? `Creating a new organizational unit situated beneath ${createParentUnit.name} (${createParentUnit.code}).`
                : "Initialize or register a top-level organizational entity."}
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

      {/* Move Subtree Modal Dialog */}
      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={moveTargetUnit}
        onSuccess={() => {}}
      />

      {/* Delete Unit Modal Dialog */}
      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={deleteTargetUnit}
        onSuccess={() => setSelectedUnitId(null)}
      />
    </div>
  );
}
