"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateOverride } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import { Key, ShieldAlert, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AddOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

const COMMON_PERMISSIONS = [
  { id: "3053433E-F36B-1410-85ED-009A959FB501", code: "USER.CREATE", name: "Create User Accounts" },
  { id: "3053433E-F36B-1410-85ED-009A959FB502", code: "USER.DELETE", name: "Delete User Accounts" },
  { id: "3053433E-F36B-1410-85ED-009A959FB503", code: "USER.IMPORT", name: "Bulk User Import" },
  { id: "3053433E-F36B-1410-85ED-009A959FB504", code: "ORG.DELETE", name: "Delete Org Units" },
  { id: "3053433E-F36B-1410-85ED-009A959FB505", code: "PROCUREMENT.APPROVE", name: "Approve Purchase Requests" },
  { id: "3053433E-F36B-1410-85ED-009A959FB506", code: "BUDGET.REALLOCATE", name: "Reallocate Budgets" },
];

export function AddOverrideDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: AddOverrideDialogProps) {
  const [selectedPermId, setSelectedPermId] = React.useState<string>(COMMON_PERMISSIONS[0].id);
  const [isGranted, setIsGranted] = React.useState<boolean>(true);
  const [reason, setReason] = React.useState<string>("");

  const overrideMutation = useCreateOverride();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Reason is mandatory for auditing permission overrides.");
      return;
    }

    try {
      await overrideMutation.mutateAsync({
        userId,
        dto: {
          permissionId: selectedPermId,
          isGranted,
          reason: reason.trim(),
        },
      });

      toast.success(
        `Permission override (${isGranted ? "Grant" : "Revoke"}) created successfully.`
      );
      onOpenChange(false);
      setReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create override");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            Add Permission Override
          </DialogTitle>
          <DialogDescription>
            Explicitly grant or revoke a single permission for <strong>{userName || "this user"}</strong>. Override rules take precedence over role assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Action Type: Grant vs Revoke */}
          <div className="space-y-2">
            <Label>Override Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsGranted(true)}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  isGranted
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-card border-border hover:bg-muted/50"
                }`}
              >
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-xs">Grant Access</p>
                  <p className="text-[11px] text-muted-foreground">Add specific capability</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsGranted(false)}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  !isGranted
                    ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "bg-card border-border hover:bg-muted/50"
                }`}
              >
                <XCircle className="size-4 text-rose-500 shrink-0" />
                <div>
                  <p className="font-semibold text-xs">Revoke Access</p>
                  <p className="text-[11px] text-muted-foreground">Block capability explicitly</p>
                </div>
              </button>
            </div>
          </div>

          {/* Target Permission */}
          <div className="space-y-2">
            <Label htmlFor="perm-select">Target Permission *</Label>
            <select
              id="perm-select"
              value={selectedPermId}
              onChange={(e) => setSelectedPermId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COMMON_PERMISSIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mandatory Reason */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason">Business Justification / Reason *</Label>
              <span className="text-[11px] text-rose-500 font-semibold">Mandatory</span>
            </div>
            <Textarea
              id="reason"
              rows={3}
              placeholder="State the audit justification or ticket reference for this override..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={overrideMutation.isPending || !reason.trim()}>
              {overrideMutation.isPending ? "Applying..." : "Apply Override"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
