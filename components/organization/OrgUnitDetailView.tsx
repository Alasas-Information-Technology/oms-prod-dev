"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  Clock,
  History,
  Plus,
  Loader2,
  Users,
  ExternalLink,
  ShieldCheck,
  Building,
  FolderTree,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { OrgTypeIcon, OrgBreadcrumb, UnitPath, OrgBreadcrumbItem } from "@/components/oms/org";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { ManagerAssignmentPanel } from "@/components/organization/ManagerAssignmentPanel";
import {
  useOrgUnit,
  useOrgUnitChildren,
  useOrgUnitAncestors,
  useOrgUnitChangeLog,
  useApprovalChain,
  useBudgetOwner,
  useUpdateOrgUnit,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
  useAllowedParentTypes,
  useOrgUnitTypes,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitDetailDto,
  OrgUnitSummaryDto,
  OrgUnitEntity,
  OrgUnitChangeLogDto,
  UpdateOrgUnitDto,
  CreateOrgUnitDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

export interface OrgUnitDetailViewProps {
  unitId: string;
  onNavigateUnit?: (targetUnitId: string) => void;
  isPushedRoute?: boolean;
  className?: string;
}

/**
 * Derives dynamic child tab and sub-unit terminology based on parent unit type.
 */
function getChildTabMeta(canonicalLevel?: number, typeCode?: string): {
  tabLabel: string;
  singularLabel: string;
  emptyPrompt: string;
  targetTypeId?: number;
} {
  if (typeCode === "ORGANIZATION" || canonicalLevel === 1) {
    return {
      tabLabel: "Business Units",
      singularLabel: "Business Unit",
      emptyPrompt: "No business units yet. Add an executive division to structure this holding organization.",
      targetTypeId: 2,
    };
  }
  if (typeCode === "BUSINESS_UNIT" || canonicalLevel === 2) {
    return {
      tabLabel: "Departments",
      singularLabel: "Department",
      emptyPrompt: "No departments yet. Add functional departments to assign cost centers and budget owners.",
      targetTypeId: 3,
    };
  }
  if (typeCode === "DEPARTMENT" || canonicalLevel === 3) {
    return {
      tabLabel: "Sections",
      singularLabel: "Section",
      emptyPrompt: "No sections yet. Add operational teams beneath this department.",
      targetTypeId: 4,
    };
  }
  return {
    tabLabel: "Sub-Units",
    singularLabel: "Sub-Unit",
    emptyPrompt: "No child units under this unit.",
    targetTypeId: undefined,
  };
}

/**
 * OrgUnitDetailView — Unit Detail Screen with Tabs.
 *
 * Implements:
 * - Part 3.1 & 3.2: Two-pane and pushed route support, clickable lineage breadcrumb.
 * - Overview tab: Structured definition list (<dl>), read-first, with dialog edit.
 * - Child tab: Dynamic label ("Departments" under BU, "Sections" under Dept).
 * - People tab: Temporal leadership timeline reusing components/oms/Timeline.
 * - History tab: Reverse-chronological OrgUnitChangeLog with old → new parent movement.
 * - Part 2.7: Indented skeleton loading and genuine 404 page for scoped denial (no 403 leaks).
 */
export function OrgUnitDetailView({
  unitId,
  onNavigateUnit,
  isPushedRoute = false,
  className,
}: OrgUnitDetailViewProps) {
  const router = useRouter();
  const { can } = usePermission();

  const [activeTab, setActiveTab] = React.useState("overview");
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = React.useState(false);

  // Queries
  const {
    data: unit,
    isLoading: isLoadingUnit,
    isError: isErrorUnit,
    refetch: refetchUnit,
  } = useOrgUnit(unitId);

  const { data: ancestorsList } = useOrgUnitAncestors(unitId);
  const { data: childrenList, isLoading: isLoadingChildren } = useOrgUnitChildren(unitId);
  const { data: changeLogsData, isLoading: isLoadingLogs } = useOrgUnitChangeLog(unitId, 1, 50);
  const { data: approvalChain, isLoading: isLoadingChain } = useApprovalChain(unitId);
  const { data: budgetOwner, isLoading: isLoadingBudget } = useBudgetOwner(unitId);
  const { data: typesList } = useOrgUnitTypes();

  // Mutations
  const updateMutation = useUpdateOrgUnit();
  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  // Compute Breadcrumb Lineage Items
  const breadcrumbItems: OrgBreadcrumbItem[] = React.useMemo(() => {
    if (!unit) return [];
    const list: OrgBreadcrumbItem[] = [];

    if (ancestorsList && ancestorsList.length > 0) {
      ancestorsList.forEach((a) => {
        list.push({
          orgUnitId: a.orgUnitId,
          name: a.name,
          nameAr: a.nameAr || undefined,
          code: a.code,
          typeCode: a.type?.code || a.orgUnitType?.code,
          href: `/app/administration/master-data/organization/${a.orgUnitId}`,
        });
      });
    }

    list.push({
      orgUnitId: unit.orgUnitId,
      name: unit.name,
      nameAr: unit.nameAr || undefined,
      code: unit.code,
      typeCode: unit.type?.code || unit.orgUnitType?.code,
    });

    return list;
  }, [unit, ancestorsList]);

  // Derived Child Tab Metadata
  const typeCode = unit?.type?.code || unit?.orgUnitType?.code;
  const canonicalLevel = unit?.type?.canonicalLevel || unit?.orgUnitType?.canonicalLevel || unit?.depth || 1;
  const childMeta = getChildTabMeta(canonicalLevel, typeCode);

  // Loading State: Skeleton Screen (Part 2.7)
  if (isLoadingUnit) {
    return (
      <div className={cn("space-y-6 p-6", className)} aria-label="Loading unit details...">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64 rounded" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-12 rounded" />
              <Skeleton className="h-7 w-48 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // Error State / Genuine 404 Page (Part 2.7 & §9.3)
  if (isErrorUnit || !unit) {
    return (
      <div className={cn("p-12 text-center flex flex-col items-center justify-center min-h-[450px] space-y-4 bg-card rounded-2xl border border-border", className)}>
        <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
          <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-bold text-foreground">Organization Unit Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested organization unit does not exist or is not visible within your assigned organizational scope.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUnit()}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
          <Button asChild size="sm" className="text-xs">
            <Link href="/app/administration/master-data/organization">
              Return to Organization Tree
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateSubmit = async (data: UpdateOrgUnitDto) => {
    try {
      await updateMutation.mutateAsync({ id: unit.orgUnitId, dto: data });
      toast.success(`Unit ${data.name} updated successfully.`);
      setIsEditOpen(false);
      refetchUnit();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update organization unit.";
      toast.error(errorMsg);
    }
  };

  const handleAddChildSubmit = async (data: CreateOrgUnitDto) => {
    try {
      await createMutation.mutateAsync({ ...data, parentOrgUnitId: unit.orgUnitId });
      toast.success(`Sub-unit ${data.name} (${data.code}) created successfully.`);
      setIsAddChildOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create sub-unit.";
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async () => {
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
      refetchUnit();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update unit status.";
      toast.error(errorMsg);
    }
  };

  const statusType: OMSStatus = unit.isActive ? "active" : "terminated";

  // Child Units Table Columns
  const childrenColumns: ColumnDef<OrgUnitSummaryDto>[] = [
    {
      key: "code",
      header: "Code",
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted rounded border border-border/40">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-xs">{row.name}</span>
          {row.nameAr && (
            <span dir="rtl" lang="ar" className="text-[11px] text-muted-foreground font-arabic">
              {row.nameAr}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_, row) => (
        <OrgTypeIcon
          type={row.type?.code || row.orgUnitType?.code || "DEP"}
          size="sm"
          showLabel
        />
      ),
    },
    {
      key: "head",
      header: "Primary Head",
      render: (_, row) =>
        row.head?.displayName || row.head?.userDisplayName ? (
          <span className="text-xs font-medium text-foreground flex items-center gap-1">
            <Crown className="h-3 w-3 text-primary" />
            {row.head.displayName || row.head.userDisplayName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
    {
      key: "descendants",
      header: "Subtree Units",
      align: "right",
      render: (_, row) => (
        <span className="font-mono text-xs text-right tabular-nums text-muted-foreground">
          {row.childCount ?? row.descendantCount ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <StatusBadge status={row.isActive ? "active" : "terminated"} size="sm" showDot />,
    },
  ];

  const childrenRowActions: RowAction<OrgUnitSummaryDto>[] = [
    {
      label: "View Unit Details",
      icon: <ChevronRight className="h-4 w-4 text-primary" />,
      onClick: (row) => {
        if (onNavigateUnit) {
          onNavigateUnit(row.orgUnitId);
        } else {
          router.push(`/app/administration/master-data/organization/${row.orgUnitId}`);
        }
      },
    },
  ];

  return (
    <div className={cn("space-y-6 flex flex-col h-full", className)}>
      {/* Top Clickable Lineage Breadcrumb (Part 1.3 & Prompt U2) */}
      <div className="pb-2 border-b border-border">
        <OrgBreadcrumb
          items={breadcrumbItems}
          maxVisible={4}
          showSigils={true}
          showCodes={true}
          onSelect={(item) => {
            if (item.orgUnitId) {
              if (onNavigateUnit) {
                onNavigateUnit(item.orgUnitId);
              } else {
                router.push(`/app/administration/master-data/organization/${item.orgUnitId}`);
              }
            }
          }}
        />
      </div>

      {/* Main Entity Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
            {canonicalLevel === 1 ? (
              <Building2 className="h-6 w-6" />
            ) : canonicalLevel === 2 ? (
              <Building className="h-6 w-6" />
            ) : (
              <FolderTree className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <OrgTypeIcon type={typeCode || "DEP"} size="md" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {unit.name}
              </h1>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                {unit.code}
              </span>
              <StatusBadge status={statusType} size="sm" showDot />
            </div>
            {unit.nameAr && (
              <p dir="rtl" lang="ar" className="text-xs text-muted-foreground font-arabic">
                {unit.nameAr}
              </p>
            )}
          </div>
        </div>

        {/* Header Action CTAs (Gated on can()) */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {can(ORG_PERMISSIONS.UPDATE) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Unit
            </Button>
          )}

          {can(ORG_PERMISSIONS.MOVE) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoveOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
              Move Unit
            </Button>
          )}

          {can(ORG_PERMISSIONS.CREATE) && (
            <Button
              size="sm"
              onClick={() => setIsAddChildOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Add {childMeta.singularLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl w-full sm:w-auto self-start border border-border/60">
          <TabsTrigger value="overview" className="text-xs gap-1.5 px-3.5 py-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="children" className="text-xs gap-1.5 px-3.5 py-1.5">
            <Layers className="h-3.5 w-3.5" />
            {childMeta.tabLabel} ({childrenList?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="people" className="text-xs gap-1.5 px-3.5 py-1.5">
            <Users className="h-3.5 w-3.5" />
            People & Leadership
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5 px-3.5 py-1.5">
            <History className="h-3.5 w-3.5" />
            History ({changeLogsData?.total || 0})
          </TabsTrigger>
        </TabsList>

        {/* ===================================================================== */}
        {/* Tab 1: Overview (Read-First Definition List per §3.2) */}
        {/* ===================================================================== */}
        <TabsContent value="overview" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Definition List */}
            <Card className="lg:col-span-2 border border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Organization Unit Metadata
                </CardTitle>
                <CardDescription className="text-xs">
                  Canonical structure and operational attributes. Read-only view.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Type Identifier</dt>
                    <dd className="flex items-center gap-2 font-semibold text-foreground">
                      <OrgTypeIcon type={typeCode || "DEP"} size="sm" />
                      <span>{unit.type?.name || unit.orgUnitType?.name || "Department"}</span>
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Short Code</dt>
                    <dd className="font-mono font-semibold text-foreground text-sm">
                      {unit.code}
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Reports To (Parent)</dt>
                    <dd className="font-medium text-foreground">
                      {unit.parentName ? (
                        <button
                          type="button"
                          onClick={() => unit.parentOrgUnitId && onNavigateUnit?.(unit.parentOrgUnitId)}
                          className="hover:underline text-primary text-left font-semibold"
                        >
                          {unit.parentName} {unit.parentCode && `(${unit.parentCode})`}
                        </button>
                      ) : (
                        <span className="text-muted-foreground italic">Root Holding Company (Level 1)</span>
                      )}
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Cost Centre Code</dt>
                    <dd className="font-mono text-foreground font-medium">
                      {unit.costCenterCode || <span className="text-muted-foreground italic">Not Assigned</span>}
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Active Primary Head</dt>
                    <dd className="font-medium text-foreground flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {unit.head?.displayName || unit.head?.userDisplayName || (
                          <span className="text-muted-foreground italic">No primary head assigned</span>
                        )}
                      </span>
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Effective Tenure</dt>
                    <dd className="font-medium text-foreground">
                      {unit.effectiveFrom ? String(unit.effectiveFrom).split("T")[0] : "—"} →{" "}
                      {unit.effectiveTo ? String(unit.effectiveTo).split("T")[0] : "Present (Ongoing)"}
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Subtree Units Count</dt>
                    <dd className="font-mono text-foreground font-semibold tabular-nums">
                      {unit.descendantCount ?? unit.childCount ?? 0} units
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Budget Ownership Capability</dt>
                    <dd className="font-medium text-foreground">
                      {unit.allowsBudget ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                          BUDGET OWNER CAPABLE
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Standard Operational Subunit</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Right 1 Col: Approval Chain & Budget Owner Cards */}
            <div className="space-y-4">
              {/* Budget Ownership Resolution */}
              <Card className="border border-border shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    Budget Owning Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  {isLoadingBudget ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Resolving budget owner...
                    </div>
                  ) : budgetOwner ? (
                    <div>
                      <p className="font-bold text-foreground">{budgetOwner.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {budgetOwner.code} · Cost Centre: {budgetOwner.costCenterCode || "None"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No budget owner resolved.</p>
                  )}
                </CardContent>
              </Card>

              {/* 14-Stage Approval Chain Preview */}
              <Card className="border border-border shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Hierarchy Escalation Chain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {isLoadingChain ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Resolving escalation stages...
                    </div>
                  ) : approvalChain && approvalChain.length > 0 ? (
                    <div className="space-y-1.5">
                      {approvalChain.map((node, idx) => (
                        <div key={node.orgUnitId || idx} className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-none">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <span className="font-mono text-[10px] text-muted-foreground">#{idx + 1}</span>
                            {node.name}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {node.head?.displayName || "Vacant"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No escalation path available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 2: Child Units (Departments / Sections DataTable per §3.2) */}
        {/* ===================================================================== */}
        <TabsContent value="children" className="space-y-4 m-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{childMeta.tabLabel} Directory</h3>
              <p className="text-xs text-muted-foreground">
                Direct child organization units reporting to {unit.name}.
              </p>
            </div>
            {can(ORG_PERMISSIONS.CREATE) && (
              <Button
                size="sm"
                onClick={() => setIsAddChildOpen(true)}
                className="gap-1.5 text-xs h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Add {childMeta.singularLabel}
              </Button>
            )}
          </div>

          <DataTable
            keyField="orgUnitId"
            data={childrenList || []}
            columns={childrenColumns}
            rowActions={childrenRowActions}
            loading={isLoadingChildren}
            enableSearch={true}
            emptyMessage={childMeta.emptyPrompt}
          />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 3: People & Leadership (Temporal Timeline per Part 2.3) */}
        {/* ===================================================================== */}
        <TabsContent value="people" className="space-y-4 m-0">
          <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 4: Change History (Audit Log Feed per §3.2) */}
        {/* ===================================================================== */}
        <TabsContent value="history" className="space-y-4 m-0">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Forensic Change Log Feed
              </CardTitle>
              <CardDescription className="text-xs">
                Reverse-chronological record of organizational restructuring events and tenant modifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingLogs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
                <div className="space-y-3 divide-y divide-border/60">
                  {changeLogsData.data.map((log: OrgUnitChangeLogDto) => {
                    const isMove = log.changeType === "MOVED" || log.changeType === "REPARENT";
                    const isManager = log.changeType === "MANAGER_ASSIGNED" || log.changeType === "MANAGER_REMOVED";

                    const oldParent = log.oldValues?.parentName || log.oldValues?.parentOrgUnitId || "Root";
                    const newParent = log.newValues?.parentName || log.newValues?.parentOrgUnitId || "Root";

                    return (
                      <div key={log.changeLogId} className="pt-3 first:pt-0 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isMove ? "default" : isManager ? "secondary" : "outline"}
                              className="font-mono text-[10px] uppercase py-0"
                            >
                              {log.changeType}
                            </Badge>
                            <span className="font-semibold text-foreground">
                              {log.changeType === "MOVED"
                                ? `Unit moved under ${newParent}`
                                : `${log.changeType} event recorded`}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {log.performedAt ? new Date(log.performedAt).toLocaleString() : "—"}
                          </span>
                        </div>

                        {/* Movement Blast Radius Info (Part 2.2 & §3.2) */}
                        {isMove && (
                          <div className="p-2 rounded bg-muted/40 border border-border/50 text-[11px] space-y-0.5 mt-1 font-mono">
                            <p>
                              Lineage change: <span className="text-muted-foreground">{oldParent}</span> →{" "}
                              <span className="text-primary font-bold">{newParent}</span>
                            </p>
                            {log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                              <p className="text-muted-foreground">
                                Subtree affected: {log.affectedNodeCount} descendant unit(s) recalculated.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-0.5">
                          <span>Operator: {log.performedByDisplayName || log.performedBy || "System Admin"}</span>
                          {log.reason && <span>Reason: {log.reason}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No change history records logged for this organization unit.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Unit Modal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Organization Unit</DialogTitle>
            <DialogDescription className="text-xs">
              Update organization properties for <span className="font-bold text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            initialData={unit}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setIsEditOpen(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Add Sub-Unit Modal Dialog */}
      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-xs">
              Creating a new {childMeta.singularLabel.toLowerCase()} situated directly beneath{" "}
              <span className="font-bold text-foreground">{unit.name}</span> ({unit.code}).
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            parentUnit={unit}
            targetTypeId={childMeta.targetTypeId}
            onSubmit={handleAddChildSubmit}
            onCancel={() => setIsAddChildOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Move Subtree Modal Dialog */}
      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      {/* Delete Unit Modal Dialog */}
      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={unit}
        onSuccess={() => {
          if (onNavigateUnit) {
            onNavigateUnit("");
          } else {
            router.push("/app/administration/master-data/organization");
          }
        }}
      />
    </div>
  );
}
