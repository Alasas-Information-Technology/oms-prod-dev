"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Building2, Search, Loader2 } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrgUnits, useOrgUnitTypes } from "@/hooks/useOrganization";
import { OrgUnitSummaryDto, OrgUnitTypeDto } from "@/lib/types/organization.types";

export interface OrgUnitPickerProps {
  value?: string | null;
  onChange?: (unit: OrgUnitSummaryDto | null) => void;
  placeholder?: string;
  disabled?: boolean;
  filterByType?: number | number[];
  filterType?: number | number[];
  parentOrgUnitId?: string | null;
  allowsBudgetOnly?: boolean;
  allowsRequisitionOnly?: boolean;
  excludeUnitId?: string;
  className?: string;
  clearable?: boolean;
}

export function OrgUnitPicker({
  value,
  onChange,
  placeholder = "Search and choose a department or team...",
  disabled = false,
  filterByType,
  filterType,
  parentOrgUnitId,
  allowsBudgetOnly = false,
  allowsRequisitionOnly = false,
  excludeUnitId,
  className,
  clearable = true,
}: OrgUnitPickerProps) {
  const effectiveFilterType = filterByType ?? filterType;
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: typesData } = useOrgUnitTypes();
  const typesMap = React.useMemo(() => {
    const map = new Map<number, OrgUnitTypeDto>();
    typesData?.forEach((t) => map.set(t.orgUnitTypeId, t));
    return map;
  }, [typesData]);

  // Query units with search filter
  const { data: unitsData, isLoading } = useOrgUnits({
    page: 1,
    pageSize: 100,
    search: searchTerm || undefined,
    isActive: true,
  });

  const filteredUnits = React.useMemo(() => {
    if (!unitsData?.data) return [];
    return unitsData.data.filter((unit) => {
      if (excludeUnitId && unit.orgUnitId === excludeUnitId) {
        return false;
      }
      const uTypeId = unit.orgUnitTypeId ?? unit.type?.orgUnitTypeId ?? unit.orgUnitType?.orgUnitTypeId;
      if (effectiveFilterType) {
        const allowedTypes = Array.isArray(effectiveFilterType) ? effectiveFilterType : [effectiveFilterType];
        if (!uTypeId || !allowedTypes.includes(uTypeId)) {
          return false;
        }
      }
      if (allowsBudgetOnly) {
        const type = uTypeId ? typesMap.get(uTypeId) : undefined;
        if (!type?.allowsBudget && !unit.allowsBudget) return false;
      }
      if (allowsRequisitionOnly) {
        const type = uTypeId ? typesMap.get(uTypeId) : undefined;
        if (!type?.allowsRequisition && !unit.allowsRequisition) return false;
      }
      if (parentOrgUnitId && unit.parentOrgUnitId !== parentOrgUnitId) {
        return false;
      }
      return true;
    });
  }, [unitsData, excludeUnitId, effectiveFilterType, parentOrgUnitId, allowsBudgetOnly, allowsRequisitionOnly, typesMap]);

  const selectedUnit = React.useMemo(() => {
    if (!value) return null;
    return unitsData?.data.find((u) => u.orgUnitId === value) || null;
  }, [value, unitsData]);

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal bg-background hover:bg-muted/50 border-input h-10 px-3"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              {selectedUnit ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                    {selectedUnit.code}
                  </span>
                  <span className="truncate text-sm font-medium">{selectedUnit.name}</span>
                  {selectedUnit.nameAr && (
                    <span className="text-xs text-muted-foreground truncate" dir="rtl">
                      ({selectedUnit.nameAr})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {clearable && selectedUnit && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onChange?.(null);
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0 shadow-lg border-border" align="start">
          <div className="p-2 border-b border-border bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search unit by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm bg-background"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[280px] overflow-y-auto p-1 divide-y divide-border/40">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading organization units...
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No matching organization units found.
              </div>
            ) : (
              filteredUnits.map((unit) => {
                const isSelected = unit.orgUnitId === value;
                const uTypeId = unit.orgUnitTypeId ?? unit.type?.orgUnitTypeId ?? unit.orgUnitType?.orgUnitTypeId;
                const typeInfo = unit.type || unit.orgUnitType || (uTypeId ? typesMap.get(uTypeId) : undefined);

                return (
                  <div
                    key={unit.orgUnitId}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onChange?.(unit);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onChange?.(unit);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-left",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                          {unit.code}
                        </span>
                        <span className="text-sm font-semibold truncate">{unit.name}</span>
                        {typeInfo && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            {typeInfo.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {unit.nameAr && (
                          <span dir="rtl" className="font-arabic">
                            {unit.nameAr}
                          </span>
                        )}
                        {unit.head && (
                          <span>Head: {unit.head.userDisplayName}</span>
                        )}
                        {unit.costCenterCode && (
                          <span>CC: {unit.costCenterCode}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
