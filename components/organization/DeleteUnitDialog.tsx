"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeleteOrgUnit, useOrgUnit } from "@/hooks/useOrganization";
import { OrgUnitDetailDto, OrgUnitSummaryDto } from "@/lib/types/organization.types";

export interface DeleteUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: OrgUnitDetailDto | OrgUnitSummaryDto | null;
  onSuccess?: () => void;
}

export function DeleteUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: DeleteUnitDialogProps) {
  const [confirmationCode, setConfirmationCode] = React.useState("");

  const { data: liveDetail } = useOrgUnit(unit?.orgUnitId || "");
  const deleteMutation = useDeleteOrgUnit();

  React.useEffect(() => {
    if (open) {
      setConfirmationCode("");
    }
  }, [open]);

  if (!unit) return null;

  const currentDetail = liveDetail || unit;
  const childCount =
    "childCount" in currentDetail && currentDetail.childCount !== undefined
      ? currentDetail.childCount
      : 0;

  const hasChildren = childCount > 0;
  const isCodeMatch = confirmationCode.trim() === unit.code;
  const canConfirm = isCodeMatch && !hasChildren && !deleteMutation.isPending;

  const handleDelete = async () => {
    if (!canConfirm) return;

    try {
      await deleteMutation.mutateAsync(unit.orgUnitId);
      toast.success(`Successfully deleted organization unit ${unit.name} (${unit.code}).`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to delete organization unit. Ensure no active children or references exist.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Organization Unit
          </DialogTitle>
          <DialogDescription>
            You are attempting to delete <span className="font-semibold text-foreground">{unit.name}</span> (
            <span className="font-mono text-xs font-semibold px-1 py-0.5 bg-muted rounded">
              {unit.code}
            </span>
            ).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasChildren ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Deletion Blocked (Rule D2)</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                This unit currently has <span className="font-bold">{childCount} active child unit(s)</span>. All child units must be moved or deleted before this unit can be removed.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Warning: Permanent Impact</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Deleting this organization unit will remove its active hierarchy position and closure associations. Downstream references will be validated prior to deletion.
              </AlertDescription>
            </Alert>
          )}

          {!hasChildren && (
            <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">
              <Label htmlFor="confirmDeleteCode" className="text-sm font-semibold text-foreground">
                Type <span className="font-mono text-destructive font-bold">{unit.code}</span> to confirm deletion:
              </Label>
              <Input
                id="confirmDeleteCode"
                placeholder={unit.code}
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="font-mono uppercase bg-background"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canConfirm}
            onClick={handleDelete}
            className="min-w-[130px]"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
