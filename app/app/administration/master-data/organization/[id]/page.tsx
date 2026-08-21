"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  ChevronRight,
  Edit2,
  ArrowRightLeft,
  Power,
  Trash2,
  Crown,
  Layers,
  Calendar,
  Mail,
  Phone,
  Wallet,
  GitCommit,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Loader2,
  Users,
  ExternalLink,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { ManagerAssignmentPanel } from "@/components/organization/ManagerAssignmentPanel";
import {
  useOrgUnit,
  useOrgUnitChildren,
  useOrgUnitChangeLog,
  useApprovalChain,
  useBudgetOwner,
  useUpdateOrgUnit,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitDetailDto,
  OrgUnitEntity,
  OrgUnitChangeLogDto,
  UpdateOrgUnitDto,
  CreateOrgUnitDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";

export default function OrgUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgUnitId = params.id as string;
  const { can } = usePermission();

  const [activeTab, setActiveTab] = React.useState("overview");
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = React.useState(false);

  const { data: unit, isLoading, refetch } = useOrgUnit(orgUnitId);
  const { data: childrenList, isLoading: isLoadingChildren } = useOrgUnitChildren(orgUnitId);
  const { data: changeLogsData, isLoading: isLoadingLogs } = useOrgUnitChangeLog(orgUnitId, 1, 50);
  const { data: approvalChain, isLoading: isLoadingChain } = useApprovalChain(orgUnitId);
  const { data: budgetOwner, isLoading: isLoadingBudget } = useBudgetOwner(orgUnitId);

  const updateMutation = useUpdateOrgUnit();
  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading organization unit...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Organization Unit Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The requested unit does not exist or is outside your visible data scope.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/app/administration/master-data/organization">
            Return to Organization Hierarchy
          </Link>
        </Button>
      </div>
    );
  }

  const handleUpdateSubmit = async (data: UpdateOrgUnitDto) => {
    try {
      await updateMutation.mutateAsync({ id: orgUnitId, dto: data });
      toast.success("Organization unit updated successfully.");
      setIsEditOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update organization unit.";
      toast.error(errorMsg);
    }
  };

  const handleAddChildSubmit = async (data: CreateOrgUnitDto) => {
    try {
      await createMutation.mutateAsync({ ...data, parentOrgUnitId: orgUnitId });
      toast.success(`Child unit ${data.name} created successfully.`);
      setIsAddChildOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create child unit.";
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (unit.isActive) {
        await deactivateMutation.mutateAsync({
          id: orgUnitId,
          effectiveTo: new Date().toISOString().split("T")[0],
        });
        toast.success(`Unit ${unit.name} deactivated.`);
      } else {
        await activateMutation.mutateAsync(orgUnitId);
        toast.success(`Unit ${unit.name} activated.`);
      }
      refetch();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to change status.";
      toast.error(errorMsg);
    }
  };

  // Children Table Columns
  const childrenColumns: ColumnDef<OrgUnitEntity>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (val, row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
          {String(val)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (val, row) => (
        <div>
          <Link
            href={`/app/administration/master-data/organization/${row.orgUnitId}`}
            className="text-sm font-medium hover:underline text-foreground"
          >
            {String(val)}
          </Link>
          {row.nameAr && (
            <p dir="rtl" className="text-xs text-muted-foreground font-arabic">
              {row.nameAr}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_, row) => (
        <Badge variant="outline" className="text-[10px] uppercase font-normal">
          {row.type?.name || "Unit"}
        </Badge>
      ),
    },
    {
      key: "head",
      header: "Head Manager",
      render: (_, row) => (
        <span className="text-xs text-foreground font-medium">
          {row.head ? (row.head.displayName || row.head.userDisplayName) : "—"}
        </span>
      ),
    },
    {
      key: "childCount",
      header: "Children",
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs text-muted-foreground">{String(val || 0)}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      align: "center",
      render: (val) => (
        <StatusBadge status={val ? "active" : "terminated"} size="sm" />
      ),
    },
  ];

  const childrenActions: RowAction<OrgUnitEntity>[] = [
    {
      label: "View Detail",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (row) => router.push(`/app/administration/master-data/organization/${row.orgUnitId}`),
    },
  ];

  // Change Log Table Columns
  const logColumns: ColumnDef<OrgUnitChangeLogDto>[] = [
    {
      key: "changeType",
      header: "Event",
      render: (val) => {
        const typeStr = String(val);
        const badgeColor =
          typeStr === "CREATED"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : typeStr === "MOVED"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
            : typeStr === "DEACTIVATED"
            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
            : "bg-muted text-foreground";

        return (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${badgeColor}`}>
            {typeStr}
          </span>
        );
      },
    },
    {
      key: "reason",
      header: "Reason / Details",
      render: (val, row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">{val ? String(val) : "System update"}</p>
          {row.oldValues && (
            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-md">
              Before: {JSON.stringify(row.oldValues)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "affectedNodeCount",
      header: "Affected Nodes",
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs font-semibold">{String(val || 1)}</span>
      ),
    },
    {
      key: "performedBy",
      header: "Actor",
      render: (val) => (
        <span className="font-mono text-xs text-muted-foreground truncate">{String(val).slice(0, 8)}...</span>
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (val) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(String(val)).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Unit Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-muted text-foreground">
                {unit.code}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {unit.type?.name}
              </Badge>
              <StatusBadge status={unit.isActive ? "active" : "terminated"} size="sm" />
              <span className="text-xs text-muted-foreground font-mono">Depth {unit.depth}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{unit.name}</h1>
            {unit.nameAr && (
              <p dir="rtl" className="text-sm text-muted-foreground font-arabic mt-0.5">
                {unit.nameAr}
              </p>
            )}
          </div>
        </div>

        {/* Mutation Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {can(ORG_PERMISSIONS.UPDATE) && (
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-1.5">
              <Edit2 className="h-4 w-4" />
              Edit Attributes
            </Button>
          )}

          {can(ORG_PERMISSIONS.MOVE) && unit.depth > 0 && (
            <Button variant="outline" size="sm" onClick={() => setIsMoveOpen(true)} className="gap-1.5">
              <ArrowRightLeft className="h-4 w-4" />
              Move Subtree
            </Button>
          )}

          {can(ORG_PERMISSIONS.UPDATE) && (
            <Button variant="outline" size="sm" onClick={handleToggleActive} className="gap-1.5">
              <Power className="h-4 w-4" />
              {unit.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}

          {can(ORG_PERMISSIONS.DELETE) && unit.depth > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Layout: Overview | Children | Managers | Change History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger value="overview" className="gap-2">
            <Layers className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="children" className="gap-2">
            <Building className="h-4 w-4" />
            Children ({unit.childCount})
          </TabsTrigger>
          <TabsTrigger value="managers" className="gap-2">
            <Users className="h-4 w-4" />
            Managers
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Change History
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Resolution Cards: Budget Owner & Approval Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Owner Card */}
            <Card className="shadow-xs border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Budget Authority Owner
                </CardTitle>
                <CardDescription className="text-xs">
                  Nearest ancestor unit with AllowsBudget = 1 authority.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBudget ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resolving budget owner...
                  </div>
                ) : budgetOwner ? (
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                          {budgetOwner.code}
                        </span>
                        <span className="text-sm font-bold text-foreground">{budgetOwner.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {budgetOwner.orgUnitTypeName || budgetOwner.orgUnitTypeCode}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Head: {budgetOwner.head ? (budgetOwner.head.displayName || budgetOwner.head.userDisplayName) : "Unassigned"}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-emerald-600 text-[10px]">
                      BUDGET AUTHORIZED
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No ancestor unit with budget authority.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Approval Chain Card */}
            <Card className="shadow-xs border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-primary" />
                  Hierarchical Approval Chain
                </CardTitle>
                <CardDescription className="text-xs">
                  Ascending ancestor hierarchy and active primary HEAD managers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingChain ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resolving approval chain...
                  </div>
                ) : approvalChain && approvalChain.length > 0 ? (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {approvalChain.map((node, idx) => (
                      <div
                        key={node.orgUnitId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          <span className="font-mono font-semibold px-1 py-0.2 rounded bg-muted">
                            {node.code}
                          </span>
                          <span className="font-medium text-foreground">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {node.head ? (
                            <span className="font-medium text-primary">
                              {node.head.displayName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">No Active Head</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No approval chain available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Attributes Grid */}
          <Card className="shadow-xs border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Unit Attributes & Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Short Name</span>
                  <p className="font-medium text-foreground mt-0.5">{unit.shortName || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Cost Center Code</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">{unit.costCenterCode || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Oracle Org Code</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">{unit.oracleOrgCode || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Contact Email</span>
                  <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {unit.emailAddress || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Contact Phone</span>
                  <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {unit.phoneNumber || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Display Sort Order</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">{unit.sortOrder}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Effective From</span>
                  <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {String(unit.effectiveFrom).split("T")[0]}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Effective To</span>
                  <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {unit.effectiveTo ? String(unit.effectiveTo).split("T")[0] : "Indefinite"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Descendant Node Count</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{unit.descendantCount}</p>
                </div>
              </div>

              {unit.description && (
                <div className="mt-6 pt-4 border-t border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Description & Mandate</span>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{unit.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Children */}
        <TabsContent value="children" className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-semibold text-foreground">Direct Child Units</h3>
              <p className="text-xs text-muted-foreground">
                Organization units immediately situated below {unit.name}.
              </p>
            </div>
            {can(ORG_PERMISSIONS.CREATE) && (
              <Button onClick={() => setIsAddChildOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Child Unit
              </Button>
            )}
          </div>

          <DataTable
            columns={childrenColumns}
            data={childrenList || []}
            keyField="orgUnitId"
            loading={isLoadingChildren}
            emptyMessage="No child organization units under this node."
            rowActions={childrenActions}
          />
        </TabsContent>

        {/* Tab 3: Managers */}
        <TabsContent value="managers" className="space-y-4">
          <ManagerAssignmentPanel orgUnitId={orgUnitId} unitName={unit.name} />
        </TabsContent>

        {/* Tab 4: Change History */}
        <TabsContent value="history" className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Audit Log & Structural History</h3>
            <p className="text-xs text-muted-foreground">
              Immutable change log record for {unit.name} capturing all attribute and structural transitions.
            </p>
          </div>

          <DataTable
            columns={logColumns}
            data={changeLogsData?.data || []}
            keyField="changeLogId"
            loading={isLoadingLogs}
            emptyMessage="No historical change log records found."
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-6 sm:p-8 overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold text-foreground">Edit Organization Unit</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update attributes and contact information for <span className="font-semibold text-foreground">{unit.name}</span> ({unit.code}).
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            initialData={unit}
            isEdit={true}
            onSubmit={handleUpdateSubmit as (data: CreateOrgUnitDto | UpdateOrgUnitDto) => Promise<void>}
            onCancel={() => setIsEditOpen(false)}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Add Child Dialog */}
      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-6 sm:p-8 overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold text-foreground">Add Sub-Unit</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a child organization unit directly under <span className="font-semibold text-foreground">{unit.name}</span> ({unit.code}).
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            defaultParent={unit}
            onSubmit={handleAddChildSubmit as (data: CreateOrgUnitDto | UpdateOrgUnitDto) => Promise<void>}
            onCancel={() => setIsAddChildOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={unit}
        onSuccess={() => refetch()}
      />

      {/* Delete Dialog */}
      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={unit}
        onSuccess={() => router.push("/app/administration/master-data/organization")}
      />
    </div>
  );
}
