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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import { OrgTree } from "@/components/organization/OrgTree";
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
import { cn } from "@/components/ui/utils";

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

  // Load detailed info for right-hand quick inspector
  const { data: selectedDetail, isLoading: isLoadingDetail } = useOrgUnit(selectedUnitId || "");
  const { data: typesData } = useOrgUnitTypes();

  // Load all units for quick metric summary and card view
  const { data: allUnitsData, isLoading: isLoadingAllUnits } = useOrgUnits({
    page: 1,
    pageSize: 500,
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
    <div className="space-y-6">
      {/* Top Header & Actions - Matching Standard Original Heading Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Organization Structure
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual company hierarchy, leadership structure, and department management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {can(ORG_PERMISSIONS.EXPORT) && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 shadow-xs"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          )}

          {can(ORG_PERMISSIONS.CREATE) && (
            <Button
              onClick={() => {
                setCreateParentUnit(null);
                setIsCreateOpen(true);
              }}
              className="gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              New Unit
            </Button>
          )}
        </div>
      </div>

      {/* 1-Step Quick Stats & Level Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <span className="text-[11px] text-muted-foreground">Holding hierarchy</span>
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
            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.businessUnits || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Executive divisions</span>
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
            <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.departments || "—"}</p>
          <span className="text-[11px] text-muted-foreground">Budget owners</span>
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

      {/* Main Split Layout with Tree & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Explorer Panel */}
        <Card className="lg:col-span-7 shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FolderTree className="h-4.5 w-4.5 text-primary" />
                  Organization Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  {viewMode === "tree" ? "Click any unit to inspect details. Hover to reveal quick 1-click actions." : "Showing directory cards with instant management actions."}
                </CardDescription>
              </div>

              {/* View Switcher & Expand All Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {viewMode === "tree" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setExpandAll((prev) => (prev === true ? false : true))}
                  >
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    {expandAll ? "Collapse All" : "Expand All"}
                  </Button>
                )}

                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50">
                  <Button
                    variant={viewMode === "tree" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => setViewMode("tree")}
                  >
                    <ListTree className="h-3.5 w-3.5" />
                    Tree
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Cards
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 max-h-[750px] overflow-y-auto">
            {viewMode === "tree" ? (
              <OrgTree
                selectedId={selectedUnitId}
                forceExpandAll={expandAll}
                onSelectUnit={(unit) => setSelectedUnitId(unit.orgUnitId)}
                onAddChild={(parent) => {
                  setCreateParentUnit(parent);
                  setIsCreateOpen(true);
                }}
                onMoveUnit={(unit) => {
                  setMoveTargetUnit(unit);
                  setIsMoveOpen(true);
                }}
                onDeleteUnit={(unit) => {
                  setDeleteTargetUnit(unit);
                  setIsDeleteOpen(true);
                }}
                onToggleActiveUnit={(unit) => handleToggleActive(unit)}
              />
            ) : (
              /* Cards View for Easy Non-Technical Browsing */
              <div className="space-y-4">
                {/* Search Bar in Cards Mode */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter cards by name, code, or Arabic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                {isLoadingAllUnits ? (
                  <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading organization units...</span>
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                    No organization units found matching your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCards.map((unit) => {
                      const type = unit.orgUnitTypeId ? typesMap.get(unit.orgUnitTypeId) : undefined;
                      const isSelected = selectedUnitId === unit.orgUnitId;
                      return (
                        <div
                          key={unit.orgUnitId}
                          onClick={() => setSelectedUnitId(unit.orgUnitId)}
                          className={cn(
                            "p-4 rounded-xl border bg-card transition-all cursor-pointer hover:border-primary/50 hover:shadow-sm space-y-3",
                            isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-foreground border">
                                  {unit.code}
                                </span>
                                {type && (
                                  <Badge variant="outline" className="text-[10px] uppercase font-medium">
                                    {type.name}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-bold text-foreground text-sm">{unit.name}</h3>
                              {unit.nameAr && (
                                <p dir="rtl" className="text-xs text-muted-foreground font-arabic mt-0.5">
                                  {unit.nameAr}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={unit.isActive ? "active" : "terminated"} size="sm" />
                          </div>

                          {/* Action Buttons directly on Card (1-Click Friendly) */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                            <span className="text-muted-foreground font-mono">
                              {unit.childCount || 0} sub-units
                            </span>

                            <div className="flex items-center gap-1.5">
                              {can(ORG_PERMISSIONS.CREATE) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCreateParentUnit(unit);
                                    setIsCreateOpen(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Sub-Unit
                                </Button>
                              )}

                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link href={`/app/administration/master-data/organization/${unit.orgUnitId}`}>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Inspector Panel */}
        <Card className="lg:col-span-5 shadow-sm border-border sticky top-6">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-primary" />
              Unit Details & Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Overview, leadership assignments, and one-click operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingDetail ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">Loading unit details...</span>
              </div>
            ) : !selectedDetail ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-medium text-foreground">No unit selected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any node in the tree or card directory to view details instantly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header Information */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border">
                        {selectedDetail.code}
                      </span>
                      {(selectedDetail.type?.name || (selectedDetail.orgUnitTypeId ? typesMap.get(selectedDetail.orgUnitTypeId)?.name : undefined)) && (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 uppercase font-medium">
                          {selectedDetail.type?.name || (selectedDetail.orgUnitTypeId ? typesMap.get(selectedDetail.orgUnitTypeId)?.name : "")}
                        </Badge>
                      )}
                      <StatusBadge
                        status={selectedDetail.isActive ? "active" : "terminated"}
                        size="sm"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{selectedDetail.name}</h2>
                    {selectedDetail.nameAr && (
                      <p dir="rtl" className="text-sm text-muted-foreground font-arabic mt-0.5">
                        {selectedDetail.nameAr}
                      </p>
                    )}
                  </div>
                </div>

                {/* Breadcrumbs Path */}
                {selectedDetail.breadcrumb && selectedDetail.breadcrumb.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-muted/40 text-xs flex items-center gap-1.5 flex-wrap border">
                    <span className="text-muted-foreground font-medium">Hierarchy:</span>
                    {selectedDetail.breadcrumb.map((b, idx) => (
                      <React.Fragment key={b.orgUnitId}>
                        {idx > 0 && <span className="text-muted-foreground/60">/</span>}
                        <span
                          className={
                            b.orgUnitId === selectedDetail.orgUnitId
                              ? "font-bold text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {b.code}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Primary Head Leader Card */}
                <div className="p-3.5 rounded-xl border bg-card flex items-center gap-3.5 shadow-2xs">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">
                      Primary Head of Unit
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedDetail.head ? (selectedDetail.head.displayName || selectedDetail.head.userDisplayName) : "No Head Assigned"}
                    </p>
                    {(selectedDetail.head?.email || selectedDetail.head?.userEmail) ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedDetail.head.email || selectedDetail.head.userEmail}
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Assign a primary leader in the Managers tab
                      </p>
                    )}
                  </div>
                </div>

                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground">Direct Children</span>
                    <p className="text-lg font-bold text-foreground">{selectedDetail.childCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground">Subtree Descendants</span>
                    <p className="text-lg font-bold text-foreground">{selectedDetail.descendantCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground">Cost Center</span>
                    <p className="text-sm font-semibold text-foreground font-mono">
                      {selectedDetail.costCenterCode || "None"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground">Oracle Code</span>
                    <p className="text-sm font-semibold text-foreground font-mono">
                      {selectedDetail.oracleOrgCode || "None"}
                    </p>
                  </div>
                </div>

                {/* 1-Step Quick Actions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Button asChild className="w-full justify-center gap-2 shadow-xs">
                    <Link href={`/app/administration/master-data/organization/${selectedDetail.orgUnitId}`}>
                      <ExternalLink className="h-4 w-4" />
                      Open Full Unit Management Tabs
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    {can(ORG_PERMISSIONS.CREATE) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCreateParentUnit(selectedDetail);
                          setIsCreateOpen(true);
                        }}
                        className="gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Child
                      </Button>
                    )}

                    {can(ORG_PERMISSIONS.MOVE) && selectedDetail.depth > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMoveTargetUnit(selectedDetail);
                          setIsMoveOpen(true);
                        }}
                        className="gap-1.5"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Move Subtree
                      </Button>
                    )}

                    {can(ORG_PERMISSIONS.UPDATE) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(selectedDetail)}
                        className="gap-1.5 col-span-2"
                      >
                        <Power className="h-3.5 w-3.5" />
                        {selectedDetail.isActive ? "Deactivate Unit" : "Activate Unit"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-6 sm:p-8 overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
              <Building2 className="h-6 w-6 text-primary" />
              New Organization Unit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {createParentUnit ? (
                <>
                  Creating new sub-unit directly under <span className="font-semibold text-foreground">{createParentUnit.name}</span> ({createParentUnit.code}).
                </>
              ) : (
                "Add a new holding company, division, department, or operational section to your enterprise structure."
              )}
            </DialogDescription>
          </DialogHeader>

          <OrgUnitForm
            defaultParent={createParentUnit}
            onSubmit={handleCreateSubmit as (data: CreateOrgUnitDto) => Promise<void>}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Move Subtree Modal */}
      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={moveTargetUnit}
        onSuccess={() => {
          if (selectedUnitId === moveTargetUnit?.orgUnitId) {
            setSelectedUnitId(moveTargetUnit.orgUnitId);
          }
        }}
      />

      {/* Delete Unit Modal */}
      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={deleteTargetUnit}
        onSuccess={() => {
          if (selectedUnitId === deleteTargetUnit?.orgUnitId) {
            setSelectedUnitId(null);
          }
        }}
      />
    </div>
  );
}
