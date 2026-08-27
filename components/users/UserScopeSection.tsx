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
    const rawData = allUnitsData as any;
    const items: OrgUnitSummaryDto[] = Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData)
      ? rawData
      : [];
    if (!items.length) return 47;
    // Count units of type 3 (Department)
    const deptCount = items.filter((u) => u.orgUnitTypeId === 3).length;
    return deptCount > 0 ? deptCount : (rawData?.meta?.total ?? rawData?.total ?? items.length);
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
      return `This gives access to ${count} department${count === 1 ? "" : "s"}.`;
    }

    return "This gives access to 0 departments.";
  }, [
    selectedLevelDef.code,
    coveragePreview,
    totalDeptsCount,
    isTargetOrgUnitRequired,
    stagedScope.orgUnitId,
    isCoverageLoading,
  ]);

  const handleLevelChange = (newLevelCode: string) => {
    const targetDef = SCOPE_LEVEL_DEFINITIONS.find((l) => l.code === newLevelCode);
    if (!targetDef) return;

    onChangeScope({
      levelCode: targetDef.code,
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

  // Vendor users NEVER see this section at all (Rule V4)
  if (user.userType === "VENDOR") {
    return null;
  }

  return (
    <div id="access-section" className={cn("space-y-4 pt-2", className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          What they can see
        </h3>
      </div>

      {/* Read-only notification if user lacks USER.SCOPE.ASSIGN */}
      {!canAssignScope && (
        <div className="p-3 rounded-xl border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="size-3.5 text-muted-foreground shrink-0" />
          <span>Organizational visibility is managed by administrators with scope assignment authority.</span>
        </div>
      )}

      {/* Level Selection Radio Group (§Part 3.6) */}
      <RadioGroup
        value={stagedScope.levelCode}
        onValueChange={handleLevelChange}
        disabled={!canAssignScope}
        className="space-y-2.5"
      >
        {visibleLevels.map((level) => {
          const isSelected = stagedScope.levelCode === level.code;
          const radioId = `scope-level-${level.code.toLowerCase()}`;

          return (
            <div
              key={level.code}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                isSelected
                  ? "border-border/80 bg-card shadow-2xs"
                  : "border-border/40 bg-muted/20 hover:bg-muted/40",
                !canAssignScope && "cursor-default opacity-80"
              )}
            >
              <RadioGroupItem
                value={level.code}
                id={radioId}
                disabled={!canAssignScope}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <Label
                  htmlFor={radioId}
                  className={cn(
                    "font-medium text-xs text-foreground select-none leading-none",
                    canAssignScope && "cursor-pointer"
                  )}
                >
                  {level.label}
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {level.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {/* Which one — OrgUnitPicker (§Part 3.6) */}
      {isTargetOrgUnitRequired && (
        <div className="space-y-1.5 pt-2 animate-in fade-in-50">
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>
              Select {selectedLevelDef.label.toLowerCase().replace("one ", "")}
            </span>
            {stagedScope.orgUnitName && (
              <span className="text-[11px] font-normal text-muted-foreground">
                Current: <strong className="text-foreground">{stagedScope.orgUnitName}</strong>
              </span>
            )}
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

      {/* Live Department Access Count Banner (§Part 3.6) */}
      <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2.5 text-xs text-foreground">
        <Sparkles className="size-4 text-primary shrink-0" />
        <span className="font-semibold">{liveCountSentence}</span>
      </div>
    </div>
  );
}
