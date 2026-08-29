"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Building2, Search, Loader2, FolderTree } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OrgTree } from "@/components/organization/OrgTree";
import { useOrgUnits } from "@/hooks/useOrganization";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";

export interface OrgTreePickerProps {
  value?: string | null;
  onChange?: (unit: OrgUnitSummaryDto | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function OrgTreePicker({
  value,
  onChange,
  placeholder = "Select organization unit...",
  disabled = false,
  className,
  clearable = true,
}: OrgTreePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Fetch the selected unit details if we only have the ID
  const { data: unitsData } = useOrgUnits({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const selectedUnit = React.useMemo(() => {
    if (!value) return null;
    return unitsData?.data.find((u) => u.orgUnitId === value) || null;
  }, [value, unitsData]);

  const handleSelect = (unit: any) => {
    if (onChange) {
      onChange(unit as OrgUnitSummaryDto);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-9 text-xs font-normal border-border/80 shadow-xs hover:bg-accent/50 hover:text-accent-foreground"
          >
            {selectedUnit ? (
              <span className="truncate pr-2 font-medium">
                {selectedUnit.name}
              </span>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            <div className="flex items-center shrink-0 ml-2">
              {clearable && selectedUnit && !disabled && (
                <div
                  role="button"
                  tabIndex={0}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground mr-1"
                  onClick={handleClear}
                >
                  <X className="size-3" />
                </div>
              )}
              <ChevronsUpDown className="size-3.5 opacity-50 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[350px] p-0 overflow-hidden rounded-xl border-border shadow-lg" 
          align="start"
        >
          <div className="flex items-center px-3 py-2 border-b border-border/50 bg-muted/20">
            <FolderTree className="size-3.5 mr-2 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Organizational Hierarchy
            </span>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
            <OrgTree 
              selectedId={value} 
              onSelectUnit={handleSelect} 
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
