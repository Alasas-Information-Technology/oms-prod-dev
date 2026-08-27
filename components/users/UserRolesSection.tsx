"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  Shield,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleOption } from "@/components/users/RoleOption";
import {
  ROLE_DEFINITIONS,
  getRoleDisplayName,
  getRoleExplanation,
} from "@/lib/constants/user-admin.constants";
import {
  UserDetailDto,
  IUserRoleAssignmentDto,
} from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useMasterRoles } from "@/hooks/useAuthorization";
import { format, isFuture, isPast } from "date-fns";

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

// Master list of internal roles
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
  serverRoles,
  stagedRoles,
  onToggleRole,
  onUpdateRoleDates,
  className,
}: UserRolesSectionProps) {
  const { can } = usePermission();
  const canAssignRoles = can("USER.ROLE.ASSIGN");
  const { data: masterRoles } = useMasterRoles();

  // Track expanded date editor state per role
  const [expandedDatesRole, setExpandedDatesRole] = React.useState<string | null>(null);

  // Vendor users NEVER see this section at all (Rule V3)
  if (user.userType === "VENDOR") {
    return null;
  }

  // Count active staged roles
  const activeRolesCount = Array.from(stagedRoles.values()).filter(
    (r) => r.isAssigned
  ).length;

  return (
    <div id="roles-section" className={cn("space-y-4 pt-2", className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Roles
        </h3>
        <span className="text-xs text-muted-foreground">
          {activeRolesCount} {activeRolesCount === 1 ? "role assigned" : "roles assigned"}
        </span>
      </div>

      {/* Warning if 0 roles assigned (§Part 3.5) */}
      {activeRolesCount === 0 && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-3 text-xs animate-in fade-in-50">
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

      {/* Read-only notification if user lacks USER.ROLE.ASSIGN */}
      {!canAssignRoles && (
        <div className="p-3 rounded-xl border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="size-3.5 text-muted-foreground shrink-0" />
          <span>Role assignments are managed by administrators with role assignment authority.</span>
        </div>
      )}

      {/* Role Options Checkbox List */}
      <div className="space-y-2.5">
        {INTERNAL_ROLES.map(({ code, roleId: fallbackRoleId }) => {
          const resolvedRole = masterRoles?.find(
            (mr) => mr.roleCode.toUpperCase() === code.toUpperCase()
          );
          const effectiveRoleId = resolvedRole?.roleId || fallbackRoleId;

          const staged = stagedRoles.get(code);
          const isChecked = Boolean(staged?.isAssigned);
          const isDateExpanded = expandedDatesRole === code;

          // Compute future start date string formatted as "1 Oct 2026", never ISO
          let futureStartDateStr: string | null = null;
          if (staged?.effectiveFrom) {
            try {
              const startD = new Date(staged.effectiveFrom);
              if (!isNaN(startD.getTime()) && isFuture(startD)) {
                futureStartDateStr = format(startD, "d MMM yyyy");
              }
            } catch {
              futureStartDateStr = null;
            }
          }

          return (
            <div key={code} className="space-y-2">
              <RoleOption
                roleCode={code}
                checked={isChecked}
                onCheckedChange={() => onToggleRole(code, effectiveRoleId)}
                readOnly={!canAssignRoles}
                futureStartDate={futureStartDateStr}
                onSetDatesClick={() =>
                  setExpandedDatesRole(isDateExpanded ? null : code)
                }
              />

              {/* Advanced Effective Dating (Collapsed by default per §Part 3.5) */}
              {isDateExpanded && isChecked && canAssignRoles && (
                <div className="ml-7 p-3 rounded-lg border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in-50">
                  <div className="space-y-1">
                    <Label htmlFor={`start-${code}`} className="text-[11px] text-muted-foreground">
                      Starts (Defaults to immediate)
                    </Label>
                    <Input
                      id={`start-${code}`}
                      type="date"
                      value={staged?.effectiveFrom ? staged.effectiveFrom.substring(0, 10) : ""}
                      onChange={(e) =>
                        onUpdateRoleDates(
                          code,
                          effectiveRoleId,
                          e.target.value ? new Date(e.target.value).toISOString() : undefined,
                          staged?.effectiveTo
                        )
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`end-${code}`} className="text-[11px] text-muted-foreground">
                      Ends (Optional / Permanent)
                    </Label>
                    <Input
                      id={`end-${code}`}
                      type="date"
                      value={staged?.effectiveTo ? staged.effectiveTo.substring(0, 10) : ""}
                      onChange={(e) =>
                        onUpdateRoleDates(
                          code,
                          effectiveRoleId,
                          staged?.effectiveFrom,
                          e.target.value ? new Date(e.target.value).toISOString() : undefined
                        )
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
