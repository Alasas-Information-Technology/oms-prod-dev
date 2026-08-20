"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  FolderTree,
  MoreVertical,
  Plus,
  ArrowRightLeft,
  Trash2,
  Power,
  ExternalLink,
  Loader2,
  Layers,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import {
  useOrgUnits,
  useOrgUnitChildren,
  useOrgUnitTypes,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitEntity,
  OrgUnitSummaryDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";

interface TreeNodeProps {
  unit: OrgUnitSummaryDto | OrgUnitEntity;
  level: number;
  selectedId?: string | null;
  onSelect: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddChild?: (parent: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMove?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDelete?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleActive?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  typesMap: Map<number, { name: string; code: string }>;
}

function TreeNode({
  unit,
  level,
  selectedId,
  onSelect,
  onAddChild,
  onMove,
  onDelete,
  onToggleActive,
  typesMap,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = React.useState(level === 0);
  const { can } = usePermission();

  // Lazy load direct children only when opened
  const { data: childrenData, isLoading: isLoadingChildren } = useOrgUnitChildren(
    unit.orgUnitId,
    { enabled: isOpen }
  );

  const hasChildren =
    unit.childCount !== undefined
      ? unit.childCount > 0
      : childrenData && childrenData.length > 0;

  const isSelected = selectedId === unit.orgUnitId;
  const typeInfo = unit.type || (unit.orgUnitTypeId ? typesMap.get(unit.orgUnitTypeId) : undefined);

  const statusType: OMSStatus = unit.isActive ? "active" : "terminated";

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 border border-transparent",
          isSelected
            ? "bg-primary/10 border-primary/20 text-primary shadow-xs"
            : "hover:bg-muted/50 text-foreground",
          !unit.isActive && "opacity-60 bg-muted/20"
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(unit)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            className={cn(
              "p-0.5 rounded hover:bg-muted/80 text-muted-foreground transition-colors shrink-0",
              !hasChildren && "invisible"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Node Icon */}
          <div className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
            {level === 0 ? (
              <Building2 className="h-4 w-4 text-primary" />
            ) : (
              <FolderTree className="h-4 w-4" />
            )}
          </div>

          {/* Node Label */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground shrink-0">
              {unit.code}
            </span>
            <span className="text-sm font-medium truncate">{unit.name}</span>
            {unit.nameAr && (
              <span
                dir="rtl"
                className="text-xs text-muted-foreground truncate hidden md:inline"
              >
                ({unit.nameAr})
              </span>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {typeInfo && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 font-normal uppercase bg-background"
              >
                {typeInfo.name}
              </Badge>
            )}
            <StatusBadge status={statusType} size="sm" showDot={true} />
            {unit.childCount !== undefined && unit.childCount > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded-full font-mono">
                {unit.childCount}
              </span>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-md">
              <DropdownMenuItem asChild>
                <Link
                  href={`/app/administration/master-data/organization/${unit.orgUnitId}`}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>

              {can(ORG_PERMISSIONS.CREATE) && (
                <DropdownMenuItem
                  onClick={() => onAddChild?.(unit)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span>Add Child Unit</span>
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.MOVE) && level > 0 && (
                <DropdownMenuItem
                  onClick={() => onMove?.(unit)}
                  className="flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <span>Move Subtree...</span>
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.UPDATE) && (
                <DropdownMenuItem
                  onClick={() => onToggleActive?.(unit)}
                  className="flex items-center gap-2"
                >
                  <Power className="h-4 w-4 text-muted-foreground" />
                  <span>{unit.isActive ? "Deactivate" : "Activate"}</span>
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.DELETE) && level > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(unit)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Unit</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lazy Child Nodes Container */}
      {isOpen && (
        <div className="relative pl-2 border-l border-border/40 ml-4">
          {isLoadingChildren ? (
            <div
              className="flex items-center gap-2 py-2 text-xs text-muted-foreground"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading child units...</span>
            </div>
          ) : childrenData && childrenData.length > 0 ? (
            childrenData.map((child) => (
              <TreeNode
                key={child.orgUnitId}
                unit={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddChild={onAddChild}
                onMove={onMove}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                typesMap={typesMap}
              />
            ))
          ) : (
            <div
              className="py-1 text-xs text-muted-foreground italic"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              No child units.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface OrgTreeProps {
  selectedId?: string | null;
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddChild?: (parent: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMoveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDeleteUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleActiveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  className?: string;
}

export function OrgTree({
  selectedId,
  onSelectUnit,
  onAddChild,
  onMoveUnit,
  onDeleteUnit,
  onToggleActiveUnit,
  className,
}: OrgTreeProps) {
  // Load root organization unit(s)
  const { data: rootUnitsData, isLoading: isLoadingRoots } = useOrgUnits({
    depth: 0,
    page: 1,
    pageSize: 10,
    isActive: true,
  });

  const { data: typesData } = useOrgUnitTypes();
  const typesMap = React.useMemo(() => {
    const map = new Map<number, { name: string; code: string }>();
    typesData?.forEach((t) =>
      map.set(t.orgUnitTypeId, { name: t.name, code: t.code })
    );
    return map;
  }, [typesData]);

  const handleSelect = (unit: OrgUnitSummaryDto | OrgUnitEntity) => {
    onSelectUnit?.(unit);
  };

  return (
    <div className={cn("w-full space-y-1 select-none", className)}>
      {isLoadingRoots ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading organization hierarchy...</span>
        </div>
      ) : !rootUnitsData?.data || rootUnitsData.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2 border border-dashed rounded-lg">
          <Layers className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium">No root organization units found.</p>
        </div>
      ) : (
        rootUnitsData.data.map((rootUnit) => (
          <TreeNode
            key={rootUnit.orgUnitId}
            unit={rootUnit}
            level={0}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAddChild={onAddChild}
            onMove={onMoveUnit}
            onDelete={onDeleteUnit}
            onToggleActive={onToggleActiveUnit}
            typesMap={typesMap}
          />
        ))
      )}
    </div>
  );
}
