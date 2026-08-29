"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import {
  SCOPE_LEVEL_DEFINITIONS,
} from "@/lib/constants/user-admin.constants";
import {
  UserDetailDto,
  IUserScopeAssignmentDto,
} from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { useScopeCoveragePreview } from "@/hooks/useAuthorization";
import { useOrgUnits } from "@/hooks/useOrganization";
import { UserPanelCard, UserPanelRow } from "@/components/users/UserPanelCard";

export interface StagedScopeState {
  levelCode: "GLOBAL" | "ORGANIZATION" | "BUSINESS_UNIT" | "DEPARTMENT" | "SECTION" | "SELF_ONLY";
  scopeDefinitionId: string;
  orgUnitId?: string | null;
  orgUnitName?: string | null;
}

export interface UserScopeSectionProps {
  user: UserDetailDto;
  serverScopes: IUserScopeAssignmentDto[];
  stagedScope: StagedScopeState;
  onChangeScope: (newScope: StagedScopeState) => void;
  className?: string;
}

export function UserScopeSection({
  user,
  stagedScope,
  onChangeScope,
  className,
}: UserScopeSectionProps) {
  const { can } = usePermission();
  const { user: currentAdmin } = useAuth();
  const canAssignScope = can("USER.SCOPE.ASSIGN");

  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = React.useState(false);

  // Calculate current admin's broadest scope level rank for Rule S4 filtering
  const currentAdminBroadestRank = React.useMemo(() => {
    if (!currentAdmin) return 1;
    const adminScopes = currentAdmin.scopes || [];
    if (adminScopes.some((s) => s.scopeCode === "GLOBAL" || s.scopeCode === "ORGANIZATION")) {
      return 1;
    }
    if (adminScopes.some((s) => s.scopeCode === "BUSINESS_UNIT")) {
      return 2;
    }
    if (adminScopes.some((s) => s.scopeCode === "DEPARTMENT")) {
      return 3;
    }
    if (adminScopes.some((s) => s.scopeCode === "SECTION")) {
      return 4;
    }
    return 5;
  }, [currentAdmin]);

  // Filter available levels based on Rule S4 (Broader levels are HIDDEN, not disabled)
  const visibleLevels = React.useMemo(() => {
    return SCOPE_LEVEL_DEFINITIONS.filter(
      (level) => level.hierarchyRank >= currentAdminBroadestRank
    );
  }, [currentAdminBroadestRank]);

  // Current selected level definition
  const selectedLevelDef = SCOPE_LEVEL_DEFINITIONS.find(
    (l) => l.code === stagedScope.levelCode
  ) || SCOPE_LEVEL_DEFINITIONS[0];

  const isTargetOrgUnitRequired =
    selectedLevelDef.code === "BUSINESS_UNIT" ||
    selectedLevelDef.code === "DEPARTMENT" ||
    selectedLevelDef.code === "SECTION";

  const shouldFetchPreview =
    Boolean(selectedLevelDef.scopeDefinitionId) &&
    selectedLevelDef.code !== "SELF_ONLY" &&
    (!isTargetOrgUnitRequired || Boolean(stagedScope.orgUnitId));

  const { data: coveragePreview } =
    useScopeCoveragePreview(
      shouldFetchPreview ? selectedLevelDef.scopeDefinitionId : undefined,
      shouldFetchPreview ? (stagedScope.orgUnitId || undefined) : undefined,
      {
        enabled: shouldFetchPreview,
      }
    );

  const { data: allUnitsData } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const allDepartments = React.useMemo(() => {
    const rawData = allUnitsData as any;
    const items: OrgUnitSummaryDto[] = Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData)
      ? rawData
      : [];
    return items.filter((u) => u.orgUnitTypeId === 3);
  }, [allUnitsData]);

  const liveCountSentence = React.useMemo(() => {
    if (selectedLevelDef.code === "GLOBAL") {
      const count = coveragePreview?.accessibleOrgUnitsCount ?? allDepartments.length;
      return `This gives access to ${count} departments.`;
    }
    if (selectedLevelDef.code === "SELF_ONLY") {
      return "This gives access to 0 departments.";
    }
    if (isTargetOrgUnitRequired) {
      if (!stagedScope.orgUnitId) {
        return `Select a unit to see accessible departments.`;
      }
      const count = coveragePreview?.accessibleOrgUnitsCount ?? 1;
      return `This gives access to ${count} department${count === 1 ? "" : "s"}.`;
    }
    return "This gives access to 0 departments.";
  }, [
    selectedLevelDef.code,
    coveragePreview,
    allDepartments.length,
    isTargetOrgUnitRequired,
    stagedScope.orgUnitId,
  ]);

  const handleLevelChange = (newLevelCode: string) => {
    const targetDef = SCOPE_LEVEL_DEFINITIONS.find((l) => l.code === newLevelCode);
    if (!targetDef) return;

    onChangeScope({
      levelCode: targetDef.code as any,
      scopeDefinitionId: targetDef.scopeDefinitionId,
      orgUnitId: targetDef.code === "SELF_ONLY" || targetDef.code === "GLOBAL" ? null : stagedScope.orgUnitId,
      orgUnitName: targetDef.code === "SELF_ONLY" || targetDef.code === "GLOBAL" ? null : stagedScope.orgUnitName,
    });
  };

  const handleOrgUnitSelect = (unit?: OrgUnitSummaryDto | null) => {
    onChangeScope({
      ...stagedScope,
      orgUnitId: unit?.orgUnitId || null,
      orgUnitName: unit?.name || null,
    });
  };

  if (user.userType === "VENDOR") {
    return null;
  }

  // Generate mocked resolved list for display based on scope choice
  const resolvedDepartmentsList = React.useMemo(() => {
    if (selectedLevelDef.code === "SELF_ONLY") return [];
    if (selectedLevelDef.code === "GLOBAL") return allDepartments;
    if (stagedScope.orgUnitId && stagedScope.orgUnitName) {
      if (selectedLevelDef.code === "DEPARTMENT") {
        return [{ orgUnitId: stagedScope.orgUnitId, name: stagedScope.orgUnitName }];
      }
      return allDepartments.slice(0, coveragePreview?.accessibleOrgUnitsCount || 5);
    }
    return [];
  }, [selectedLevelDef.code, allDepartments, stagedScope, coveragePreview]);

  const departmentsToShow = isDepartmentsExpanded ? resolvedDepartmentsList : resolvedDepartmentsList.slice(0, 10);
  const hiddenCount = resolvedDepartmentsList.length - 10;

  return (
    <div id="access-section" className={cn("space-y-6", className)}>
      {!canAssignScope && (
        <div className="p-4 rounded-md border bg-muted/40 text-[13px] text-muted-foreground flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground shrink-0" />
          <span>Organizational visibility is managed by administrators with scope assignment authority.</span>
        </div>
      )}

      {/* What they can see Card */}
      <UserPanelCard title="What they can see">
        <div className="p-6">
          <RadioGroup
            value={stagedScope.levelCode}
            onValueChange={handleLevelChange}
            disabled={!canAssignScope}
            className="space-y-3"
          >
            {visibleLevels.map((level) => {
              const radioId = `scope-level-${level.code.toLowerCase()}`;
              return (
                <div key={level.code} className="flex items-start gap-3">
                  <RadioGroupItem
                    value={level.code}
                    id={radioId}
                    disabled={!canAssignScope}
                    className="mt-0.5"
                  />
                  <div className="flex flex-col space-y-1">
                    <Label
                      htmlFor={radioId}
                      className={cn(
                        "font-medium text-[13px] text-foreground leading-none",
                        canAssignScope && "cursor-pointer"
                      )}
                    >
                      {level.label}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {level.explanation}
                    </span>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {isTargetOrgUnitRequired && (
            <div className="mt-6 space-y-2 animate-in fade-in-50">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select {selectedLevelDef.label.toLowerCase().replace("one ", "")}
              </Label>
              <OrgUnitPicker
                value={stagedScope.orgUnitId || undefined}
                onChange={handleOrgUnitSelect}
                filterType={selectedLevelDef.unitTypeId}
                placeholder={`Choose ${selectedLevelDef.label.toLowerCase().replace("one ", "")}...`}
                disabled={!canAssignScope}
              />
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border/50 text-sm font-medium text-foreground">
            {liveCountSentence}
          </div>
        </div>
      </UserPanelCard>

      {/* Departments included Card */}
      <UserPanelCard title="Departments included">
        {resolvedDepartmentsList.length === 0 ? (
          <UserPanelRow>
            <span className="text-muted-foreground italic">None</span>
          </UserPanelRow>
        ) : (
          <>
            {departmentsToShow.map((dept, idx) => (
              <UserPanelRow key={dept.orgUnitId || idx}>
                <span className="text-foreground">{dept.name}</span>
              </UserPanelRow>
            ))}
            {hiddenCount > 0 && (
              <UserPanelRow className="!min-h-12 bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsDepartmentsExpanded(!isDepartmentsExpanded)}
                >
                  {isDepartmentsExpanded ? (
                    <><ChevronUp className="size-3.5 mr-1.5" /> Show fewer</>
                  ) : (
                    <><ChevronDown className="size-3.5 mr-1.5" /> Show all {resolvedDepartmentsList.length} departments</>
                  )}
                </Button>
              </UserPanelRow>
            )}
          </>
        )}
      </UserPanelCard>
    </div>
  );
}
