"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrgTypeIcon } from "@/components/oms/org/OrgTypeIcon";
import { OrgUnitPicker } from "./OrgUnitPicker";
import {
  useMoveOrgUnit,
  useOrgUnit,
  useOrgUnitChildren,
  useOrgUnitAncestors,
} from "@/hooks/useOrganization";
import {
  OrgUnitDetailDto,
  OrgUnitSummaryDto,
  OrgUnitEntity,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

export interface MoveUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: OrgUnitDetailDto | OrgUnitSummaryDto | null;
  onSuccess?: () => void;
}

const STEP_TITLES = [
  "Where should it move to?",
  "Confirm what moves",
  "Confirm move",
];

export function MoveUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: MoveUnitDialogProps) {
  const [step, setStep] = React.useState<number>(1);
  const [targetParentId, setTargetParentId] = React.useState<string | null>(null);
  const [targetParentUnit, setTargetParentUnit] = React.useState<OrgUnitSummaryDto | null>(null);
  const [conflictError, setConflictError] = React.useState<string | null>(null);
  const [cycleError, setCycleError] = React.useState<string | null>(null);
  const [budgetBlockedError, setBudgetBlockedError] = React.useState<{ message: string; links?: { title: string; url: string }[] } | null>(null);

  // Queries for unit & live state
  const unitId = unit?.orgUnitId || "";
  const {
    data: liveDetail,
    isLoading: isLoadingLiveDetail,
    refetch: refetchLiveDetail,
  } = useOrgUnit(unitId, { enabled: Boolean(open && unitId) });

  const {
    data: childrenList,
    isLoading: isLoadingChildren,
    refetch: refetchChildren,
  } = useOrgUnitChildren(unitId, { enabled: Boolean(open && unitId) });

  const { data: oldAncestors, isLoading: isLoadingOldAncestors } = useOrgUnitAncestors(unitId, {
    enabled: Boolean(open && unitId),
  });

  const { data: newAncestors, isLoading: isLoadingNewAncestors } = useOrgUnitAncestors(targetParentId || undefined, {
    enabled: Boolean(open && targetParentId),
  });

  const moveMutation = useMoveOrgUnit();

  // Reset state on open
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setTargetParentId(null);
      setTargetParentUnit(null);
      setConflictError(null);
      setCycleError(null);
      setBudgetBlockedError(null);
    }
  }, [open]);

  if (!unit) return null;

  const currentDetail = liveDetail || unit;
  const typeCode = unit.type?.code || unit.orgUnitType?.code || "DEPARTMENT";
  const typeName = unit.type?.name || unit.orgUnitType?.name || "Department";

  // Allowed parent types constraint (Part 4.2 Step 1)
  const canonicalLevel = unit.type?.canonicalLevel || unit.orgUnitType?.canonicalLevel || (unit as any).depth || 3;
  // A Department (L3) moves under a Business Unit (L2) or Org (L1); Section (L4) moves under Department (L3)
  const allowedParentTypeIds =
    canonicalLevel === 4
      ? [3] // Section can move under Department
      : canonicalLevel === 3
      ? [1, 2] // Department can move under Org or Business Unit
      : canonicalLevel === 2
      ? [1] // Business Unit can move under Org
      : undefined;

  // Formatting paths
  const oldPath = React.useMemo(() => {
    if (!oldAncestors || oldAncestors.length === 0) {
      return unit.parentName ? `DIEZ › ${unit.parentName}` : "DIEZ (Top level)";
    }
    return oldAncestors.map((a) => a.name).join(" › ") + (unit.parentName && !oldAncestors.some((a) => a.name === unit.parentName) ? ` › ${unit.parentName}` : "");
  }, [oldAncestors, unit]);

  const newPath = React.useMemo(() => {
    if (!targetParentUnit) return "—";
    if (!newAncestors || newAncestors.length === 0) {
      return `DIEZ › ${targetParentUnit.name}`;
    }
    return [...newAncestors.map((a) => a.name), targetParentUnit.name].join(" › ");
  }, [newAncestors, targetParentUnit]);

  // Counts & children
  const insideChildCount = childrenList?.length ?? currentDetail.childCount ?? 0;
  const peopleCount = (currentDetail as any).peopleCount ?? (currentDetail as any).assignedUserCount ?? 0;
  const childTypeWord = canonicalLevel === 3 ? "sections" : canonicalLevel === 2 ? "departments" : "teams";

  const isLoadingCounts = isLoadingLiveDetail || isLoadingChildren || isLoadingOldAncestors || isLoadingNewAncestors;

  // Handle Step 1 Selection
  const handleSelectParent = (p: OrgUnitSummaryDto | null) => {
    setCycleError(null);
    setConflictError(null);
    setBudgetBlockedError(null);

    if (p) {
      // Client cycle check
      if (p.orgUnitId === unit.orgUnitId) {
        setCycleError("You cannot move a department into itself.");
        setTargetParentId(null);
        setTargetParentUnit(null);
        return;
      }
      if (childrenList?.some((c) => c.orgUnitId === p.orgUnitId)) {
        setCycleError(`You can't move a ${typeName.toLowerCase()} into one of its own ${childTypeWord}. Pick a different place.`);
        setTargetParentId(null);
        setTargetParentUnit(null);
        return;
      }
      setTargetParentId(p.orgUnitId);
      setTargetParentUnit(p);
    } else {
      setTargetParentId(null);
      setTargetParentUnit(null);
    }
  };

  // Reload handler on 409 Conflict
  const handleReloadConflict = async () => {
    setConflictError(null);
    await refetchLiveDetail();
    await refetchChildren();
    setStep(1);
    toast.info("Latest department version reloaded.");
  };

  // Move Execution (Part 4.2 Step 3)
  const handleExecuteMove = async () => {
    if (!targetParentId || !targetParentUnit) return;

    setConflictError(null);
    setCycleError(null);
    setBudgetBlockedError(null);

    const oldParentId = unit.parentOrgUnitId || null;
    const targetName = targetParentUnit.name;

    try {
      const moved = await moveMutation.mutateAsync({
        id: unit.orgUnitId,
        dto: {
          newParentOrgUnitId: targetParentId,
          reason: "Organizational restructure",
          rowVersion: currentDetail.rowVersion,
        },
      });

      onOpenChange(false);
      onSuccess?.();

      // 10-Second Undo Toast (Part 4.2)
      if (oldParentId) {
        toast.success(`${unit.name} moved to ${targetName}.`, {
          duration: 10000,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                // Fetch fresh rowVersion for rollback
                await moveMutation.mutateAsync({
                  id: unit.orgUnitId,
                  dto: {
                    newParentOrgUnitId: oldParentId,
                    reason: "Undo move",
                    rowVersion: moved.rowVersion,
                  },
                });
                toast.success(`${unit.name} restored to original parent.`);
                onSuccess?.();
              } catch (undoErr: unknown) {
                toast.error("Could not undo move. The organisation structure was updated.");
                onSuccess?.();
              }
            },
          },
        });
      } else {
        toast.success(`${unit.name} moved to ${targetName}.`);
      }
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      const errorCode = err?.response?.data?.code || err?.code;
      const errorMsg = err?.response?.data?.message || err?.message;

      if (status === 409 || errorCode === "ROW_VERSION_CONFLICT" || errorCode === "RECORD_MODIFIED") {
        setConflictError("Someone else changed this department while you were working. Reload to see the latest.");
      } else if (errorCode === "ORG_MOVE_CYCLE" || errorMsg?.includes("cycle") || errorMsg?.includes("descendant")) {
        setCycleError(`You can't move a ${typeName.toLowerCase()} into one of its own ${childTypeWord}. Pick a different place.`);
      } else if (errorCode === "ORG_MOVE_BLOCKED_BUDGET" || errorMsg?.includes("budget")) {
        setBudgetBlockedError({
          message: "Moving this department is blocked by active financial commitments or budget records.",
          links: [{ title: "View Department Budgets", url: `/app/budget/dept-budget?unit=${unit.orgUnitId}` }],
        });
      } else {
        toast.error(errorMsg || `Failed to move ${typeName.toLowerCase()}. Please choose a different parent.`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 sm:p-8 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Step {step} of 3: {STEP_TITLES[step - 1]}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Move {unit.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Moving <span className="font-semibold text-foreground">{unit.name}</span> will recalculate all reporting lines and descendant teams.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 pb-2">
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div
                key={title}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isDone ? "bg-primary" : isCurrent ? "bg-primary/80" : "bg-muted"
                )}
              />
            );
          })}
        </div>

        {/* 409 Conflict Banner */}
        {conflictError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-2 animate-in fade-in-50">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              <span>Conflict detected</span>
            </div>
            <p className="text-muted-foreground">{conflictError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReloadConflict}
              className="gap-1.5 text-xs h-8 bg-background"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reload latest
            </Button>
          </div>
        )}

        {/* Cycle Error Banner */}
        {cycleError && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{cycleError}</p>
          </div>
        )}

        {/* Budget Blocked Banner */}
        {budgetBlockedError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in-50">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Move Blocked</span>
            </div>
            <p>{budgetBlockedError.message}</p>
            {budgetBlockedError.links?.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary underline text-xs pt-1"
              >
                {link.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}

        {/* ===================================================================== */}
        {/* Step 1: Where To (OrgUnitPicker constrained to valid parents)          */}
        {/* ===================================================================== */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                Where should {unit.name} move to?
              </h4>
              <p className="text-xs text-muted-foreground">
                Select the target department or business unit that {unit.name} will report to.
              </p>
            </div>

            <div className="space-y-2">
              <OrgUnitPicker
                value={targetParentId}
                onChange={handleSelectParent}
                filterByType={allowedParentTypeIds}
                excludeUnitId={unit.orgUnitId}
                placeholder="Search and pick target parent..."
              />

              {targetParentId === unit.parentOrgUnitId && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {unit.name} is already situated under this parent.
                </p>
              )}
            </div>

            {/* Selected Destination Preview */}
            {targetParentUnit && targetParentId !== unit.parentOrgUnitId && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2 mt-3 animate-in fade-in-50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Destination Preview
                </span>
                <div className="flex items-center gap-3">
                  <OrgTypeIcon type={targetParentUnit.type?.code || targetParentUnit.orgUnitType?.code || "BU"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {targetParentUnit.name}
                      </span>
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                        {targetParentUnit.code}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      New Lineage: {newPath}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* Step 2: Confirm What Moves (Part 4.2 Plain-Language Block)             */}
        {/* ===================================================================== */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            {isLoadingCounts ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-medium">
                  Calculating affected teams, people, and lineage paths...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plain-language consequence box (Part 4.2 exact block) */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      {unit.name} and everything inside it will move.
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      That&apos;s <strong className="text-foreground">{insideChildCount} {childTypeWord}</strong> and{" "}
                      <strong className="text-foreground">{peopleCount} {peopleCount === 1 ? "person" : "people"}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-border/60">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground w-12 shrink-0">From:</span>
                      <span className="truncate">{oldPath}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <span className="w-12 shrink-0">To:</span>
                      <span className="truncate">{newPath}</span>
                    </div>
                  </div>

                  {/* List of affected sections / sub-units */}
                  {childrenList && childrenList.length > 0 && (
                    <div className="pt-2 border-t border-border/60 space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Affected {childTypeWord}:
                      </span>
                      <ul className="text-xs space-y-1 pl-4 list-disc text-foreground/90 max-h-36 overflow-y-auto">
                        {childrenList.map((c) => (
                          <li key={c.orgUnitId} className="truncate">
                            {c.name} <span className="font-mono text-[10px] text-muted-foreground">({c.code})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    This action will take effect immediately. You will have 10 seconds to undo the move via the toast notification.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* Step 3: Final Confirm                                                 */}
        {/* ===================================================================== */}
        {step === 3 && (
          <div className="space-y-4 py-3 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ArrowRightLeft className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Ready to move {unit.name}?
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {unit.name} and {insideChildCount} subordinate {childTypeWord} will report to{" "}
                <strong className="text-foreground">{targetParentUnit?.name}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-center gap-2">
              <span className="text-muted-foreground">{oldPath}</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{newPath}</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div>
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                disabled={moveMutation.isPending}
                className="gap-1.5 text-xs h-8 rounded-lg"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={moveMutation.isPending}
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(2)}
                disabled={!targetParentId || targetParentId === unit.parentOrgUnitId}
                className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
              >
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(3)}
                disabled={isLoadingCounts}
                className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
              >
                {isLoadingCounts ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleExecuteMove}
                disabled={moveMutation.isPending}
                className="gap-1.5 text-xs h-8 font-semibold rounded-lg bg-primary hover:bg-primary/90"
              >
                {moveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRightLeft className="h-3.5 w-3.5" />}
                Move {typeName}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
