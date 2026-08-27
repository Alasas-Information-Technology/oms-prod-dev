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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import { useAssignScope, useScopeCoveragePreview } from "@/hooks/useAuthorization";
import { SCOPE_LEVEL_DEFINITIONS, ScopeLevelDefinition } from "@/lib/constants/user-admin.constants";
import { toast } from "sonner";
import { Building2, Globe, Eye, Info, Sparkles, CheckCircle2 } from "lucide-react";

interface AssignScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

export function AssignScopeDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: AssignScopeDialogProps) {
  const [selectedLevelCode, setSelectedLevelCode] = React.useState<string>("DEPARTMENT");
  const [selectedUnit, setSelectedUnit] = React.useState<OrgUnitSummaryDto | null>(null);

  const assignableLevels = React.useMemo(() => {
    return SCOPE_LEVEL_DEFINITIONS.filter((l) => l.code !== "SELF_ONLY");
  }, []);

  const selectedLevel = React.useMemo(() => {
    return assignableLevels.find((l) => l.code === selectedLevelCode) || assignableLevels[0];
  }, [assignableLevels, selectedLevelCode]);

  const isGlobal = selectedLevel.code === "GLOBAL";
  const shouldFetchPreview =
    Boolean(selectedLevel.scopeDefinitionId) &&
    (isGlobal || Boolean(selectedUnit));

  // Immediate coverage preview hook
  const { data: previewData, isLoading: isPreviewLoading } = useScopeCoveragePreview(
    shouldFetchPreview ? selectedLevel.scopeDefinitionId : undefined,
    isGlobal ? undefined : selectedUnit?.orgUnitId,
    { enabled: shouldFetchPreview }
  );

  const assignMutation = useAssignScope();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGlobal && !selectedUnit) {
      toast.error("Please select an organizational unit.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        userId,
        dto: {
          scopeDefinitionId: selectedLevel.scopeDefinitionId,
          orgUnitId: isGlobal ? undefined : selectedUnit?.orgUnitId,
          departmentId: selectedLevel.code === "DEPARTMENT" ? selectedUnit?.orgUnitId : undefined,
          businessUnitId: selectedLevel.code === "BUSINESS_UNIT" ? selectedUnit?.orgUnitId : undefined,
          organizationId: selectedLevel.code === "ORGANIZATION" ? selectedUnit?.orgUnitId : undefined,
          sectionId: selectedLevel.code === "SECTION" ? selectedUnit?.orgUnitId : undefined,
        },
      });

      toast.success("Organizational scope assigned successfully.");
      onOpenChange(false);
      setSelectedUnit(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to assign scope");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Assign Organizational Scope
          </DialogTitle>
          <DialogDescription>
            Grant <strong>{userName || "this user"}</strong> data visibility over specific organizational branches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Scope Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="scope-level">Scope Level *</Label>
            <Select
              value={selectedLevelCode}
              onValueChange={(val) => {
                setSelectedLevelCode(val);
                setSelectedUnit(null);
              }}
            >
              <SelectTrigger id="scope-level">
                <SelectValue placeholder="Choose scope level..." />
              </SelectTrigger>
              <SelectContent>
                {assignableLevels.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-semibold text-sm">{l.label}</span>
                      <span className="text-xs text-muted-foreground">{l.explanation}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* OrgUnitPicker (Hidden if Global) */}
          {!isGlobal && (
            <div className="space-y-2">
              <Label>Target Organizational Unit *</Label>
              <OrgUnitPicker
                value={selectedUnit?.orgUnitId || null}
                onChange={setSelectedUnit}
                filterByType={selectedLevel.unitTypeId}
                placeholder={`Select ${selectedLevel.label.toLowerCase()}...`}
              />
            </div>
          )}

          {/* Immediate Feedback Card */}
          <div className="p-3.5 rounded-xl border bg-primary/5 border-primary/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Eye className="size-4" />
              <span>Immediate Coverage Evaluation</span>
            </div>
            <p className="text-xs text-foreground font-medium">
              {isGlobal ? (
                "This gives access to all enterprise departments and business units."
              ) : selectedUnit ? (
                isPreviewLoading ? (
                  "Calculating accessible units..."
                ) : (
                  `This gives access to ${
                    previewData?.accessibleOrgUnitsCount ?? 1
                  } organizational unit(s) including descendants.`
                )
              ) : (
                "Select a unit above to preview the total accessible organizational scope."
              )}
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                assignMutation.isPending || (!isGlobal && !selectedUnit)
              }
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Scope"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
