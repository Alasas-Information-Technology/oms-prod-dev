"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  UserCheck,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  Clock,
  Crown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Timeline, TimelineItem } from "@/components/shared/Timeline";
import {
  useOrgUnitManagers,
  useOrgUnitCurrentHead,
  useAssignManager,
  useUpdateManager,
  useRemoveManager,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitManagerDto,
  ManagerRoleCode,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";

export interface ManagerAssignmentPanelProps {
  orgUnitId: string;
  unitName: string;
}

export function ManagerAssignmentPanel({
  orgUnitId,
  unitName,
}: ManagerAssignmentPanelProps) {
  const { can } = usePermission();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedManager, setSelectedManager] = React.useState<OrgUnitManagerDto | null>(null);

  // Form states for assignment
  const [userId, setUserId] = React.useState("");
  const [roleCode, setRoleCode] = React.useState<ManagerRoleCode>(ManagerRoleCode.HEAD);
  const [isPrimary, setIsPrimary] = React.useState(true);
  const [effectiveFrom, setEffectiveFrom] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [reason, setReason] = React.useState("");

  // Edit states
  const [editEffectiveTo, setEditEffectiveTo] = React.useState("");

  const { data: managersList, isLoading: isLoadingManagers } = useOrgUnitManagers(orgUnitId);
  const { data: currentHead, isLoading: isLoadingHead } = useOrgUnitCurrentHead(orgUnitId);

  const assignMutation = useAssignManager();
  const updateMutation = useUpdateManager();
  const removeMutation = useRemoveManager();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !effectiveFrom) {
      toast.error("User ID and Effective From date are required.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        unitId: orgUnitId,
        dto: {
          userId: userId.trim(),
          managerRoleCode: roleCode,
          isPrimary,
          effectiveFrom,
          effectiveTo: effectiveTo || null,
          assignmentReason: reason.trim() || undefined,
        },
      });

      toast.success("Manager assigned successfully.");
      setIsAssignDialogOpen(false);
      // Reset form
      setUserId("");
      setReason("");
      setEffectiveTo("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to assign manager.";
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    try {
      await updateMutation.mutateAsync({
        managerId: selectedManager.orgUnitManagerId,
        dto: {
          effectiveTo: editEffectiveTo || null,
        },
      });

      toast.success("Manager tenure updated successfully.");
      setIsEditDialogOpen(false);
      setSelectedManager(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update manager.";
      toast.error(errorMsg);
    }
  };

  const handleRemove = async (managerId: string) => {
    if (!confirm("Are you sure you want to remove this manager assignment?")) return;

    try {
      await removeMutation.mutateAsync(managerId);
      toast.success("Manager assignment removed successfully.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to remove manager assignment.";
      toast.error(errorMsg);
    }
  };

  // Build timeline items from managersList
  const timelineItems: TimelineItem[] = React.useMemo(() => {
    if (!managersList) return [];

    return managersList.map((m) => {
      const isCurrent =
        Boolean(m.isActive) &&
        (!m.effectiveTo || new Date(m.effectiveTo).getTime() >= Date.now()) &&
        (!m.effectiveFrom || new Date(m.effectiveFrom).getTime() <= Date.now());

      const fromStr = m.effectiveFrom ? String(m.effectiveFrom).split("T")[0] : "Past";
      const toStr = m.effectiveTo ? String(m.effectiveTo).split("T")[0] : "Present";

      const managerName = m.userDisplayName || m.username || m.userId || "Manager";
      return {
        id: m.orgUnitManagerId,
        title: `${managerName} — ${m.managerRoleCode}`,
        description: m.assignmentReason || undefined,
        timestamp: `${fromStr} → ${toStr}`,
        status: isCurrent ? "completed" : "pending",
        user: {
          name: managerName,
          role: m.userEmail || undefined,
        },
        meta: m.isPrimary ? "PRIMARY" : undefined,
      };
    });
  }, [managersList]);

  return (
    <div className="space-y-6">
      {/* Header with Assign Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Leadership & Manager Assignments
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Temporal management assignments and primary approval routing head for {unitName}.
          </p>
        </div>

        {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && (
          <Button onClick={() => setIsAssignDialogOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Assign Manager
          </Button>
        )}
      </div>

      {/* Active Primary Head Card */}
      <div className="p-4 rounded-md border border-primary/20 bg-primary/5 dark:bg-primary/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Current Primary Head
                </span>
                <Badge variant="default" className="text-[10px] py-0 px-1.5 font-mono">
                  RULE G7 ACTIVE
                </Badge>
              </div>
              {isLoadingHead ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resolving active head...
                </div>
              ) : currentHead ? (
                <div className="mt-1">
                  <p className="text-base font-bold text-foreground">
                    {currentHead.userDisplayName || currentHead.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentHead.userEmail} · Effective since{" "}
                    {String(currentHead.effectiveFrom).split("T")[0]}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-1">
                  No active primary head currently assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manager History List & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / Cards List */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Assignment Records</h4>

          {isLoadingManagers ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading manager history...
            </div>
          ) : !managersList || managersList.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              No manager assignments on record.
            </div>
          ) : (
            <div className="space-y-2">
              {managersList.map((mgr) => {
                const isActivePeriod =
                  mgr.isActive &&
                  (!mgr.effectiveTo || new Date(mgr.effectiveTo) >= new Date()) &&
                  new Date(mgr.effectiveFrom) <= new Date();

                return (
                  <div
                    key={mgr.orgUnitManagerId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {mgr.userDisplayName || mgr.username}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {mgr.managerRoleCode}
                          </Badge>
                          {mgr.isPrimary && (
                            <Badge variant="default" className="text-[10px] py-0 bg-primary">
                              PRIMARY
                            </Badge>
                          )}
                          <StatusBadge
                            status={isActivePeriod ? "active" : "expired"}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {String(mgr.effectiveFrom).split("T")[0]} →{" "}
                            {mgr.effectiveTo
                              ? String(mgr.effectiveTo).split("T")[0]
                              : "Indefinite"}
                          </span>
                          {mgr.assignmentReason && (
                            <span>· {mgr.assignmentReason}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && (
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedManager(mgr);
                            setEditEffectiveTo(
                              mgr.effectiveTo
                                ? String(mgr.effectiveTo).split("T")[0]
                                : ""
                            );
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 px-2 text-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(mgr.orgUnitManagerId)}
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline View */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tenure Timeline
          </h4>
          <div className="p-4 rounded-md border border-border bg-card">
            {timelineItems.length > 0 ? (
              <Timeline items={timelineItems} />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Timeline is empty.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Assign Manager Modal */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <UserCheck className="h-5 w-5 text-primary" />
              Assign Manager to Unit
            </DialogTitle>
            <DialogDescription>
              Assign leadership roles with strict temporal consistency (Rule G1–G7).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssign} className="space-y-4 py-2">
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="assignUserId" className="text-sm font-semibold">
                User ID / Employee GUID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assignUserId"
                placeholder="e.g. 1053433E-F36B-1410-85ED-009A959FB122"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="font-mono text-sm"
              />
            </div>

            {/* Role Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleCode" className="text-sm font-semibold">
                  Manager Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={roleCode}
                  onValueChange={(val) => setRoleCode(val as ManagerRoleCode)}
                >
                  <SelectTrigger id="roleCode">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ManagerRoleCode.HEAD}>HEAD (Primary Leader)</SelectItem>
                    <SelectItem value={ManagerRoleCode.ACTING_HEAD}>ACTING HEAD</SelectItem>
                    <SelectItem value={ManagerRoleCode.DEPUTY}>DEPUTY</SelectItem>
                    <SelectItem value={ManagerRoleCode.ASSISTANT}>ASSISTANT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Toggle */}
              <div className="flex flex-col justify-end pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isPrimaryCheck"
                    checked={isPrimary}
                    onCheckedChange={(c) => setIsPrimary(Boolean(c))}
                  />
                  <Label htmlFor="isPrimaryCheck" className="text-sm font-semibold cursor-pointer">
                    Primary Manager (G2/G6)
                  </Label>
                </div>
              </div>
            </div>

            {isPrimary && (
              <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded border border-amber-200 dark:border-amber-800">
                Rule G2 Notice: Assigning a new primary HEAD will automatically end the previous primary HEAD on the day prior to this Effective From date.
              </p>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom" className="text-sm font-semibold">
                  Effective From <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo" className="text-sm font-semibold">
                  Effective To
                </Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">
                Assignment Reason
              </Label>
              <Input
                id="reason"
                placeholder="e.g. Appointed as Department Director"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Confirm Assignment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Manager Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Manager Tenure</DialogTitle>
            <DialogDescription>
              Update end date for {selectedManager?.userDisplayName || selectedManager?.username}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editEffectiveTo" className="text-sm font-semibold">
                Effective To Date
              </Label>
              <Input
                id="editEffectiveTo"
                type="date"
                value={editEffectiveTo}
                onChange={(e) => setEditEffectiveTo(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Tenure"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
