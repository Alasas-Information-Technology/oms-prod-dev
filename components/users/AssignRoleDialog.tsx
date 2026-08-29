"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignRole, useMasterRoles } from "@/hooks/useAuthorization";
import { ROLE_DEFINITIONS, getRoleDisplayName, getRoleExplanation } from "@/lib/constants/user-admin.constants";
import { toast } from "sonner";
import { Shield, Clock, Calendar, CheckCircle2 } from "lucide-react";

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: AssignRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = React.useState<string>("");
  const [effectiveTo, setEffectiveTo] = React.useState<string>("");

  const { data: masterRoles } = useMasterRoles();
  const assignMutation = useAssignRole();

  const availableRoles = React.useMemo(() => {
    if (masterRoles && masterRoles.length > 0) {
      return masterRoles
        .filter((r) => !r.roleCode.startsWith("VENDOR"))
        .map((r) => ({
          roleId: r.roleId,
          code: r.roleCode,
          name: r.roleName || getRoleDisplayName(r.roleCode),
          desc: r.description || getRoleExplanation(r.roleCode),
        }));
    }
    return [
      { roleId: "HOD", code: "HOD", name: "Head of Department", desc: "Approves requisitions and manages department scopes" },
      { roleId: "LINE_MANAGER", code: "LINE_MANAGER", name: "Line Manager", desc: "Supervises direct team members" },
      { roleId: "REQUESTOR", code: "REQUESTOR", name: "Requestor", desc: "Submits operational requisitions and resource requests" },
      { roleId: "HR", code: "HR", name: "Human Resources", desc: "Manages candidate onboarding and review" },
      { roleId: "FINANCE", code: "FINANCE", name: "Finance Officer", desc: "Reviews budget allocations and tracks expenditures" },
      { roleId: "PROCUREMENT", code: "PROCUREMENT", name: "Procurement Specialist", desc: "Coordinates vendor sourcing and purchasing" },
      { roleId: "AUDITOR", code: "AUDITOR", name: "Compliance Auditor", desc: "Read-only compliance audit trail across all domains" },
      { roleId: "ORG_ADMIN", code: "ORG_ADMIN", name: "Organization Administrator", desc: "Manages structure, departments, and hierarchies" },
      { roleId: "SYSTEM_ADMIN", code: "SYSTEM_ADMIN", name: "System Administrator", desc: "Full administrative access across all modules" },
    ];
  }, [masterRoles]);

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
          ...(effectiveTo ? { effectiveTo: new Date(effectiveTo).toISOString() } : {}),
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
                {availableRoles.map((r) => (
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
