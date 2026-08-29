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
      <SelectTrigger className="h-9 min-w-0 bg-white">
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
    <Card className="gap-4 rounded-xl bg-white p-4 shadow-xs hover:translate-y-0">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(250px,1.5fr)_repeat(4,minmax(160px,1fr))]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={filters.search}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value
              )
            }
            placeholder="Search request ID or position"
            className="h-9 rounded-md bg-white pl-9"
          />
        </div>

        <FilterSelect
          value={filters.organization}
          placeholder="All organisations"
          values={options.organizations}
          onValueChange={(value) =>
            updateFilter("organization", value)
          }
        />

        <FilterSelect
          value={filters.department}
          placeholder="All departments"
          values={options.departments}
          onValueChange={(value) =>
            updateFilter("department", value)
          }
        />

        <FilterSelect
          value={filters.actualStatus}
          placeholder="All statuses"
          values={options.statuses}
          onValueChange={(value) =>
            updateFilter("actualStatus", value)
          }
        />

        <FilterSelect
          value={filters.currentOwner}
          placeholder="All owners"
          values={options.owners}
          onValueChange={(value) =>
            updateFilter("currentOwner", value)
          }
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-active-only`}
              checked={filters.activeOnly}
              onCheckedChange={(checked) =>
                updateFilter(
                  "activeOnly",
                  Boolean(checked)
                )
              }
            />

            <Label
              htmlFor={`${idPrefix}-active-only`}
              className="font-normal"
            >
              Active requests only
            </Label>
          </div>

          <Select
            value={filters.savedView}
            onValueChange={(value) =>
              updateFilter(
                "savedView",
                value as RequestSavedView
              )
            }
          >
            <SelectTrigger className="h-9 w-[190px] bg-white">
              <Bookmark className="size-4 text-muted-foreground" />

              <SelectValue placeholder="Saved views" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="default">
                Default view
              </SelectItem>

              <SelectItem value="my-active">
                My active requests
              </SelectItem>

              <SelectItem value="needs-action">
                Needs my action
              </SelectItem>

              <SelectItem value="sla-attention">
                SLA attention
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
              >
                <CalendarRange className="size-4" />
                Date range
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-80"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">
                    Engagement date range
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Filter by planned start and end
                    dates.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`${idPrefix}-start-date`}
                  >
                    Starts on or after
                  </Label>

                  <Input
                    id={`${idPrefix}-start-date`}
                    type="date"
                    value={filters.startDate}
                    onChange={(event) =>
                      updateFilter(
                        "startDate",
                        event.target.value
                      )
                    }
                    className="h-9 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`${idPrefix}-end-date`}
                  >
                    Ends on or before
                  </Label>

                  <Input
                    id={`${idPrefix}-end-date`}
                    type="date"
                    value={filters.endDate}
                    onChange={(event) =>
                      updateFilter(
                        "endDate",
                        event.target.value
                      )
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
                className="h-9 rounded-lg"
              >
                <Filter className="size-4" />
                More filters

                {activeFilterCount > 0 && (
                  <Badge className="ml-1 min-w-5 px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-72"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">
                    More filters
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Narrow the current request view.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${idPrefix}-sla-only`}
                    checked={filters.slaOnly}
                    onCheckedChange={(checked) =>
                      updateFilter(
                        "slaOnly",
                        Boolean(checked)
                      )
                    }
                  />

                  <Label
                    htmlFor={`${idPrefix}-sla-only`}
                    className="font-normal"
                  >
                    SLA attention only
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${idPrefix}-action-only`}
                    checked={filters.needsActionOnly}
                    onCheckedChange={(checked) =>
                      updateFilter(
                        "needsActionOnly",
                        Boolean(checked)
                      )
                    }
                  />

                  <Label
                    htmlFor={`${idPrefix}-action-only`}
                    className="font-normal"
                  >
                    Needs my action only
                  </Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg"
              onClick={onClear}
            >
              <X className="size-4" />
              Clear
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg"
            onClick={onExport}
            disabled={exportDisabled}
          >
            <Download className="size-4" />
            Export to Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}