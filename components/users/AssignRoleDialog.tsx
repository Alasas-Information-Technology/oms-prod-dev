"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignRole } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import { Shield, Calendar, Clock } from "lucide-react";

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

const AVAILABLE_ROLES = [
  { roleId: "3053433E-F36B-1410-85ED-009A959FB301", code: "SYSTEM_ADMIN", name: "System Administrator", desc: "Full administrative access across all modules" },
  { roleId: "3053433E-F36B-1410-85ED-009A959FB302", code: "ORG_ADMIN", name: "Organization Administrator", desc: "Manages structure, departments, and hierarchies" },
  { roleId: "3053433E-F36B-1410-85ED-009A959FB303", code: "PROCUREMENT_BUYER", name: "Procurement Buyer", desc: "Creates purchase requests and RFQs" },
  { roleId: "3053433E-F36B-1410-85ED-009A959FB304", code: "FINANCE_ANALYST", name: "Finance Analyst", desc: "Reviews budgets, allocations, and expenditures" },
  { roleId: "3053433E-F36B-1410-85ED-009A959FB305", code: "DEPARTMENT_HEAD", name: "Department Head", desc: "Approves requisitions and manages department scopes" },
  { roleId: "3053433E-F36B-1410-85ED-009A959FB306", code: "AUDITOR", name: "Compliance Auditor", desc: "Read-only compliance audit trail across all domains" },
];

export function AssignRoleDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: AssignRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = React.useState<string>("");
  const [effectiveTo, setEffectiveTo] = React.useState<string>("");

  const assignMutation = useAssignRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error("Please select a role to assign.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        userId,
        dto: {
          roleId: selectedRoleId,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : new Date().toISOString(),
          effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
        },
      });

      toast.success("Role assigned successfully.");
      onOpenChange(false);
      setSelectedRoleId("");
      setEffectiveFrom("");
      setEffectiveTo("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to assign role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            Assign Role
          </DialogTitle>
          <DialogDescription>
            Grant new operational responsibilities to <strong>{userName || "this user"}</strong>. Assignments are effective-dated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Select Role *</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((r) => (
                  <SelectItem key={r.roleId} value={r.roleId}>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Effective From */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eff-from" className="text-xs">
                Effective From (Optional)
              </Label>
              <Input
                id="eff-from"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="text-xs"
              />
              <span className="text-[11px] text-muted-foreground">Default: Immediately</span>
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label htmlFor="eff-to" className="text-xs">
                Effective To (Optional)
              </Label>
              <Input
                id="eff-to"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="text-xs"
              />
              <span className="text-[11px] text-muted-foreground">Default: Permanent</span>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending || !selectedRoleId}>
              {assignMutation.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
