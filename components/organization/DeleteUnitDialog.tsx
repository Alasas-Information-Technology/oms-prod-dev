"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Trash2,
  AlertTriangle,
  Loader2,
  Archive,
  ArrowRightLeft,
  Users,
  Layers,
  ShieldAlert,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteOrgUnit,
  useOrgUnit,
  useOrgUnitChildren,
  useDeactivateOrgUnit,
} from "@/hooks/useOrganization";
import {
  OrgUnitDetailDto,
  OrgUnitSummaryDto,
} from "@/lib/types/organization.types";

export interface DeleteUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: OrgUnitDetailDto | OrgUnitSummaryDto | null;
  onSuccess?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenMove?: () => void;
}

/**
 * DeleteUnitDialog — Remove flow per Part 4.3.
 *
 * Implements:
 * - "Delete this department. Only possible if nothing is using it."
 * - Plain blocking reasons with actionable resolution buttons:
 *   - ORG_HAS_CHILDREN: "Remove or move the N sections inside it first."
 *   - ORG_HAS_ASSIGNED_USERS: "N people are still assigned here. Move them first."
 *   - ORG_REFERENCED: "This department has budget records and can't be removed. You can archive it instead."
 *   - ORG_ROOT_PROTECTED: "This is the top of your organization and can't be removed."
 * - Single "Remove [department]" button with NO code typing.
 */
export function DeleteUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
  onNavigateToTab,
  onOpenMove,
}: DeleteUnitDialogProps) {
  const [blockingError, setBlockingError] = React.useState<string | null>(null);

  const unitId = unit?.orgUnitId || "";
  const { data: liveDetail, isLoading: isLoadingLiveDetail } = useOrgUnit(unitId, {
    enabled: Boolean(open && unitId),
  });

  const { data: childrenList, isLoading: isLoadingChildren } = useOrgUnitChildren(unitId, {
    enabled: Boolean(open && unitId),
  });

  const deleteMutation = useDeleteOrgUnit();
  const archiveMutation = useDeactivateOrgUnit();

  React.useEffect(() => {
    if (open) {
      setBlockingError(null);
    }
  }, [open]);

  if (!unit) return null;

  const currentDetail = liveDetail || unit;
  const typeCode = unit.type?.code || unit.orgUnitType?.code || "DEPARTMENT";
  const typeName = unit.type?.name || unit.orgUnitType?.name || "Department";
  const canonicalLevel = unit.type?.canonicalLevel || unit.orgUnitType?.canonicalLevel || (unit as any).depth || 3;
  const childTypeWord = canonicalLevel === 3 ? "sections" : canonicalLevel === 2 ? "departments" : "teams";

  const childCount = childrenList?.length ?? currentDetail.childCount ?? 0;
  const peopleCount = (currentDetail as any).peopleCount ?? (currentDetail as any).assignedUserCount ?? 0;
  const isRoot = canonicalLevel === 1 || !unit.parentOrgUnitId;
  const hasBudgetRecords = Boolean(currentDetail.costCenterCode || currentDetail.allowsBudget);

  // Client-side block checks
  const isBlockedByChildren = childCount > 0;
  const isBlockedByPeople = peopleCount > 0;
  const isBlockedByRoot = isRoot;

  const isBlocked = isBlockedByChildren || isBlockedByPeople || isBlockedByRoot || Boolean(blockingError);

  // Archive fallback
  const handleArchiveInstead = async () => {
    try {
      await archiveMutation.mutateAsync({
        id: unit.orgUnitId,
        effectiveTo: new Date().toISOString().split("T")[0],
      });
      toast.success(`${unit.name} archived.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error("Failed to archive unit.");
    }
  };

  // Remove Execution
  const handleRemove = async () => {
    if (isBlocked || deleteMutation.isPending) return;

    try {
      await deleteMutation.mutateAsync(unit.orgUnitId);
      toast.success(`${unit.name} removed.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const errorMsg = err?.response?.data?.message || err?.message;

      if (errorCode === "ORG_HAS_CHILDREN" || errorMsg?.includes("child")) {
        setBlockingError(`Remove or move the ${childCount || "subordinate"} ${childTypeWord} inside it first.`);
      } else if (errorCode === "ORG_HAS_ASSIGNED_USERS" || errorMsg?.includes("user")) {
        setBlockingError(`${peopleCount || "Assigned"} people are still assigned here. Move them first.`);
      } else if (errorCode === "ORG_REFERENCED" || errorMsg?.includes("budget") || errorMsg?.includes("reference")) {
        setBlockingError(`This ${typeName.toLowerCase()} has budget records and can't be removed. You can archive it instead.`);
      } else if (errorCode === "ORG_ROOT_PROTECTED") {
        setBlockingError("This is the top of your organization and can't be removed.");
      } else {
        toast.error(errorMsg || `Failed to remove ${typeName.toLowerCase()}.`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Remove {unit.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Delete this {typeName.toLowerCase()}. Only possible if nothing is using it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ================================================================= */}
          {/* Blocking Reasons (Part 4.3 Table)                                 */}
          {/* ================================================================= */}
          {isBlockedByRoot && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="h-4 w-4" />
                <span>Cannot remove top level</span>
              </div>
              <p className="text-muted-foreground">
                This is the top of your organization and can&apos;t be removed.
              </p>
            </div>
          )}

          {isBlockedByChildren && !isBlockedByRoot && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Layers className="h-4 w-4" />
                <span>Contains active {childTypeWord}</span>
              </div>
              <p className="text-muted-foreground">
                Remove or move the {childCount} {childTypeWord} inside it first.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {onOpenMove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenMove();
                    }}
                    className="gap-1.5 text-xs h-7 bg-background text-foreground"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    Move {typeName.toLowerCase()}
                  </Button>
                )}
                {onNavigateToTab && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onNavigateToTab("children");
                    }}
                    className="text-xs h-7 bg-background text-foreground"
                  >
                    View {childTypeWord}
                  </Button>
                )}
              </div>
            </div>
          )}

          {isBlockedByPeople && !isBlockedByChildren && !isBlockedByRoot && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Users className="h-4 w-4" />
                <span>Assigned staff remaining</span>
              </div>
              <p className="text-muted-foreground">
                {peopleCount} people are still assigned here. Move them first.
              </p>
              {onNavigateToTab && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onNavigateToTab("people");
                  }}
                  className="text-xs h-7 bg-background text-foreground"
                >
                  View people
                </Button>
              )}
            </div>
          )}

          {blockingError && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Action Blocked</span>
              </div>
              <p className="text-muted-foreground">{blockingError}</p>
              {blockingError.includes("archive") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleArchiveInstead}
                  className="gap-1.5 text-xs h-7 bg-background text-foreground"
                >
                  <Archive className="h-3 w-3 text-amber-600" />
                  Archive instead
                </Button>
              )}
            </div>
          )}

          {/* Safe Confirmation Note (When not blocked) */}
          {!isBlocked && (
            <div className="p-4 rounded-md bg-muted/40 border border-border text-xs space-y-1.5">
              <p className="font-semibold text-foreground">Are you sure?</p>
              <p className="text-muted-foreground leading-relaxed">
                This will permanently delete <strong className="text-foreground">{unit.name}</strong> ({unit.code}). This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="text-xs h-8 text-muted-foreground"
          >
            Cancel
          </Button>

          {isBlocked ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleArchiveInstead}
              disabled={archiveMutation.isPending}
              className="gap-1.5 text-xs h-8 font-semibold rounded-lg text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            >
              {archiveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
              Archive instead
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={deleteMutation.isPending}
              className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
            >
              {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Remove {typeName}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
