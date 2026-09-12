"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Edit2,
  ArrowRightLeft,
  Trash2,
  Archive,
  Plus,
  Loader2,
  FileQuestion,
  RefreshCw,
  MoreHorizontal,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { OrgTypeIcon, OrgBreadcrumbItem } from "@/components/organization";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { AddOrgUnitWizard } from "@/components/organization/AddOrgUnitWizard";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import { ArchiveUnitDialog } from "@/components/organization/ArchiveUnitDialog";
import { DeleteUnitDialog } from "@/components/organization/DeleteUnitDialog";
import { ManagerAssignmentPanel } from "@/components/organization/ManagerAssignmentPanel";

import {
  useOrgUnit,
  useOrgUnitChildren,
  useOrgUnitAncestors,
  useOrgUnitChangeLog,
  useOrgUnitCurrentHead,
  useApprovalChain,
  useBudgetOwner,
  useUpdateOrgUnit,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
  useAssignManager,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitSummaryDto,
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
    <div className={cn("p-6 space-y-0", className)}>
      {/* ========================================================================= */}
      {/* 3.1 Identity row: Code chip · Type · Actions                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-normal px-[7px] py-[3px] rounded-[4px] bg-muted/60 text-muted-foreground border border-border/40 select-none">
            {unit.code}
          </span>
          <span className="text-muted-foreground/60 text-[13px]">·</span>
          <span className="text-[13px] text-muted-foreground font-normal truncate">
            {typeName}
          </span>
        </div>

        {/* Actions: exactly 32px tall, 8px radius */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* ⋯ Menu for Destructive Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  onClick={() => setIsArchiveOpen(true)}
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

          {/* Primary Edit Button: Ghost variant, 32px tall, 8px radius */}
          {can(ORG_PERMISSIONS.UPDATE) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 text-xs h-8 px-3 rounded-[8px] text-foreground hover:bg-muted font-normal"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3.2 Title block: Icon (36px, 10px radius) + Title + Arabic + "Part of"   */}
      {/* Rhythm: 16px below identity row, 6px to "Part of", 20px to tab row       */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-3 mt-4">
        <OrgTypeIcon
          type={typeCode || "DEPARTMENT"}
          size="detail"
          className="mt-0.5 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-semibold tracking-tight text-foreground leading-tight">
            {unit.name}
          </h1>

          {unit.nameAr && (
            <p dir="rtl" lang="ar" className="text-[13px] text-muted-foreground font-arabic mt-1">
              {unit.nameAr}
            </p>
          )}

          {/* "Part of": 6px under title, aligned to title's left edge */}
          <div className="mt-1.5 text-[13px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground/70">Part of</span>
            {breadcrumbItems.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                {breadcrumbItems.map((item, idx) => (
                  <React.Fragment key={item.orgUnitId || idx}>
                    {idx > 0 && <span className="text-muted-foreground/50 mx-0.5">›</span>}
                    <button
                      type="button"
                      onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                      className="font-normal text-foreground hover:text-primary hover:underline transition-colors"
                    >
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-normal text-foreground">DIEZ</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-muted/60 text-muted-foreground font-normal border border-border/40">
                  Top level
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3.3 Underline Tabs: 40px row, 1px full-width hairline, 2px accent line   */}
      {/* Rhythm: 20px below "Part of", 24px below tab row to content               */}
      {/* ========================================================================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 space-y-6">
        <TabsList className="h-[40px] w-full p-0 bg-transparent rounded-none border-b border-border flex items-center justify-start gap-0">
          <TabsTrigger
            value="overview"
            className="h-[40px] px-4 first:pl-0 bg-transparent rounded-none text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent relative transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="children"
            className="h-[40px] px-4 bg-transparent rounded-none text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent relative transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            {childMeta.tabLabel}
            {childrenList && childrenList.length > 0 ? (
              <span className="ml-1.5 text-[13px] text-muted-foreground/70 font-normal">
                {childrenList.length}
              </span>
            ) : null}
          </TabsTrigger>

          <TabsTrigger
            value="people"
            className="h-[40px] px-4 bg-transparent rounded-none text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent relative transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            People
            {((unit as any).peopleCount ?? (unit as any).assignedUserCount ?? 0) > 0 ? (
              <span className="ml-1.5 text-[13px] text-muted-foreground/70 font-normal">
                {(unit as any).peopleCount ?? (unit as any).assignedUserCount}
              </span>
            ) : null}
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="h-[40px] px-4 bg-transparent rounded-none text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent relative transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
          >
            History
            {(changeLogsData?.total || 0) > 0 ? (
              <span className="ml-1.5 text-[13px] text-muted-foreground/70 font-normal">
                {changeLogsData?.total}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {/* ===================================================================== */}
        {/* Tab 1: Overview (Flat Sections, Hairlines per Part 2 & 3.4-3.7)       */}
        {/* ===================================================================== */}
        <TabsContent value="overview" className="m-0">
          <div className="grid grid-cols-1 min-[1100px]:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Left Column: Who's In Charge + Details */}
            <div className="space-y-8 min-w-0">
              {/* 3.5 Who's in charge */}
              <div>
                <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground block mb-3">
                  Who&apos;s in charge
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center text-xs font-medium border border-border/40 shrink-0">
                    {isHeadAssigned ? (
                      <span>{getInitials(headName)}</span>
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {isHeadAssigned ? (
                      <div>
                        <p className="text-[15px] font-medium text-foreground leading-snug">
                          {headName}
                        </p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                          Head · since {formatDisplayDate(effectiveHeadSince)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-muted-foreground font-normal">
                          No one in charge
                        </span>
                        {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && (
                          <>
                            <span className="text-muted-foreground/50 text-[13px]">·</span>
                            <button
                              type="button"
                              onClick={() => setActiveTab("people")}
                              className="text-[13px] text-primary hover:underline font-normal"
                            >
                              Assign
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3.6 Details */}
              <div className="pt-6 border-t border-border">
                <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground block mb-3">
                  Details
                </span>
                <dl className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-[13px]">
                  {/* Code */}
                  <dt className="text-muted-foreground font-normal">Code</dt>
                  <dd className="font-mono text-[13px] font-normal text-foreground">
                    {unit.code}
                  </dd>

                  {/* Cost Centre */}
                  <dt className="text-muted-foreground font-normal">Cost centre</dt>
                  <dd className="font-mono text-[13px] font-normal text-foreground">
                    {unit.costCenterCode || "None"}
                  </dd>

                  {/* Part of */}
                  <dt className="text-muted-foreground font-normal">Part of</dt>
                  <dd className="text-foreground">
                    {unit.parentName ? (
                      <button
                        type="button"
                        onClick={() => unit.parentOrgUnitId && onNavigateUnit?.(unit.parentOrgUnitId)}
                        className="text-foreground hover:text-primary hover:underline font-normal inline-flex items-center gap-1"
                      >
                        {unit.parentName}
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-normal text-foreground">DIEZ</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-muted/60 text-muted-foreground font-normal border border-border/40">
                          Top level
                        </span>
                      </span>
                    )}
                  </dd>

                  {/* Status */}
                  <dt className="text-muted-foreground font-normal">Status</dt>
                  <dd className="text-foreground flex items-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-normal border",
                        unit.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border/50"
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
                  </dd>

                  {/* What's inside */}
                  <dt className="text-muted-foreground font-normal">What&apos;s inside</dt>
                  <dd className="text-foreground font-normal">
                    {countSentence}
                  </dd>
                </dl>
              </div>
            </div>

            {/* Right Column (Aside): Budget Held By + Sign-off Chain */}
            <div className="space-y-6 pt-6 border-t border-border min-[1100px]:border-t-0 min-[1100px]:pt-0 min-w-0">
              {/* Budget held by */}
              <div>
                <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground block mb-3">
                  Budget held by
                </span>
                {isLoadingBudget ? (
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span>Checking budget holder...</span>
                  </div>
                ) : budgetOwner ? (
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium text-foreground">{budgetOwner.name}</p>
                    <p className="font-mono text-[13px] font-normal text-muted-foreground">
                      {budgetOwner.code} · Cost centre: {budgetOwner.costCenterCode || "None"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[13px] text-muted-foreground">Not assigned</p>
                    {can(ORG_PERMISSIONS.UPDATE) && (
                      <button
                        type="button"
                        onClick={() => setIsEditOpen(true)}
                        className="text-[13px] text-primary hover:underline font-normal block"
                      >
                        Assign department
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sign-off chain (Vertical Stepper) */}
              <div className="pt-6 border-t border-border">
                <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground block mb-3">
                  Sign-off chain
                </span>
                {isLoadingChain ? (
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span>Loading sign-off stages...</span>
                  </div>
                ) : approvalChain && approvalChain.length > 0 ? (
                  <div className="relative pl-0.5">
                    {approvalChain.map((node, idx) => {
                      const isLast = idx === approvalChain.length - 1;
                      const headPerson = node.head?.displayName;
                      const hasHead = Boolean(headPerson && headPerson !== "Assigned Head");

                      return (
                        <div key={node.orgUnitId || idx} className="relative flex items-start gap-3 pb-5 last:pb-0">
                          {/* Connector Line */}
                          {!isLast && (
                            <div className="absolute left-[9.5px] top-[20px] bottom-0 w-[1px] bg-border" />
                          )}

                          {/* Step Circle */}
                          <div className="relative z-10 w-5 h-5 rounded-full bg-muted/80 text-[11px] font-mono font-normal flex items-center justify-center text-muted-foreground border border-border/50 shrink-0">
                            {idx + 1}
                          </div>

                          {/* Content: Unit name on top line, person beneath */}
                          <div className="min-w-0 flex-1 -mt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[13px] font-medium text-foreground leading-snug">
                                {node.name}
                              </span>
                              {!hasHead && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"
                                  title="No one assigned"
                                />
                              )}
                            </div>
                            <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                              {hasHead ? headPerson : "No one in charge"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">No sign-off route required.</p>
                )}
              </div>
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
            columns={childrenColumns}
            data={childrenList || []}
            keyField="orgUnitId"
            loading={isLoadingChildren}
            onRowClick={(row) => onNavigateUnit?.(row.orgUnitId)}
            emptyMessage={`No ${childMeta.tabLabel.toLowerCase()} added under ${unit.name} yet.`}
          />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 3: People & Leadership Timeline (Part 3.4 & Part 2.3)             */}
        {/* ===================================================================== */}
        <TabsContent value="people" className="space-y-4 m-0">
          <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
        </TabsContent>

        {/* ===================================================================== */}
        {/* Tab 4: History (Plain-Language Change Feed per Part 3.4 & Part 2)     */}
        {/* ===================================================================== */}
        <TabsContent value="history" className="space-y-4 m-0">
          <div className="pb-3 border-b border-border/60">
            <h3 className="text-sm font-semibold text-foreground">Change Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plain-language record of reporting changes, appointments, and structure updates.
            </p>
          </div>

          {isLoadingLogs ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading history records...</span>
            </div>
          ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
            <div className="space-y-3 divide-y divide-border/50">
              {changeLogsData.data.map((log: OrgUnitChangeLogDto) => {
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
                } else if (log.changeType === "ACTIVATED") {
                  sentence = `Restored — ${operator}, ${formattedDate}`;
                }

                const friendlyTag =
                  isMove
                    ? "Move"
                    : log.changeType === "CREATED"
                    ? "Created"
                    : log.changeType === "DEACTIVATED"
                    ? "Archived"
                    : log.changeType === "ACTIVATED"
                    ? "Restored"
                    : log.changeType === "MANAGER_ASSIGNED"
                    ? "Leadership"
                    : "Update";

                return (
                  <div key={log.changeLogId} className="pt-3 first:pt-0 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground leading-snug">
                        {sentence}
                      </p>
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50 shrink-0">
                        {friendlyTag}
                      </span>
                    </div>

                    {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {log.affectedNodeCount} teams inside moved with it.
                      </p>
                    )}

                    {log.reason && (
                      <p className="text-[11px] text-muted-foreground">
                        Reason: {log.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No history records logged for this {typeName.toLowerCase()} yet.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* Dialogs: Edit, Add, Move, Remove                                         */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-md">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-bold text-foreground">{unit.name}</span>.
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
