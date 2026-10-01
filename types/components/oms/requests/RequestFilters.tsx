"use client";

import {
  Bookmark,
  CalendarRange,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  RequestFiltersState,
  RequestSavedView,
} from "./request.types";

interface RequestFilterOptions {
  organizations: string[];
  departments: string[];
  statuses: string[];
  owners: string[];
}

interface RequestFiltersProps {
  idPrefix: string;
  filters: RequestFiltersState;
  options: RequestFilterOptions;
  onFiltersChange: (filters: RequestFiltersState) => void;
  onClear: () => void;
  onExport: () => void;
  exportDisabled?: boolean;
}

function FilterSelect({
  value,
  placeholder,
  values,
  onValueChange,
}: {
  value: string;
  placeholder: string;
  values: string[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="h-8 min-w-[140px] bg-background border-border/50 text-xs shadow-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">
          {placeholder}
        </SelectItem>

        {values.map((item) => (
          <SelectItem
            key={item}
            value={item}
          >
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RequestFilters({
  idPrefix,
  filters,
  options,
  onFiltersChange,
  onClear,
  onExport,
  exportDisabled = false,
}: RequestFiltersProps) {
  const updateFilter = <
    K extends keyof RequestFiltersState,
  >(
    key: K,
    value: RequestFiltersState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const activeFilterCount = [
    filters.organization !== "all",
    filters.department !== "all",
    filters.actualStatus !== "all",
    filters.currentOwner !== "all",
    Boolean(filters.startDate),
    Boolean(filters.endDate),
    filters.activeOnly,
    filters.slaOnly,
    filters.needsActionOnly,
    filters.savedView !== "default",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 border border-foreground/15 rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) =>
            updateFilter("search", event.target.value)
          }
          placeholder="Search ID or position..."
          className="h-8 rounded-md bg-background border-border/50 pl-8 text-xs shadow-sm"
        />
      </div>

      {/* Tools & Secondary Filters */}
      <div className="flex flex-wrap items-center gap-1.5 ml-auto">
        <Select
          value={filters.savedView}
          onValueChange={(value) =>
            updateFilter("savedView", value as RequestSavedView)
          }
        >
          <SelectTrigger className="h-8 w-[140px] bg-background border-border/50 text-xs shadow-sm w-auto">
            <Bookmark className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
            <SelectValue placeholder="Saved views" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default view</SelectItem>
            <SelectItem value="my-active">My active requests</SelectItem>
            <SelectItem value="needs-action">Needs my action</SelectItem>
            <SelectItem value="sla-attention">SLA attention</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-2.5 text-xs bg-background border-border/50 shadow-sm"
            >
              <CalendarRange className="size-3.5 mr-1.5" />
              Date
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Engagement date range</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Filter by planned start and end dates.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-start-date`}>Starts on or after</Label>
                <Input
                  id={`${idPrefix}-start-date`}
                  type="date"
                  value={filters.startDate}
                  onChange={(event) =>
                    updateFilter("startDate", event.target.value)
                  }
                  className="h-9 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-end-date`}>Ends on or before</Label>
                <Input
                  id={`${idPrefix}-end-date`}
                  type="date"
                  value={filters.endDate}
                  onChange={(event) =>
                    updateFilter("endDate", event.target.value)
                  }
                  className="h-9 rounded-md"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-2.5 text-xs bg-background border-border/50 shadow-sm"
            >
              <Filter className="size-3.5 mr-1.5" />
              More
              {activeFilterCount > 0 && (
                <Badge className="ml-1.5 min-w-4 px-1 py-0 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold">More filters</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Narrow the current request view.
                </p>
              </div>

              {/* Primary Filters Moved Here */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Organisation</Label>
                  <FilterSelect
                    value={filters.organization}
                    placeholder="Organisations"
                    values={options.organizations}
                    onValueChange={(value) => updateFilter("organization", value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <FilterSelect
                    value={filters.department}
                    placeholder="Departments"
                    values={options.departments}
                    onValueChange={(value) => updateFilter("department", value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <FilterSelect
                    value={filters.actualStatus}
                    placeholder="Statuses"
                    values={options.statuses}
                    onValueChange={(value) => updateFilter("actualStatus", value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Owner</Label>
                  <FilterSelect
                    value={filters.currentOwner}
                    placeholder="Owners"
                    values={options.owners}
                    onValueChange={(value) => updateFilter("currentOwner", value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${idPrefix}-active-only`}
                    checked={filters.activeOnly}
                    onCheckedChange={(checked) =>
                      updateFilter("activeOnly", Boolean(checked))
                    }
                  />
                  <Label htmlFor={`${idPrefix}-active-only`} className="font-normal text-sm">
                    Active requests only
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${idPrefix}-sla-only`}
                    checked={filters.slaOnly}
                    onCheckedChange={(checked) =>
                      updateFilter("slaOnly", Boolean(checked))
                    }
                  />
                  <Label htmlFor={`${idPrefix}-sla-only`} className="font-normal text-sm">
                    SLA attention only
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${idPrefix}-action-only`}
                    checked={filters.needsActionOnly}
                    onCheckedChange={(checked) =>
                      updateFilter("needsActionOnly", Boolean(checked))
                    }
                  />
                  <Label htmlFor={`${idPrefix}-action-only`} className="font-normal text-sm">
                    Needs my action only
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-md px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className="size-3.5 mr-1" />
            Clear
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-md px-2.5 text-xs bg-background border-border/50 shadow-sm"
          onClick={onExport}
          disabled={exportDisabled}
        >
          <Download className="size-3.5 mr-1.5" />
          Export
        </Button>
      </div>
    </div>
  );
}