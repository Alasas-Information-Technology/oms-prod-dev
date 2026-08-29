"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Building2,
  ChevronRight,
  ArrowLeft,
  Check,
  Building,
  FolderTree,
  Layers,
  User,
  Crown,
  Loader2,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { OrgTypeIcon } from "@/components/organization/OrgTypeIcon";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import {
  useOrgUnits,
  useOrgUnitTypes,
  useOrgUnit,
  useAllowedParentTypes,
  useAssignManager,
} from "@/hooks/useOrganization";
import {
  OrgUnitSummaryDto,
  OrgUnitDetailDto,
  OrgUnitEntity,
  CreateOrgUnitDto,
  OrgUnitTypeDto,
} from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

export interface AddOrgUnitWizardProps {
  initialParent?: OrgUnitSummaryDto | OrgUnitEntity | null;
  targetTypeId?: number;
  onSubmit: (data: CreateOrgUnitDto, leaderUserId?: string | null) => Promise<OrgUnitDetailDto | OrgUnitSummaryDto | any>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Auto-suggests a clean uppercase code from the given name.
 */
function suggestCodeFromName(name: string): string {
  if (!name.trim()) return "";
  const cleaned = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 10);
  }
  if (words.length <= 3) {
    return words.map((w) => w[0]).join("") + (words[0].length > 2 ? `-${words[0].slice(0, 4)}` : "");
  }
  return words.map((w) => w[0]).join("").slice(0, 8);
}

const STEP_LABELS = [
  "Where it goes",
  "What kind",
  "Details",
  "Who's in charge",
];

const TYPE_EXPLANATIONS: Record<string, string> = {
  ORGANIZATION: "A top-level corporate or holding organization entity.",
  BUSINESS_UNIT: "An executive division that groups multiple functional departments.",
  DEPARTMENT: "A functional department that groups related teams and holds its own budget.",
  SECTION: "An operational team carrying out daily departmental tasks.",
};

export function AddOrgUnitWizard({
  initialParent,
  targetTypeId,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddOrgUnitWizardProps) {
  const [step, setStep] = React.useState<number>(1);

  // Wizard State
  const [selectedParent, setSelectedParent] = React.useState<OrgUnitSummaryDto | OrgUnitEntity | null>(
    initialParent || null
  );
  const [isTopLevel, setIsTopLevel] = React.useState<boolean>(!initialParent);
  const [selectedTypeId, setSelectedTypeId] = React.useState<number | null>(targetTypeId || null);

  // Details State
  const [name, setName] = React.useState("");
  const [nameAr, setNameAr] = React.useState("");
  const [code, setCode] = React.useState("");
  const [costCenterCode, setCostCenterCode] = React.useState("");
  const [codeManuallyEdited, setCodeManuallyEdited] = React.useState(false);

  // Leadership State
  const [leaderUserId, setLeaderUserId] = React.useState<string>("");
  const [leaderDisplayName, setLeaderDisplayName] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Queries
  const { data: allTypesData } = useOrgUnitTypes();
  const parentUnitId = selectedParent?.orgUnitId || "";
  const { data: parentDetail } = useOrgUnit(parentUnitId);

  // Live code availability check
  const [codeCheckStatus, setCodeCheckStatus] = React.useState<"idle" | "checking" | "available" | "taken">("idle");
  const { data: existingUnitsSearch } = useOrgUnits({
    search: code.trim() ? code.trim() : undefined,
    pageSize: 10,
    page: 1,
  });

  // Auto-suggest code when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!codeManuallyEdited) {
      setCode(suggestCodeFromName(val));
    }
  };

  // Debounced code availability verification
  React.useEffect(() => {
    if (!code.trim()) {
      setCodeCheckStatus("idle");
      return;
    }

    setCodeCheckStatus("checking");
    const timer = setTimeout(() => {
      const match = existingUnitsSearch?.data?.find(
        (u) => u.code.toLowerCase() === code.trim().toLowerCase()
      );
      if (match) {
        setCodeCheckStatus("taken");
      } else {
        setCodeCheckStatus("available");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, existingUnitsSearch]);

  // Derived available unit types based on selected parent (Part 4.1 Step 2)
  const availableTypes = React.useMemo(() => {
    if (!allTypesData || allTypesData.length === 0) return [];

    if (targetTypeId) {
      return allTypesData.filter((t) => t.orgUnitTypeId === targetTypeId);
    }

    if (isTopLevel || !selectedParent) {
      return allTypesData.filter((t) => t.canonicalLevel === 1 || t.orgUnitTypeId === 1);
    }

    const parentType = selectedParent.type?.code || selectedParent.orgUnitType?.code;
    const parentLevel = selectedParent.type?.canonicalLevel || selectedParent.orgUnitType?.canonicalLevel || (selectedParent as any).depth || 1;

    if (parentType === "ORGANIZATION" || parentLevel === 1) {
      return allTypesData.filter((t) => t.orgUnitTypeId === 2 || t.canonicalLevel === 2);
    }
    if (parentType === "BUSINESS_UNIT" || parentLevel === 2) {
      return allTypesData.filter((t) => t.orgUnitTypeId === 3 || t.canonicalLevel === 3);
    }
    if (parentType === "DEPARTMENT" || parentLevel === 3) {
      return allTypesData.filter((t) => t.orgUnitTypeId === 4 || t.canonicalLevel === 4);
    }

    return allTypesData.filter((t) => t.canonicalLevel > parentLevel);
  }, [allTypesData, targetTypeId, isTopLevel, selectedParent]);

  // Auto-select type if only one valid type exists
  React.useEffect(() => {
    if (availableTypes.length === 1) {
      setSelectedTypeId(availableTypes[0].orgUnitTypeId);
    } else if (availableTypes.length > 0 && selectedTypeId && !availableTypes.some((t) => t.orgUnitTypeId === selectedTypeId)) {
      setSelectedTypeId(availableTypes[0].orgUnitTypeId);
    }
  }, [availableTypes, selectedTypeId]);

  const selectedTypeObj = allTypesData?.find((t) => t.orgUnitTypeId === selectedTypeId);
  const typeName = selectedTypeObj?.name || "Department";

  // Step 1 Validation
  const canProceedStep1 = isTopLevel || selectedParent !== null;

  // Step 2 Validation
  const canProceedStep2 = selectedTypeId !== null;

  // Step 3 Validation
  const canProceedStep3 =
    name.trim().length > 0 &&
    code.trim().length > 0 &&
    codeCheckStatus !== "taken";

  // Final Submit Handler
  const handleFinalSubmit = async (withLeader = true) => {
    if (!canProceedStep3 || !selectedTypeId) return;

    try {
      setIsSubmitting(true);
      const createDto: CreateOrgUnitDto = {
        orgUnitTypeId: selectedTypeId,
        parentOrgUnitId: isTopLevel ? null : selectedParent?.orgUnitId || null,
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        code: code.trim().toUpperCase(),
        costCenterCode: costCenterCode.trim() || undefined,
        effectiveFrom: new Date().toISOString().split("T")[0],
      };

      const finalLeader = withLeader && leaderUserId.trim() ? leaderUserId.trim() : null;
      await onSubmit(createDto, finalLeader);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* Progress Stepper Bar Across Top                                           */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {step} of 4: {STEP_LABELS[step - 1]}
          </span>
          <span className="text-xs text-muted-foreground">
            Adding a new organization unit
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="space-y-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isDone ? "bg-primary" : isCurrent ? "bg-primary/80" : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] hidden sm:block truncate",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Step 1: Where Does It Go? (Part 4.1)                                      */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Where in the organization should this live?
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose the parent department or business unit that this team will report to.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={!isTopLevel ? "default" : "outline"}
                size="sm"
                onClick={() => setIsTopLevel(false)}
                className="text-xs h-8 rounded-lg"
              >
                Inside an existing department
              </Button>
              <Button
                type="button"
                variant={isTopLevel ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsTopLevel(true);
                  setSelectedParent(null);
                }}
                className="text-xs h-8 rounded-lg"
              >
                At top level (Root Holding)
              </Button>
            </div>

            {!isTopLevel && (
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-foreground">
                  Select Parent Department or Business Unit
                </Label>
                <OrgUnitPicker
                  value={selectedParent?.orgUnitId || null}
                  onChange={(unit) => setSelectedParent(unit)}
                  placeholder="Search and pick parent department..."
                  className="w-full"
                />
              </div>
            )}

            {/* Parent Card Preview */}
            {selectedParent && !isTopLevel && (
              <div className="p-4 rounded-md border border-border bg-card shadow-2xs space-y-2 mt-3 animate-in fade-in-50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Selected Parent Preview
                </span>
                <div className="flex items-center gap-3">
                  <OrgTypeIcon
                    type={selectedParent.type?.code || selectedParent.orgUnitType?.code || "BU"}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {selectedParent.name}
                      </span>
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                        {selectedParent.code}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {selectedParent.parentName ? `Part of ${selectedParent.parentName}` : "Root Holding Organization"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Step 2: What Kind? (Large Radio Cards per Part 4.1)                       */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              What kind of unit is this?
            </h3>
            <p className="text-xs text-muted-foreground">
              Only unit types allowed beneath{" "}
              <strong className="text-foreground">
                {selectedParent ? selectedParent.name : "the top level"}
              </strong>{" "}
              are shown.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {availableTypes.map((type) => {
              const isSelected = selectedTypeId === type.orgUnitTypeId;
              const typeCode = type.code.toUpperCase();
              const explanation =
                TYPE_EXPLANATIONS[typeCode] ||
                type.description ||
                "A structural unit inside the organization.";

              return (
                <div
                  key={type.orgUnitTypeId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTypeId(type.orgUnitTypeId)}
                  className={cn(
                    "p-4 rounded-md border text-left cursor-pointer transition-all duration-150 relative space-y-2 select-none group",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <OrgTypeIcon type={type.code} size="md" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {type.name}
                        </h4>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Level {type.canonicalLevel}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/80 group-hover:border-muted-foreground"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Step 3: Details (Name, Arabic Name, Code, Cost Centre)                    */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {typeName} Details
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide the naming and accounting details. The code is auto-suggested and validated.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* English Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Name (English) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Information Technology"
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            {/* Arabic Name (RTL Isolated) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Arabic Name (Optional)
              </Label>
              <Input
                dir="rtl"
                lang="ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: تقنية المعلومات"
                className="h-9 text-xs font-arabic text-right"
              />
            </div>

            {/* Short Code with Live Check */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Short Code <span className="text-destructive">*</span>
                </Label>
                {codeCheckStatus === "available" && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Code is available
                  </span>
                )}
                {codeCheckStatus === "taken" && (
                  <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Code is already taken
                  </span>
                )}
                {codeCheckStatus === "checking" && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking...
                  </span>
                )}
              </div>

              <Input
                value={code}
                onChange={(e) => {
                  setCodeManuallyEdited(true);
                  setCode(e.target.value.toUpperCase());
                }}
                placeholder="e.g. IT"
                className={cn(
                  "h-9 text-xs font-mono uppercase tracking-wider",
                  codeCheckStatus === "taken" ? "border-destructive focus-visible:ring-destructive" : ""
                )}
              />
              <p className="text-[11px] text-muted-foreground">
                Unique identifier used across reports and integrations.
              </p>
            </div>

            {/* Cost Centre */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Cost Centre Code (Optional)
              </Label>
              <Input
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value.toUpperCase())}
                placeholder="e.g. CC-1042"
                className="h-9 text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Step 4: Who's in Charge? (Optional & Skippable per Part 4.1)              */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Who&apos;s in charge of this {typeName.toLowerCase()}?
            </h3>
            <p className="text-xs text-muted-foreground">
              Assigning a leader now is optional. You can also assign or change leadership anytime later.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Leader User ID / Username (Optional)
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={leaderUserId}
                  onChange={(e) => setLeaderUserId(e.target.value)}
                  placeholder="Enter employee ID or user email..."
                  className="h-9 pl-8 text-xs"
                />
              </div>
            </div>

            {/* Skippable Reminder Note */}
            <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Skipping leadership assignment</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  If skipped, the card on the organization chart will show a subtle amber reminder dot until a leader is assigned.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Footer Navigation Buttons                                                 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <div>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting || isLoading}
              className="gap-1.5 text-xs h-8 rounded-lg"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step < 4 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
            >
              Continue
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <>
              {/* Skip & Finish */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting || isLoading}
                className="text-xs h-8 rounded-lg"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Skip & Add {typeName}
              </Button>

              {/* Assign & Finish */}
              <Button
                type="button"
                size="sm"
                onClick={() => handleFinalSubmit(true)}
                disabled={isSubmitting || isLoading}
                className="gap-1.5 text-xs h-8 font-semibold rounded-lg"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Add {typeName}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
