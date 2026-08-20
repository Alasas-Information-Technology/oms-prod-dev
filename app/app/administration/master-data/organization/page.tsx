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
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Load detailed info for right-hand quick inspector
  const { data: selectedDetail, isLoading: isLoadingDetail } = useOrgUnit(selectedUnitId || "");
  const { data: typesData } = useOrgUnitTypes();

  const typesMap = React.useMemo(() => {
    const map = new Map<number, OrgUnitTypeDto>();
    typesData?.forEach((t) => map.set(t.orgUnitTypeId, t));
    return map;
  }, [typesData]);

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
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/app/administration/security-dashboard" className="hover:text-foreground">
              Administration
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Master Data</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Organization Structure</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-primary" />
            Organization Hierarchy
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore, manage, and reorganize the holding company hierarchy with transitive closure tree maintenance.
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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Tree Explorer */}
        <Card className="lg:col-span-7 shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-primary" />
                  Hierarchy Tree
                </CardTitle>
                <CardDescription className="text-xs">
                  Click nodes to inspect attributes. Lazy-loads children dynamically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[750px] overflow-y-auto">
            <OrgTree
              selectedId={selectedUnitId}
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
          </CardContent>
        </Card>

        {/* Right Inspector */}
        <Card className="lg:col-span-5 shadow-sm border-border sticky top-6">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Unit Details & Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Direct attributes, leadership head, and quick management actions.
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
                    Click any node in the hierarchy tree to view its complete properties.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header Information */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        {selectedDetail.code}
                      </span>
                      {(selectedDetail.type?.name || (selectedDetail.orgUnitTypeId ? typesMap.get(selectedDetail.orgUnitTypeId)?.name : undefined)) && (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 uppercase">
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
                  <div className="p-2.5 rounded-lg bg-muted/40 text-xs flex items-center gap-1.5 flex-wrap">
                    <span className="text-muted-foreground font-medium">Path:</span>
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

                {/* Leadership Head */}
                <div className="p-3 rounded-lg border border-border bg-card flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Primary Head Manager
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedDetail.head ? (selectedDetail.head.displayName || selectedDetail.head.userDisplayName) : "Unassigned"}
                    </p>
                    {(selectedDetail.head?.email || selectedDetail.head?.userEmail) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedDetail.head.email || selectedDetail.head.userEmail}
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

                {/* Quick Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Button asChild className="w-full justify-center gap-2">
                    <Link href={`/app/administration/master-data/organization/${selectedDetail.orgUnitId}`}>
                      <ExternalLink className="h-4 w-4" />
                      View Full Details & Management Tabs
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
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
                        className="gap-1.5"
                      >
                        <Power className="h-3.5 w-3.5" />
                        {selectedDetail.isActive ? "Deactivate" : "Activate"}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="h-5 w-5 text-primary" />
              Create Organization Unit
            </DialogTitle>
            <DialogDescription>
              {createParentUnit ? (
                <>
                  Creating child unit under <span className="font-semibold text-foreground">{createParentUnit.name}</span> ({createParentUnit.code}).
                </>
              ) : (
                "Add a new node to the enterprise organization structure."
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
