"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  Building2,
  Lock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import {
  SCOPE_LEVEL_DEFINITIONS,
  ScopeLevelDefinition,
} from "@/lib/constants/user-admin.constants";
import {
  UserDetailDto,
  IUserScopeAssignmentDto,
} from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { useScopeCoveragePreview } from "@/hooks/useAuthorization";
import { useOrgUnits } from "@/hooks/useOrganization";

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
  serverScopes,
  stagedScope,
  onChangeScope,
  className,
}: UserScopeSectionProps) {
  const { can } = usePermission();
  const { user: currentAdmin } = useAuth();
  const canAssignScope = can("USER.SCOPE.ASSIGN");

  // Vendor users NEVER see this section at all (Rule V4)
  if (user.userType === "VENDOR") {
    return null;
  }

  // Calculate current admin's broadest scope level rank for Rule S4 filtering
  // 1: GLOBAL/ORG, 2: BU, 3: DEPT, 4: SECTION, 5: SELF
  const currentAdminBroadestRank = React.useMemo(() => {
    if (!currentAdmin) return 1; // Default fallback to unrestricted
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

  // Live count preview from backend helper (§Part 3.6)
  const isTargetOrgUnitRequired =
    selectedLevelDef.code === "BUSINESS_UNIT" ||
    selectedLevelDef.code === "DEPARTMENT" ||
    selectedLevelDef.code === "SECTION";

  const shouldFetchPreview =
    Boolean(selectedLevelDef.scopeDefinitionId) &&
    selectedLevelDef.code !== "SELF_ONLY" &&
    (!isTargetOrgUnitRequired || Boolean(stagedScope.orgUnitId));

  const { data: coveragePreview, isLoading: isCoverageLoading } =
    useScopeCoveragePreview(
      shouldFetchPreview ? selectedLevelDef.scopeDefinitionId : undefined,
      shouldFetchPreview ? (stagedScope.orgUnitId || undefined) : undefined,
      {
        enabled: shouldFetchPreview,
      }
    );

  // Total departments fallback query if needed
  const { data: allUnitsData } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const totalDeptsCount = React.useMemo(() => {
    const items = allUnitsData?.data || [];
    if (!items.length) return 47;
    // Count units of type 3 (Department)
    const deptCount = items.filter((u) => u.orgUnitTypeId === 3).length;
    return deptCount > 0 ? deptCount : (allUnitsData?.total ?? items.length);
  }, [allUnitsData]);

  // Compute live count text
  const liveCountSentence = React.useMemo(() => {
    if (selectedLevelDef.code === "GLOBAL") {
      const count = coveragePreview?.accessibleOrgUnitsCount ?? totalDeptsCount;
      return `This gives access to ${count} departments.`;
    }

    if (selectedLevelDef.code === "SELF_ONLY") {
      return "This gives access to 0 departments (only their own requests).";
    }

    if (isTargetOrgUnitRequired) {
      if (!stagedScope.orgUnitId) {
        const typeLabel =
          selectedLevelDef.code === "BUSINESS_UNIT"
            ? "business unit"
            : selectedLevelDef.code === "DEPARTMENT"
            ? "department"
            : "section";
        return `Select a ${typeLabel} to see accessible departments.`;
      }

      if (isCoverageLoading) {
        return "Calculating accessible departments...";
      }

      const count = coveragePreview?.accessibleOrgUnitsCount ?? 1;
      return `This gives access to ${count} ${count === 1 ? "department" : "departments"}.`;
    }

    return "This gives access to 0 departments.";
  }, [
    selectedLevelDef.code,
    isTargetOrgUnitRequired,
    stagedScope.orgUnitId,
    coveragePreview,
    totalDeptsCount,
    isCoverageLoading,
  ]);

  // Is editing own scope?
  const isEditingOwnAccount =
    Boolean(currentAdmin?.userId) && currentAdmin?.userId === user.userId;

  const handleLevelChange = (levelCode: string) => {
    const nextDef = SCOPE_LEVEL_DEFINITIONS.find((l) => l.code === levelCode);
    if (!nextDef) return;

    // If changing to GLOBAL or SELF_ONLY, clear org unit
    if (nextDef.code === "GLOBAL" || nextDef.code === "SELF_ONLY") {
      onChangeScope({
        levelCode: nextDef.code,
        scopeDefinitionId: nextDef.scopeDefinitionId,
        orgUnitId: null,
        orgUnitName: null,
      });
    } else {
      onChangeScope({
        levelCode: nextDef.code,
        scopeDefinitionId: nextDef.scopeDefinitionId,
        orgUnitId: stagedScope.orgUnitId || null,
        orgUnitName: stagedScope.orgUnitName || null,
      });
    }
  };

  const handleUnitChange = (unit: OrgUnitSummaryDto | null) => {
    onChangeScope({
      ...stagedScope,
      orgUnitId: unit?.orgUnitId || null,
      orgUnitName: unit?.name || null,
    });
  };

  return (
    <div id="scope-section" className={cn("space-y-4 pt-2", className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
          <Eye className="size-4 text-primary" />
          What they can see
        </h3>
        <span className="text-xs text-muted-foreground">
          {selectedLevelDef.label}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Choose how much of the organization this person can view and manage.
      </p>

      {/* Warning if editing own access */}
      {isEditingOwnAccount && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            You are editing your own access. You cannot remove your own administrator visibility.
          </span>
        </div>
      )}

      {/* Read-only notification if user lacks USER.SCOPE.ASSIGN */}
      {!canAssignScope && (
        <div className="p-3 rounded-xl border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="size-3.5 text-muted-foreground shrink-0" />
          <span>Organizational access is managed by administrators with access assignment authority.</span>
        </div>
      )}

      {/* Level Selection as Radio List (§Part 3.6) */}
      <RadioGroup
        value={stagedScope.levelCode}
        onValueChange={handleLevelChange}
        disabled={!canAssignScope}
        className="space-y-2"
      >
        {visibleLevels.map((level) => {
          const isSelected = stagedScope.levelCode === level.code;
          return (
            <label
              key={level.code}
              htmlFor={`level-${level.code}`}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                isSelected
                  ? "border-primary bg-primary/5 shadow-2xs"
                  : "border-border/80 bg-card hover:bg-muted/40",
                !canAssignScope && "cursor-default opacity-90"
              )}
            >
              <RadioGroupItem
                value={level.code}
                id={`level-${level.code}`}
                className="mt-0.5 shrink-0"
              />
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-semibold text-xs text-foreground block">
                  {level.label}
                </span>
                <span className="text-xs text-muted-foreground block leading-relaxed">
                  {level.explanation}
                </span>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      {/* "Which one" OrgUnitPicker (Hidden for Everything & Only themselves §Part 3.6) */}
      {isTargetOrgUnitRequired && (
        <div className="space-y-2 pt-2 animate-in fade-in-50">
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>
              Which {selectedLevelDef.code === "BUSINESS_UNIT"
                ? "business unit"
                : selectedLevelDef.code === "DEPARTMENT"
                ? "department"
                : "section"}?
            </span>
            {stagedScope.orgUnitName && (
              <span className="text-[11px] font-normal text-muted-foreground truncate max-w-[200px]">
                {stagedScope.orgUnitName}
              </span>
            )}
          </Label>

          <OrgUnitPicker
            value={stagedScope.orgUnitId || undefined}
            onChange={handleUnitChange}
            disabled={!canAssignScope}
            filterByType={selectedLevelDef.unitTypeId}
            placeholder={`Search and choose a ${selectedLevelDef.label.toLowerCase()}...`}
          />
        </div>
      )}

      {/* ALWAYS show the resulting count beneath (§Part 3.6) */}
      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2.5 text-xs text-foreground font-medium animate-in fade-in-50">
        <Building2 className="size-4 text-primary shrink-0" />
        <span className="leading-snug">{liveCountSentence}</span>
      </div>
    </div>
  );
}
