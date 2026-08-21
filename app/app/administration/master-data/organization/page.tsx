"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  Layers,
  Loader2,
  Briefcase,
  CheckCircle2,
  ChevronsUpDown,
  LayoutGrid,
  ListTree,
  Network,
  ChevronRight,
  Eye,
  X,
  Sparkles,
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

import { OrgChartCanvas } from "@/components/organization/OrgChartCanvas";
import { OrgTree } from "@/components/organization/OrgTree";
import { OrgGroupedView } from "@/components/organization/OrgGroupedView";
import { OrgUnitDetailView } from "@/components/organization/OrgUnitDetailView";
import { AddOrgUnitWizard } from "@/components/organization/AddOrgUnitWizard";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { ArchiveUnitDialog } from "@/components/organization/ArchiveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { OrgTypeIcon, UnitPath } from "@/components/oms/org";

import {
  useOrgUnit,
  useOrgUnits,
  useOrgUnitTypes,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
  useAssignManager,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import { orgUnitsApi } from "@/lib/api/organization";
import {
  OrgUnitSummaryDto,
  OrgUnitDetailDto,
  OrgUnitEntity,
  CreateOrgUnitDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

const STORAGE_KEY_VIEW_MODE = "oms_org_view_mode_v2";

export default function OrganizationPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading organisation...</div>}>
      <OrganizationPageContent />
    </React.Suspense>
  );
}

function OrganizationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermission();

  // Read URL params
  const urlView = searchParams.get("view");
  const urlType = searchParams.get("type") ? Number(searchParams.get("type")) : null;
  const deepLinkUnitId = searchParams.get("unit") || searchParams.get("node");

  // View Mode: "chart" (default) | "list" | "grouped" (Part 3.1)
  const [viewMode, setViewMode] = React.useState<"chart" | "list" | "grouped">(() => {
    if (urlView === "chart" || urlView === "list" || urlView === "grouped") {
      return urlView;
    }
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

  // Global Header Search
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [dismissedMobileNotice, setDismissedMobileNotice] = React.useState<boolean>(false);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createParentUnit, setCreateParentUnit] = React.useState<OrgUnitSummaryDto | OrgUnitEntity | null>(null);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [moveTargetUnit, setMoveTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [archiveTargetUnit, setArchiveTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteTargetUnit, setDeleteTargetUnit] = React.useState<OrgUnitDetailDto | OrgUnitSummaryDto | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [treeExpandAll, setTreeExpandAll] = React.useState<boolean | undefined>(undefined);

  // Mobile viewport detection & auto-list fallback (Prompt V9 / Part 6)
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !sessionStorage.getItem(STORAGE_KEY_VIEW_MODE) && !urlView) {
        setViewMode("list");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [urlView]);

  // Load units
  const { data: allUnitsData, isLoading: isLoadingAllUnits, refetch: refetchUnits } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const createMutation = useCreateOrgUnit();
  const assignManagerMutation = useAssignManager();

  // Persist view mode in session storage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
      } catch {
        // Ignore
      }
    }
  }, [viewMode]);

  // Sync with URL param changes
  React.useEffect(() => {
    if (urlView === "chart" || urlView === "list" || urlView === "grouped") {
      setViewMode(urlView);
    }
  }, [urlView]);

  // Click outside to close search dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global search matches
  const searchResults = React.useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q || !allUnitsData?.data) return [];
    return allUnitsData.data
      .filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(q);
        const nameArMatch = u.nameAr?.toLowerCase().includes(q);
        const codeMatch = u.code?.toLowerCase().includes(q);
        const headMatch = (u.head?.displayName || u.head?.userDisplayName || "").toLowerCase().includes(q);
        return nameMatch || nameArMatch || codeMatch || headMatch;
      })
      .slice(0, 8);
  }, [allUnitsData, globalSearch]);

  // Handle Search Result Click (Part 3.1: Jumps canvas & opens panel in Chart view)
  const handleSelectSearchResult = (unit: OrgUnitSummaryDto) => {
    setSelectedUnitId(unit.orgUnitId);
    setDetailPanelUnitId(unit.orgUnitId);
    setIsDetailOpen(true);
    setIsSearchDropdownOpen(false);
    setGlobalSearch("");
  };

  // Open details helper
  const handleOpenDetails = React.useCallback((unit: OrgUnitSummaryDto | OrgUnitEntity) => {
    setSelectedUnitId(unit.orgUnitId);
    setDetailPanelUnitId(unit.orgUnitId);
    setIsDetailOpen(true);
  }, []);

  // Handle Create Submit (Part 4.1 Guided Flow)
  const handleCreateSubmit = async (values: CreateOrgUnitDto, leaderUserId?: string | null) => {
    try {
      const created = await createMutation.mutateAsync(values);

      if (leaderUserId) {
        try {
          await assignManagerMutation.mutateAsync({
            unitId: created.orgUnitId,
            dto: {
              userId: leaderUserId,
              managerRoleCode: "HEAD",
              isPrimary: true,
              effectiveFrom: new Date().toISOString().split("T")[0],
            },
          });
        } catch {
          toast.warning("Unit created, but leader assignment could not be saved.");
        }
      }

      setIsCreateOpen(false);
      refetchUnits();

      const parentName = createParentUnit?.name || "Organisation";
      toast.success(`${created.name} added under ${parentName}.`);

      // Open detail panel for newly created unit
      setSelectedUnitId(created.orgUnitId);
      setDetailPanelUnitId(created.orgUnitId);
      setIsDetailOpen(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create unit.";
      toast.error(errorMsg);
    }
  };

  // Export Action (Gated on ORG.EXPORT, rate limit tier 7)
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const result = await orgUnitsApi.exportUnits({ isActive: true });
      if ("jobId" in result) {
        toast.info(`Export queued (Job #${result.jobId}). You will be notified when ready.`);
      } else {
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Organisation directory exported successfully.");
      }
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 429) {
        toast.error("Export rate limit reached (Tier 7). Please wait a moment before trying again.");
      } else {
        toast.error("Failed to export organisation data.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-20">
      {/* ========================================================================= */}
      {/* Top Header: "Organisation" + Search + 3-View Segmented Control + Actions  */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Organisation
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore and understand the reporting lines, departments, teams, and leadership.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Global Search across all 3 views (Part 3.1) */}
          <div ref={searchContainerRef} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search organisation..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              className="pl-8 pr-8 h-9 text-xs rounded-xl bg-card border-border shadow-2xs"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => {
                  setGlobalSearch("");
                  setIsSearchDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Live Search Results Dropdown */}
            {isSearchDropdownOpen && globalSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-card border border-border rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto space-y-1 animate-in fade-in-50">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => {
                    const typeCode = result.type?.code || result.orgUnitType?.code || "DEPARTMENT";
                    return (
                      <div
                        key={result.orgUnitId}
                        onClick={() => handleSelectSearchResult(result)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors text-xs"
                      >
                        <OrgTypeIcon type={typeCode} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">
                              {result.name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded border border-border/50">
                              {result.code}
                            </span>
                          </div>
                          {result.parentName && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              Part of {result.parentName}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    No matching departments or teams found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Segmented 3-View Control: [ Chart | List | Grouped ] (Part 3.1) */}
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

          {/* Export Action (Gated on ORG.EXPORT, rate limit tier 7) */}
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

      {/* Mobile list view recommendation banner (Prompt V9) */}
      {isMobile && !dismissedMobileNotice && (
        <div className="bg-muted/40 border border-border/70 rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between text-muted-foreground gap-3">
          <span>Showing list view on smaller screens for easier navigation.</span>
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === "list" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("chart")}
                className="h-6 text-xs text-primary hover:text-primary px-2"
              >
                View chart anyway
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-6 text-xs text-primary hover:text-primary px-2"
              >
                Switch to list
              </Button>
            )}
            <button
              onClick={() => setDismissedMobileNotice(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Dismiss notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* View 1: Chart View (Canvas + Slide-over Drawer) (Part 3.2 & 3.4)          */}
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
            onSwitchToList={() => setViewMode("list")}
            deepLinkUnitId={deepLinkUnitId}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* View 2: List View (Indented Tree + Split Pane Details) (Part 3.5)          */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <Card className="border border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ListTree className="h-4 w-4 text-primary" />
                    Organisation List
                  </CardTitle>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1 rounded-lg"
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
              <Card className="border border-border shadow-2xs p-5 sm:p-6 min-h-[740px]">
                <OrgUnitDetailView
                  unitId={selectedUnitId}
                  onNavigateUnit={(targetId) => setSelectedUnitId(targetId || null)}
                />
              </Card>
            ) : (
              <Card className="border border-border shadow-2xs p-12 text-center flex flex-col items-center justify-center min-h-[600px] space-y-3">
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
      {/* View 3: Grouped View (Flat Categorized Directory with Full Paths) (Part 3.6) */}
      {/* ========================================================================= */}
      {viewMode === "grouped" && (
        <OrgGroupedView
          selectedUnitId={selectedUnitId}
          onSelectUnit={(unit) => setSelectedUnitId(unit.orgUnitId)}
          onOpenDetails={handleOpenDetails}
          onMoveUnit={(unit) => {
            setMoveTargetUnit(unit as OrgUnitDetailDto);
            setIsMoveOpen(true);
          }}
          onArchiveUnit={(unit) => {
            setArchiveTargetUnit(unit as OrgUnitDetailDto);
            setIsArchiveOpen(true);
          }}
          onDeleteUnit={(unit) => {
            setDeleteTargetUnit(unit as OrgUnitDetailDto);
            setIsDeleteOpen(true);
          }}
          onAddUnit={() => {
            setCreateParentUnit(null);
            setIsCreateOpen(true);
          }}
          initialTypeFilter={urlType}
          searchQuery={globalSearch}
        />
      )}

      {/* ========================================================================= */}
      {/* Slide-Over Drawer for Details (Mounted on Chart / Grouped views) (Part 3.4) */}
      {/* ========================================================================= */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-y-auto border-l border-border bg-background shadow-2xl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Organisation Unit Details</SheetTitle>
            <SheetDescription>Detailed breakdown of reporting lines, teams, and staff.</SheetDescription>
          </SheetHeader>
          {detailPanelUnitId && (
            <div className="p-6 sm:p-8">
              <OrgUnitDetailView
                unitId={detailPanelUnitId}
                onNavigateUnit={(targetId) => {
                  if (targetId) {
                    setSelectedUnitId(targetId);
                    setDetailPanelUnitId(targetId);
                  } else {
                    setIsDetailOpen(false);
                  }
                }}
                onClose={() => setIsDetailOpen(false)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* Modal Dialogs: Add (4-step wizard), Move (3-step), Archive, Remove        */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Organisation Unit</DialogTitle>
            <DialogDescription className="text-xs">
              Follow the 4-step guided flow to add a department, business unit, or section.
            </DialogDescription>
          </DialogHeader>
          <AddOrgUnitWizard
            initialParent={createParentUnit}
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

      <ArchiveUnitDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        unit={archiveTargetUnit}
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
