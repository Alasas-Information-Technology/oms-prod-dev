"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, RotateCcw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useActivateOrgUnit, useDeactivateOrgUnit } from "@/hooks/useOrganization";
import { OrgUnitDetailDto, OrgUnitSummaryDto } from "@/lib/types/organization.types";

export interface ArchiveUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: OrgUnitDetailDto | OrgUnitSummaryDto | null;
  onSuccess?: () => void;
}

/**
 * ArchiveUnitDialog — Safe soft-deactivation flow per Part 4.3.
 *
 * Implements:
 * - "Hide this department from everyday use. Its history and past budgets stay."
 * - Reversible action.
 */
export function ArchiveUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: ArchiveUnitDialogProps) {
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  if (!unit) return null;

  const isCurrentlyActive = unit.isActive;
  const typeName = unit.type?.name || unit.orgUnitType?.name || "Department";
  const isPending = activateMutation.isPending || deactivateMutation.isPending;

  const handleToggleArchive = async () => {
    try {
      if (isCurrentlyActive) {
        await deactivateMutation.mutateAsync({
          id: unit.orgUnitId,
          effectiveTo: new Date().toISOString().split("T")[0],
        });
        toast.success(`${unit.name} archived.`);
      } else {
        await activateMutation.mutateAsync(unit.orgUnitId);
        toast.success(`${unit.name} restored from archive.`);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update archive status.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {isCurrentlyActive ? (
              <>
                <Archive className="h-5 w-5 text-amber-600" />
                Archive {unit.name}
              </>
            ) : (
              <>
                <RotateCcw className="h-5 w-5 text-primary" />
                Restore {unit.name}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isCurrentlyActive
              ? `Hide this ${typeName.toLowerCase()} from everyday use. Its history and past budgets stay.`
              : `Restore this ${typeName.toLowerCase()} to active status in the organization.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isCurrentlyActive && (
            <div className="p-3.5 rounded-md bg-muted/40 border border-border text-xs space-y-1">
              <p className="font-semibold text-foreground">What happens when archived?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                <li>The card appears faded on the organization chart (50% opacity).</li>
                <li>Past financial records, budgets, and change history are preserved.</li>
                <li>You can restore it anytime.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs h-8 text-muted-foreground"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={isCurrentlyActive ? "default" : "default"}
            size="sm"
            onClick={handleToggleArchive}
            disabled={isPending}
            className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isCurrentlyActive ? `Archive ${typeName}` : `Restore ${typeName}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
