"use client";

import {
  Archive,
  ArrowRightLeft,
  Edit2,
  FileQuestion,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { OrgBreadcrumbItem, OrgTypeIcon } from "@/components/organization";
import { AddOrgUnitWizard } from "@/components/organization/AddOrgUnitWizard";
import { ArchiveUnitDialog } from "@/components/organization/ArchiveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { ManagerAssignmentPanel } from "@/components/organization/ManagerAssignmentPanel";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { ColumnDef, DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useActivateOrgUnit,
  useApprovalChain,
  useAssignManager,
  useBudgetOwner,
  useCreateOrgUnit,
  useDeactivateOrgUnit,
  useOrgUnit,
  useOrgUnitAncestors,
  useOrgUnitChangeLog,
  useOrgUnitChildren,
  useOrgUnitCurrentHead,
  useOrgUnitMembers,
  useUpdateOrgUnit,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  CreateOrgUnitDto,
  ORG_PERMISSIONS,
  OrgUnitSummaryDto,
  UpdateOrgUnitDto
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
 * Formats a date string as '31 Dec 2025' per Part 3.5.
 */
function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Extracts 2 initials from a person's display name.
 */
function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


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
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
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
  const { data: currentHead } = useOrgUnitCurrentHead(unitId);
  const { data: membersList } = useOrgUnitMembers(unitId);

  // Mutations
  const updateMutation = useUpdateOrgUnit();
  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();
  const assignMutation = useAssignManager();

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
          <Skeleton className="h-48 rounded-md" />
          <Skeleton className="h-32 rounded-md" />
        </div>
      </div>
    );
  }

  // Error State: Genuine 404 (Part 6.5 & Vocabulary: Never say "Scope")
  if (isErrorUnit || !unit) {
    return (
      <div className={cn("p-12 text-center flex flex-col items-center justify-center min-h-[450px] space-y-4 bg-card rounded-md border border-border", className)}>
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
              Return to Organization
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

  const handleAddChildSubmit = async (data: CreateOrgUnitDto, leaderUserId?: string | null) => {
    try {
      const created = await createMutation.mutateAsync({ ...data, parentOrgUnitId: unit.orgUnitId });
      if (leaderUserId) {
        try {
          await assignMutation.mutateAsync({
            unitId: created.orgUnitId,
            dto: {
              userId: leaderUserId,
              managerRoleCode: "HEAD",
              isPrimary: true,
              effectiveFrom: new Date().toISOString().split("T")[0],
            },
          });
        } catch {
          // Leadership assignment fallback
        }
      }
      toast.success(`${created.name} added under ${unit.name}.`);
      setIsAddChildOpen(false);
      refetchUnit();
      onNavigateUnit?.(created.orgUnitId);
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
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
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
          <span className="text-xs text-muted-foreground font-normal">No one in charge</span>
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

  const headName =
    currentHead?.userDisplayName ||
    currentHead?.username ||
    unit.head?.displayName ||
    unit.head?.userDisplayName;
  const isHeadAssigned = Boolean(headName && headName !== "Assigned Head");
  const effectiveHeadSince = currentHead?.effectiveFrom
    ? String(currentHead.effectiveFrom).split("T")[0]
    : unit.head?.effectiveFrom
      ? String(unit.head.effectiveFrom).split("T")[0]
      : null;

  return (
    <div className={cn("flex flex-col h-full bg-[#f5f5f7] dark:bg-black", className)}>
      {/* ── HEADER ── */}
      <div className="bg-background shrink-0 rounded-t-xl overflow-hidden">
        <div className="px-6 sm:px-8 pt-8 pb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-16 rounded-lg bg-[#0a2540] text-blue-400 flex items-center justify-center shrink-0 shadow-sm border border-black/10 dark:border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                <OrgTypeIcon type={typeCode || "DEPARTMENT"} size="detail" className="size-8" />
              </div>
              <div className="space-y-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                    {unit.name}
                  </h1>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 select-none">
                    {unit.code}
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex flex-col gap-0.5 pt-0.5">
                  {unit.nameAr && (
                    <p dir="rtl" lang="ar" className="font-arabic truncate">
                      {unit.nameAr}
                    </p>
                  )}
                  {breadcrumbItems.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {breadcrumbItems.map((item, idx) => (
                        <React.Fragment key={item.orgUnitId || idx}>
                          {idx > 0 && <span>/</span>}
                          <button
                            type="button"
                            onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                            className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                          >
                            {item.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <span className="text-foreground">Dubai Integrated Economic Zones</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {can(ORG_PERMISSIONS.UPDATE) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-9 rounded-full px-4 gap-2 text-[13px] font-semibold shadow-xs border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <Edit2 className="size-3.5" />
                  Edit
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-9 rounded-full p-0 shadow-xs border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1 rounded-lg">
                  {can(ORG_PERMISSIONS.MOVE) && (
                    <DropdownMenuItem
                      onClick={() => setIsMoveOpen(true)}
                      className="gap-2 text-[13px] font-medium cursor-pointer rounded-lg py-2"
                    >
                      <ArrowRightLeft className="size-4 text-blue-600" />
                      <span>Move {typeName.toLowerCase()}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => setIsArchiveOpen(true)}
                      className="gap-2 text-[13px] font-medium cursor-pointer rounded-lg py-2"
                    >
                      <Archive className="size-4 text-amber-600" />
                      <span>{unit.isActive ? `Archive ${typeName.toLowerCase()}` : `Restore ${typeName.toLowerCase()}`}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="gap-2 text-[13px] font-medium text-destructive focus:text-destructive cursor-pointer rounded-lg py-2"
                      >
                        <Trash2 className="size-4" />
                        <span>Remove {typeName.toLowerCase()}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── SEGMENTED CONTROL TABS ── */}
        <div className="px-6 sm:px-8 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              {["overview", "children", "people", "history"].map((tab) => {
                const labels: Record<string, string> = {
                  overview: "Overview",
                  children: childMeta.tabLabel,
                  people: "People",
                  history: "History",
                };
                const counts: Record<string, number | undefined> = {
                  children: childrenList?.length,
                  people: (unit as any).peopleCount ?? (unit as any).assignedUserCount,
                  history: changeLogsData?.total,
                };

                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                  >
                    {labels[tab]}
                    {counts[tab] ? (
                      <Badge variant="secondary" className="ml-2 text-[10px] font-bold px-1.5 py-0 h-[18px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-none">
                        {counts[tab]}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <Tabs value={activeTab} className="h-full">

          {/* OVERVIEW */}
          <TabsContent value="overview" className="m-0 focus-visible:outline-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Properties */}
              <div className="p-6 rounded-lg bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  Properties
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <span className="text-[13px] text-slate-500">Status</span>
                    <Badge variant="outline" className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-none", unit.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600")}>
                      {unit.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <span className="text-[13px] text-slate-500">Cost Centre</span>
                    <span className="text-[13px] font-medium text-foreground">{unit.costCenterCode || "None"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <span className="text-[13px] text-slate-500">Sub-units</span>
                    <span className="text-[13px] font-medium text-foreground">{countSentence}</span>
                  </div>
                </div>
              </div>

              {/* Leadership */}
              <div className="p-6 rounded-lg bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    Leadership
                  </h3>
                  {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && !isHeadAssigned && (
                    <button type="button" onClick={() => setActiveTab("people")} className="text-[13px] font-medium text-blue-600 hover:underline">
                      Assign
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-medium text-[15px]">
                    {isHeadAssigned ? getInitials(headName) : <User className="size-5 opacity-50" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-foreground truncate">{isHeadAssigned ? headName : "Unassigned"}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5 truncate">{isHeadAssigned ? `Head · Since ${formatDisplayDate(effectiveHeadSince)}` : "No active leader"}</p>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="p-6 rounded-lg bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  Budget Owner
                </h3>
                <div className="pt-1">
                  {isLoadingBudget ? (
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : budgetOwner ? (
                    <div>
                      <p className="text-[15px] font-medium text-foreground">{budgetOwner.name}</p>
                      <p className="text-[13px] text-slate-500 mt-0.5">{budgetOwner.code}</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-[13px] text-slate-500">Not assigned</p>
                      {can(ORG_PERMISSIONS.UPDATE) && (
                        <button type="button" onClick={() => setIsEditOpen(true)} className="text-[13px] font-medium text-blue-600 hover:underline block">
                          Set budget owner
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Signoff Chain */}
              <div className="p-6 rounded-lg bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  Approval Route
                </h3>
                <div className="pt-1">
                  {isLoadingChain ? (
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Loading path...</span>
                    </div>
                  ) : approvalChain && approvalChain.length > 0 ? (
                    <div className="relative pl-1">
                      {approvalChain.map((node, idx) => {
                        const isLast = idx === approvalChain.length - 1;
                        const headPerson = node.head?.displayName;
                        const hasHead = Boolean(headPerson && headPerson !== "Assigned Head");

                        return (
                          <div key={node.orgUnitId || idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                            {!isLast && (
                              <div className="absolute left-[7px] top-[22px] bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                            )}
                            <div className="relative z-10 size-4 rounded-full bg-background border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-1">
                              <div className={cn("size-1.5 rounded-full", hasHead ? "bg-slate-400 dark:bg-slate-500" : "bg-transparent")} />
                            </div>
                            <div className="min-w-0 flex-1 -mt-0.5">
                              <p className="text-[14px] font-medium text-foreground leading-snug truncate">
                                {node.name}
                              </p>
                              <p className="text-[13px] text-slate-500 mt-0.5 leading-snug truncate">
                                {hasHead ? headPerson : "No one in charge"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[13px] text-slate-500">No sign-off route required.</p>
                  )}
                </div>
              </div>

            </div>
          </TabsContent>

          {/* CHILDREN */}
          <TabsContent value="children" className="m-0 focus-visible:outline-none h-full">
            <div className="rounded-lg border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="p-6 pb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{childMeta.tabLabel}</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Teams and divisions inside {unit.name}.
                  </p>
                </div>
                {can(ORG_PERMISSIONS.CREATE) && (
                  <Button size="sm" onClick={() => setIsAddChildOpen(true)} className="gap-2 text-[13px] font-medium rounded-full bg-[#1c2c4b] hover:bg-[#15213a] text-white">
                    <Plus className="size-4" />
                    Add {childMeta.singularLabel}
                  </Button>
                )}
              </div>
              <div className="p-0 flex-1 [&_.border-b]:border-slate-100 dark:[&_.border-b]:border-slate-800/50">
                <DataTable
                  columns={childrenColumns}
                  data={childrenList || []}
                  keyField="orgUnitId"
                  loading={isLoadingChildren}
                  onRowClick={(row) => onNavigateUnit?.(row.orgUnitId)}
                  emptyMessage={`No ${childMeta.tabLabel.toLowerCase()} added under ${unit.name} yet.`}
                />
              </div>
            </div>
          </TabsContent>

          {/* PEOPLE */}
          <TabsContent value="people" className="m-0 focus-visible:outline-none">
            <div className="rounded-lg border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
            </div>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="m-0 focus-visible:outline-none">
            <div className="rounded-lg border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                <h3 className="text-base font-semibold text-foreground">Change Log</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Plain-language record of reporting changes, appointments, and structure updates.
                </p>
              </div>
              <div className="p-6">
                {isLoadingLogs ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-[13px] text-slate-500">
                    <Loader2 className="size-5 animate-spin text-slate-400" />
                    <span>Loading history records...</span>
                  </div>
                ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
                  <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800/50">
                    {changeLogsData.data.map((log) => {
                      const isMove = log.changeType === "MOVED" || log.changeType === "REPARENT";
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

                      let sentence = `${unit.name} updated — ${operator}, ${formattedDate}`;
                      if (isMove) {
                        sentence = `Moved from ${oldParent} to ${newParent} — ${operator}, ${formattedDate}`;
                      } else if (log.changeType === "MANAGER_ASSIGNED") {
                        sentence = `Assigned leader — ${operator}, ${formattedDate}`;
                      } else if (log.changeType === "CREATED") {
                        sentence = `Created under ${newParent} — ${operator}, ${formattedDate}`;
                      } else if (log.changeType === "DEACTIVATED") {
                        sentence = `Archived — ${operator}, ${formattedDate}`;
                      } else if (log.changeType === "ACTIVATED") {
                        sentence = `Restored — ${operator}, ${formattedDate}`;
                      }

                      const friendlyTag =
                        isMove ? "Move" :
                          log.changeType === "CREATED" ? "Created" :
                            log.changeType === "DEACTIVATED" ? "Archived" :
                              log.changeType === "ACTIVATED" ? "Restored" :
                                log.changeType === "MANAGER_ASSIGNED" ? "Leadership" : "Update";

                      return (
                        <div key={log.changeLogId} className="pt-5 first:pt-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[14px] font-medium text-foreground leading-snug">
                              {sentence}
                            </p>
                            <Badge variant="secondary" className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none shadow-none">
                              {friendlyTag}
                            </Badge>
                          </div>
                          {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                            <p className="text-[13px] text-slate-500">
                              {log.affectedNodeCount} teams inside moved with it.
                            </p>
                          )}
                          {log.reason && (
                            <p className="text-[13px] text-slate-500">
                              Reason: {log.reason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[13px] text-slate-500">
                    No history records logged for this {typeName.toLowerCase()} yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* Dialogs: Edit, Add, Move, Remove                                         */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit {typeName}</DialogTitle>
            <DialogDescription className="text-sm">
              Update properties for <span className="font-medium text-foreground">{unit.name}</span>.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-medium text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <AddOrgUnitWizard
            initialParent={unit}
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

      <ArchiveUnitDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={unit}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenMove={() => setIsMoveOpen(true)}
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
