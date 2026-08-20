"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRightLeft, AlertTriangle, Loader2 } from "lucide-react";
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
import { OrgUnitPicker } from "./OrgUnitPicker";
import { useMoveOrgUnit, useOrgUnit } from "@/hooks/useOrganization";
import { OrgUnitDetailDto, OrgUnitSummaryDto } from "@/lib/types/organization.types";

export interface MoveUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: OrgUnitDetailDto | OrgUnitSummaryDto | null;
  onSuccess?: () => void;
}

export function MoveUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: MoveUnitDialogProps) {
  const [targetParentId, setTargetParentId] = React.useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = React.useState("");
  const [reason, setReason] = React.useState("");

  // Fetch live detail for affected descendant count and fresh rowVersion token
  const { data: liveDetail, isLoading: isLoadingDetail } = useOrgUnit(
    unit?.orgUnitId || ""
  );

  const moveMutation = useMoveOrgUnit();

  React.useEffect(() => {
    if (open) {
      setTargetParentId(null);
      setConfirmationCode("");
      setReason("");
    }
  }, [open]);

  if (!unit) return null;

  const currentDetail = liveDetail || unit;
  const descendantCount =
    "descendantCount" in currentDetail && currentDetail.descendantCount !== undefined
      ? currentDetail.descendantCount
      : 0;

  const isCodeMatch = confirmationCode.trim() === unit.code;
  const isTargetValid = Boolean(targetParentId && targetParentId !== unit.parentOrgUnitId && targetParentId !== unit.orgUnitId);
  const canConfirm = isCodeMatch && isTargetValid && !moveMutation.isPending;

  const handleMove = async () => {
    if (!targetParentId || !canConfirm) return;

    try {
      await moveMutation.mutateAsync({
        id: unit.orgUnitId,
        dto: {
          newParentOrgUnitId: targetParentId,
          reason: reason.trim() || "Organizational restructuring move",
          rowVersion: currentDetail.rowVersion,
        },
      });

      toast.success(
        `Successfully moved ${unit.name} (${unit.code}) and ${descendantCount} descendant unit(s).`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to move organization unit. Please check hierarchy rules.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Move Organization Unit Subtree
          </DialogTitle>
          <DialogDescription>
            Reparent <span className="font-semibold text-foreground">{unit.name}</span> (
            <span className="font-mono text-xs font-semibold px-1 py-0.5 bg-muted rounded">
              {unit.code}
            </span>
            ) to a new parent in the organizational hierarchy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Descendant Impact Warning */}
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-semibold">Subtree Impact Notice</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-1">
              Moving this unit will also reparent all{" "}
              <span className="font-bold underline">{descendantCount} child/descendant units</span> beneath it. Transitive closure relations and materialized paths will be atomically recalculated.
            </AlertDescription>
          </Alert>

          {/* New Parent Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Select New Parent Unit <span className="text-destructive">*</span>
            </Label>
            <OrgUnitPicker
              value={targetParentId}
              onChange={(p) => setTargetParentId(p ? p.orgUnitId : null)}
              excludeUnitId={unit.orgUnitId}
              placeholder="Search and pick target parent unit..."
            />
            {targetParentId === unit.parentOrgUnitId && (
              <p className="text-xs text-amber-600">
                Unit is already situated under this parent.
              </p>
            )}
          </div>

          {/* Business Reason */}
          <div className="space-y-2">
            <Label htmlFor="moveReason" className="text-sm font-semibold">
              Reorganization Reason
            </Label>
            <Input
              id="moveReason"
              placeholder="e.g. Executive reorganization Q3 2026"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Explicit Confirmation Input */}
          <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">
            <Label htmlFor="confirmCode" className="text-sm font-semibold text-foreground">
              Type <span className="font-mono text-destructive font-bold">{unit.code}</span> to confirm this action:
            </Label>
            <Input
              id="confirmCode"
              placeholder={unit.code}
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="font-mono uppercase bg-background"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!canConfirm}
            onClick={handleMove}
            className="min-w-[140px]"
          >
            {moveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Moving Subtree...
              </>
            ) : (
              "Confirm Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
