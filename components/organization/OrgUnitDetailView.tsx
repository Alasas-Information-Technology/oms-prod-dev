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
  Trash2,
  Archive,
  Layers,
  Calendar,
  Wallet,
  Clock,
  History,
  Plus,
  Loader2,
  Users,
  ShieldCheck,
  Building,
  FolderTree,
  FileQuestion,
  RefreshCw,
  MoreHorizontal,
  User,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { OrgTypeIcon, UnitPath, OrgBreadcrumbItem } from "@/components/oms/org";
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
  onClose?: () => void;
  className?: string;
}

/**
 * Derives dynamic child tab and sub-unit terminology based on unit type.
 * Part 3.4: "Sections" under a department, "Departments" under a business unit.
 */
function getChildTabMeta(canonicalLevel?: number, typeCode?: string): {
  tabLabel: string;
  singularLabel: string;
  emptyPrompt: string;
  targetTypeId?: number;
} {
  const norm = String(typeCode || "").toUpperCase();
  if (norm === "ORGANIZATION" || norm === "ORG" || canonicalLevel === 1) {
    return {
      tabLabel: "Business Units",
      singularLabel: "Business Unit",
      emptyPrompt: "No business units yet. Add one to group related departments.",
      targetTypeId: 2,
    };
  }
  if (norm === "BUSINESS_UNIT" || norm === "BU" || canonicalLevel === 2) {
    return {
      tabLabel: "Departments",
      singularLabel: "Department",
      emptyPrompt: "No departments yet. Add one to group related teams and budgets.",
      targetTypeId: 3,
    };
  }
  if (norm === "DEPARTMENT" || norm === "DEP" || canonicalLevel === 3) {
    return {
      tabLabel: "Sections",
      singularLabel: "Section",
      emptyPrompt: "No sections yet. Add one to group this department's teams.",
      targetTypeId: 4,
    };
  }
  return {
    tabLabel: "Teams",
    singularLabel: "Team",
    emptyPrompt: "No teams inside this unit yet.",
    targetTypeId: undefined,
  };
}

/**
 * Formats subordinate counts into a natural plain-language sentence.
 */
function formatCountSentence(
  childCount?: number,
  childTypeWord?: string,
  peopleCount?: number
): string {
  const parts: string[] = [];

  if (childCount !== undefined && childCount > 0) {
    parts.push(`${childCount} ${childTypeWord || "units"}`);
  }

  if (peopleCount !== undefined && peopleCount > 0) {
    parts.push(`${peopleCount} ${peopleCount === 1 ? "person" : "people"}`);
  }

  if (parts.length === 0) {
    return "0 units inside";
  }

  return parts.join(" · ");
}

/**
 * OrgUnitDetailView — Slide-Over Detail Panel for Organization Units.
 *
 * Implements:
 * - Part 1: Clean surface rules (white card, neutral borders, mono codes).
 * - Part 2: Vocabulary compliance (Part of, What's inside, Who's in charge, Archive/Remove).
 * - Part 3.4: Slide-over anatomy (code chip, panel label, ⋯ menu, dynamic child tab, definition list).
 * - Part 6.5: Genuine 404 error page, indented skeletons, inviting empty states.
 */
export function OrgUnitDetailView({
  unitId,
  onNavigateUnit,
  onClose,
  className,
}: OrgUnitDetailViewProps) {
  const router = useRouter();
  const { can } = usePermission();

  const [activeTab, setActiveTab] = React.useState("overview");
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = React.useState(false);

  // Data Queries
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

  // Mutations
  const updateMutation = useUpdateOrgUnit();
  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  // Derived metadata
  const typeCode = unit?.type?.code || unit?.orgUnitType?.code;
  const canonicalLevel = unit?.type?.canonicalLevel || unit?.orgUnitType?.canonicalLevel || unit?.depth || 1;
  const childMeta = getChildTabMeta(canonicalLevel, typeCode);
  const typeName = unit?.type?.name || unit?.orgUnitType?.name || childMeta.singularLabel;

  // Ancestor Breadcrumb Items
  const breadcrumbItems: OrgBreadcrumbItem[] = React.useMemo(() => {
    if (!ancestorsList || ancestorsList.length === 0) return [];
    return ancestorsList.map((a) => ({
      orgUnitId: a.orgUnitId,
      name: a.name,
      nameAr: a.nameAr || undefined,
      code: a.code,
      typeCode: a.type?.code || a.orgUnitType?.code,
    }));
  }, [ancestorsList]);

  // Loading State: Skeleton Screen (Part 6.5)
  if (isLoadingUnit) {
    return (
      <div className={cn("space-y-6 p-6", className)} aria-label="Loading details...">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-7 w-48 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error State: Genuine 404 (Part 6.5 & Vocabulary: Never say "Scope")
  if (isErrorUnit || !unit) {
    return (
      <div className={cn("p-12 text-center flex flex-col items-center justify-center min-h-[450px] space-y-4 bg-card rounded-2xl border border-border", className)}>
        <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
          <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-bold text-foreground">Department Not Available</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This department isn&apos;t available or you don&apos;t have access to view it.
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
              Return to Organisation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateSubmit = async (data: UpdateOrgUnitDto) => {
    try {
      await updateMutation.mutateAsync({ id: unit.orgUnitId, dto: data });
      toast.success(`${data.name} updated successfully.`);
      setIsEditOpen(false);
      refetchUnit();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update.";
      toast.error(errorMsg);
    }
  };

  const handleAddChildSubmit = async (data: CreateOrgUnitDto) => {
    try {
      const created = await createMutation.mutateAsync({ ...data, parentOrgUnitId: unit.orgUnitId });
      toast.success(`${created.name} added under ${unit.name}.`);
      setIsAddChildOpen(false);
      refetchUnit();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add.";
      toast.error(errorMsg);
    }
  };

  const handleToggleArchive = async () => {
    try {
      if (unit.isActive) {
        await deactivateMutation.mutateAsync({
          id: unit.orgUnitId,
          effectiveTo: new Date().toISOString().split("T")[0],
        });
        toast.success(`${unit.name} archived.`);
      } else {
        await activateMutation.mutateAsync(unit.orgUnitId);
        toast.success(`${unit.name} restored from archive.`);
      }
      refetchUnit();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update status.";
      toast.error(errorMsg);
    }
  };

  // Child Units Table Columns (Part 3.4)
  const childrenColumns: ColumnDef<OrgUnitSummaryDto>[] = [
    {
      key: "name",
      header: "Name",
      render: (_, row) => (
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigateUnit?.(row.orgUnitId)}
        >
          <OrgTypeIcon type={row.orgUnitTypeId} size="xs" />
          <div className="space-y-0.5 min-w-0">
            <span className="font-semibold text-xs text-foreground group-hover:text-primary group-hover:underline truncate block">
              {row.name}
            </span>
            {row.nameAr && (
              <span dir="rtl" lang="ar" className="text-[11px] text-muted-foreground font-arabic truncate block">
                {row.nameAr}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
          {row.code}
        </span>
      ),
    },
    {
      key: "head",
      header: "Who's in charge",
      render: (_, row) =>
        row.head?.displayName || row.head?.userDisplayName ? (
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5 truncate">
            <User className="h-3 w-3 text-muted-foreground" />
            {row.head?.displayName || row.head?.userDisplayName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">No one in charge</span>
        ),
    },
    {
      key: "counts",
      header: "What's inside",
      render: (_, row) => (
        <span className="text-xs text-muted-foreground">
          {row.childCount || 0} teams
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <Badge
          variant={row.isActive ? "default" : "secondary"}
          className="text-[10px] uppercase font-semibold"
        >
          {row.isActive ? "Active" : "Archived"}
        </Badge>
      ),
    },
  ];

  const totalInsideCount = unit.descendantCount ?? unit.childCount ?? 0;
  const countSentence = formatCountSentence(
    unit.childCount,
    childMeta.tabLabel.toLowerCase(),
    (unit as any).peopleCount ?? (unit as any).assignedUserCount
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* ========================================================================= */}
      {/* Top Header: Code Chip + Breadcrumb Path + ⋯ Menu + Edit (Part 3.4)         */}
      {/* ========================================================================= */}
      <div className="space-y-3 pb-4 border-b border-border/60">
        {/* Top Meta Line: Code Chip + Panel Label */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
              {unit.code}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {typeName} details
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* ⋯ Menu for Destructive Actions (One Click Deep per Part 3.4) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                {can(ORG_PERMISSIONS.MOVE) && (
                  <DropdownMenuItem
                    onClick={() => setIsMoveOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
                    <span>Move {typeName.toLowerCase()}</span>
                  </DropdownMenuItem>
                )}

                {can(ORG_PERMISSIONS.UPDATE) && (
                  <DropdownMenuItem
                    onClick={handleToggleArchive}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 text-amber-600" />
                    <span>{unit.isActive ? `Archive ${typeName.toLowerCase()}` : `Restore ${typeName.toLowerCase()}`}</span>
                  </DropdownMenuItem>
                )}

                {can(ORG_PERMISSIONS.DELETE) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove {typeName.toLowerCase()}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary Edit Button */}
            {can(ORG_PERMISSIONS.UPDATE) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="gap-1.5 text-xs h-8 rounded-lg"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Identity Block: Icon + Name + Arabic Name + "Part of" clickable path */}
        <div className="flex items-start gap-3 pt-1">
          <OrgTypeIcon type={typeCode || "DEPARTMENT"} size="lg" className="mt-0.5 shrink-0" />
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
              {unit.name}
            </h1>

            {unit.nameAr && (
              <p dir="rtl" lang="ar" className="text-xs text-muted-foreground font-arabic">
                {unit.nameAr}
              </p>
            )}

            {/* "Part of" Clickable Lineage Path (Part 3.4) */}
            <div className="pt-0.5 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span>Part of</span>
              {breadcrumbItems.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {breadcrumbItems.map((item, idx) => (
                    <React.Fragment key={item.orgUnitId || idx}>
                      {idx > 0 && <span className="text-muted-foreground/60">›</span>}
                      <button
                        type="button"
                        onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                        className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {item.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span className="font-medium text-foreground">DIEZ (Top of organisation)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Detail Tabs (Part 3.4: Overview | Dynamic Child Type | People | History)  */}
      {/* ========================================================================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl w-full sm:w-auto self-start border border-border/60">
          <TabsTrigger value="overview" className="text-xs gap-1.5 px-3.5 py-1.5 rounded-lg">
            <Building2 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>

          <TabsTrigger value="children" className="text-xs gap-1.5 px-3.5 py-1.5 rounded-lg">
            <Layers className="h-3.5 w-3.5" />
            {childMeta.tabLabel} ({childrenList?.length || 0})
          </TabsTrigger>

          <TabsTrigger value="people" className="text-xs gap-1.5 px-3.5 py-1.5 rounded-lg">
            <Users className="h-3.5 w-3.5" />
            People
          </TabsTrigger>

          <TabsTrigger value="history" className="text-xs gap-1.5 px-3.5 py-1.5 rounded-lg">
            <History className="h-3.5 w-3.5" />
            History ({changeLogsData?.total || 0})
          </TabsTrigger>
        </TabsList>

        {/* ===================================================================== */}
        {/* Tab 1: Overview (Read-First Definition List per Part 3.4)             */}
        {/* ===================================================================== */}
        <TabsContent value="overview" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Definition List */}
            <Card className="lg:col-span-2 border border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Key Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Operational details and leadership appointments.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  {/* Who's in charge */}
                  <div className="space-y-1 sm:col-span-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <dt className="text-muted-foreground font-medium text-[11px] uppercase">
                      Who&apos;s in charge
                    </dt>
                    <dd className="font-semibold text-foreground text-sm flex items-center gap-2 pt-0.5">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span>
                        {unit.head?.displayName || unit.head?.userDisplayName || (
                          <span className="text-muted-foreground font-normal italic">
                            No one in charge currently
                          </span>
                        )}
                      </span>
                      {unit.effectiveFrom && (
                        <span className="text-xs text-muted-foreground font-normal ml-auto">
                          Started {String(unit.effectiveFrom).split("T")[0]}
                        </span>
                      )}
                    </dd>
                  </div>

                  {/* Code */}
                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Code</dt>
                    <dd className="font-mono font-semibold text-foreground text-sm">
                      {unit.code}
                    </dd>
                  </div>

                  {/* Cost Centre */}
                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Cost centre</dt>
                    <dd className="font-mono text-foreground font-medium">
                      {unit.costCenterCode || <span className="text-muted-foreground italic">None</span>}
                    </dd>
                  </div>

                  {/* Part of */}
                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Part of</dt>
                    <dd className="font-medium text-foreground">
                      {unit.parentName ? (
                        <button
                          type="button"
                          onClick={() => unit.parentOrgUnitId && onNavigateUnit?.(unit.parentOrgUnitId)}
                          className="hover:underline text-primary text-left font-semibold inline-flex items-center gap-1"
                        >
                          {unit.parentName}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">DIEZ (Top of organisation)</span>
                      )}
                    </dd>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <dt className="text-muted-foreground font-medium">Status</dt>
                    <dd className="font-medium text-foreground flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          unit.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                        )}
                      />
                      <span>{unit.isActive ? "Active" : "Archived"}</span>
                    </dd>
                  </div>

                  {/* What's inside */}
                  <div className="space-y-1 sm:col-span-2">
                    <dt className="text-muted-foreground font-medium">What&apos;s inside</dt>
                    <dd className="text-muted-foreground font-medium">
                      {countSentence}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Right Column: Budget Department Card */}
            <div className="space-y-4">
              <Card className="border border-border shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    Budget Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  {isLoadingBudget ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking budget department...
                    </div>
                  ) : budgetOwner ? (
                    <div>
                      <p className="font-bold text-foreground">{budgetOwner.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {budgetOwner.code} · Cost centre: {budgetOwner.costCenterCode || "None"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No budget department assigned.</p>
                  )}
                </CardContent>
              </Card>

              {/* Approval Ladder Preview */}
              <Card className="border border-border shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Approval Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {isLoadingChain ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading approval stages...
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
                    <p className="text-muted-foreground italic">No approval path available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 2: Dynamic Child Type (Departments / Sections Table per Part 3.4) */}
        {/* ===================================================================== */}
        <TabsContent value="children" className="space-y-4 m-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{childMeta.tabLabel}</h3>
              <p className="text-xs text-muted-foreground">
                Teams and divisions inside {unit.name}.
              </p>
            </div>
            {can(ORG_PERMISSIONS.CREATE) && (
              <Button
                size="sm"
                onClick={() => setIsAddChildOpen(true)}
                className="gap-1.5 text-xs h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Add {childMeta.singularLabel.toLowerCase()}
              </Button>
            )}
          </div>

          <DataTable
            keyField="orgUnitId"
            data={childrenList || []}
            columns={childrenColumns}
            loading={isLoadingChildren}
            enableSearch={true}
            emptyMessage={childMeta.emptyPrompt}
          />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 3: People & Leadership Timeline (Part 3.4)                       */}
        {/* ===================================================================== */}
        <TabsContent value="people" className="space-y-4 m-0">
          <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 4: History (Plain-Language Change Log Feed per Part 3.4)         */}
        {/* ===================================================================== */}
        <TabsContent value="history" className="space-y-4 m-0">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                History Log
              </CardTitle>
              <CardDescription className="text-xs">
                Plain-language record of past moves, leadership appointments, and updates.
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

                    const oldParent = log.oldValues?.parentName || log.oldValues?.parentOrgUnitId || "DIEZ";
                    const newParent = log.newValues?.parentName || log.newValues?.parentOrgUnitId || "DIEZ";
                    const operator = log.performedByDisplayName || log.performedBy || "Administrator";
                    const formattedDate = log.performedAt
                      ? new Date(log.performedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Recently";

                    // Plain-language sentence description (Part 2 & Part 3.4)
                    let sentence = `${unit.name} updated — ${operator}, ${formattedDate}`;
                    if (isMove) {
                      sentence = `Moved from ${oldParent} to ${newParent} — ${operator}, ${formattedDate}`;
                    } else if (log.changeType === "MANAGER_ASSIGNED") {
                      sentence = `Assigned leader — ${operator}, ${formattedDate}`;
                    } else if (log.changeType === "CREATED") {
                      sentence = `Created under ${newParent} — ${operator}, ${formattedDate}`;
                    } else if (log.changeType === "DEACTIVATED") {
                      sentence = `Archived — ${operator}, ${formattedDate}`;
                    }

                    return (
                      <div key={log.changeLogId} className="pt-3 first:pt-0 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground leading-snug">
                            {sentence}
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                            {log.changeType}
                          </span>
                        </div>

                        {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            {log.affectedNodeCount} teams inside moved with it.
                          </p>
                        )}

                        {log.reason && (
                          <p className="text-[11px] text-muted-foreground italic">
                            Reason: {log.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No history records logged for this {typeName.toLowerCase()} yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* Dialogs: Edit, Add, Move, Remove                                         */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit {typeName}</DialogTitle>
            <DialogDescription className="text-xs">
              Update properties for <span className="font-bold text-foreground">{unit.name}</span>.
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

      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-bold text-foreground">{unit.name}</span>.
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

      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

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
