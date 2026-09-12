"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  AlertTriangle,
  Lock,
  Calendar,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getRoleDisplayName,
  getRoleExplanation,
} from "@/lib/constants/user-admin.constants";
import {
  UserDetailDto,
  IUserRoleAssignmentDto,
} from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useMasterRoles } from "@/hooks/useAuthorization";
import { format, isFuture } from "date-fns";
import { UserPanelCard, UserPanelRow } from "@/components/users/UserPanelCard";

export interface StagedRoleState {
  roleCode: string;
  roleId: string;
  isAssigned: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  expandedDates?: boolean;
}

export interface UserRolesSectionProps {
  user: UserDetailDto;
  serverRoles: IUserRoleAssignmentDto[];
  stagedRoles: Map<string, StagedRoleState>;
  onToggleRole: (roleCode: string, roleId: string) => void;
  onUpdateRoleDates: (
    roleCode: string,
    roleId: string,
    effectiveFrom?: string,
    effectiveTo?: string
  ) => void;
  className?: string;
}

const INTERNAL_ROLES = [
  { code: "HOD", roleId: "3053433E-F36B-1410-85ED-009A959FB305" },
  { code: "LINE_MANAGER", roleId: "3053433E-F36B-1410-85ED-009A959FB307" },
  { code: "REQUESTOR", roleId: "3053433E-F36B-1410-85ED-009A959FB308" },
  { code: "HR", roleId: "3053433E-F36B-1410-85ED-009A959FB309" },
  { code: "FINANCE", roleId: "3053433E-F36B-1410-85ED-009A959FB304" },
  { code: "PROCUREMENT", roleId: "3053433E-F36B-1410-85ED-009A959FB303" },
  { code: "INTERVIEWER", roleId: "3053433E-F36B-1410-85ED-009A959FB310" },
  { code: "MAIN_INTERVIEWER", roleId: "3053433E-F36B-1410-85ED-009A959FB311" },
  { code: "WORK_COMPLETION_ASSIGNEE", roleId: "3053433E-F36B-1410-85ED-009A959FB312" },
  { code: "AUDITOR", roleId: "3053433E-F36B-1410-85ED-009A959FB306" },
  { code: "ORG_ADMIN", roleId: "3053433E-F36B-1410-85ED-009A959FB302" },
  { code: "SYSTEM_ADMIN", roleId: "3053433E-F36B-1410-85ED-009A959FB301" },
];

export function UserRolesSection({
  user,
  stagedRoles,
  onToggleRole,
  onUpdateRoleDates,
  className,
}: UserRolesSectionProps) {
  const { can } = usePermission();
  const canAssignRoles = can("USER.ROLE.ASSIGN");
  const { data: masterRoles } = useMasterRoles();

  const [expandedDatesRole, setExpandedDatesRole] = React.useState<string | null>(null);

  if (user.userType === "VENDOR") {
    return null;
  }

  const allRoles = INTERNAL_ROLES.map(({ code, roleId: fallbackRoleId }) => {
    const resolvedRole = masterRoles?.find(
      (mr) => mr.roleCode.toUpperCase() === code.toUpperCase()
    );
    const effectiveRoleId = resolvedRole?.roleId || fallbackRoleId;
    const staged = stagedRoles.get(code);
    return {
      code,
      roleId: effectiveRoleId,
      staged,
      isAssigned: Boolean(staged?.isAssigned),
    };
  });

  const assignedRoles = allRoles.filter((r) => r.isAssigned);
  const availableRoles = allRoles.filter((r) => !r.isAssigned);

  return (
    <div id="roles-section" className={cn("space-y-6", className)}>
      {!canAssignRoles && (
        <div className="p-4 rounded-md border bg-muted/40 text-[13px] text-muted-foreground flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground shrink-0" />
          <span>Role assignments are managed by administrators with role assignment authority.</span>
        </div>
      )}

      {/* Warning if 0 roles assigned */}
      {assignedRoles.length === 0 && (
        <div className="p-4 rounded-md border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900 dark:text-amber-300">
              No roles assigned
            </p>
            <p className="text-amber-800/90 dark:text-amber-400 leading-relaxed">
              They&apos;ll be able to sign in but won&apos;t be able to do anything.
            </p>
          </div>
        </div>
      )}

      {/* Assigned Roles Card */}
      {assignedRoles.length > 0 && (
        <UserPanelCard title="Assigned roles">
          {assignedRoles.map(({ code, roleId, staged }) => {
            let futureStartDateStr: string | null = null;
            if (staged?.effectiveFrom) {
              try {
                const startD = new Date(staged.effectiveFrom);
                if (!isNaN(startD.getTime()) && isFuture(startD)) {
                  futureStartDateStr = format(startD, "d MMM yyyy");
                }
              } catch {}
            }

            return (
              <UserPanelRow key={code} className="flex-col !items-stretch !py-0 !px-0">
                <div className="flex items-center justify-between px-6 py-3 min-h-14">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{getRoleDisplayName(code)}</span>
                    <span className="text-muted-foreground">{getRoleExplanation(code)}</span>
                    {futureStartDateStr && (
                      <span className="text-primary font-medium mt-1">Starts {futureStartDateStr}</span>
                    )}
                  </div>
                  {canAssignRoles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleRole(code, roleId)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 -mr-2"
                    >
                      <X className="size-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </UserPanelRow>
            );
          })}
        </UserPanelCard>
      )}

      {/* Available Roles Card */}
      {availableRoles.length > 0 && (
        <UserPanelCard title="Available roles">
          {availableRoles.map(({ code, roleId, staged }) => {
            const isDateExpanded = expandedDatesRole === code;

            return (
              <UserPanelRow key={code} className="flex-col !items-stretch !py-0 !px-0">
                <div className="flex items-center justify-between px-6 py-3 min-h-14">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{getRoleDisplayName(code)}</span>
                    <span className="text-muted-foreground">{getRoleExplanation(code)}</span>
                  </div>
                  {canAssignRoles && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setExpandedDatesRole(isDateExpanded ? null : code)}
                        className="text-[12px] h-8 text-muted-foreground"
                      >
                        Set dates
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleRole(code, roleId)}
                        className="h-8 px-3 rounded-md shadow-xs border-border/80 text-foreground"
                      >
                        <Plus className="size-4 mr-1" /> Add
                      </Button>
                    </div>
                  )}
                </div>

                {isDateExpanded && (
                  <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`start-${code}`} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Starts</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            id={`start-${code}`}
                            type="date"
                            value={staged?.effectiveFrom || ""}
                            onChange={(e) => onUpdateRoleDates(code, roleId, e.target.value, staged?.effectiveTo)}
                            className="pl-9 h-9 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`end-${code}`} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ends</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            id={`end-${code}`}
                            type="date"
                            value={staged?.effectiveTo || ""}
                            onChange={(e) => onUpdateRoleDates(code, roleId, staged?.effectiveFrom, e.target.value)}
                            className="pl-9 h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </UserPanelRow>
            );
          })}
        </UserPanelCard>
      )}
    </div>
  );
}
