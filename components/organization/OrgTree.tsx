"use client";

import * as React from "react";
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
  Search,
  X,
  Lock,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, OMSStatus } from "@/components/oms/StatusBadge";
import { OrgTypeIcon, UnitPath } from "@/components/oms/org";
import {
  useOrgUnits,
  useOrgUnitChildren,
  useOrgUnitTypes,
  useOrgUnitAncestors,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitEntity,
  OrgUnitSummaryDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";

const SESSION_STORAGE_EXPANDED_KEY = "diez_oms_org_tree_expanded_ids_v1";

export interface OrgTreeProps {
  selectedId?: string | null;
  onSelect?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddChild?: (parent: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMove?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMoveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDelete?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDeleteUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleActive?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleActiveUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  forceExpandAll?: boolean;
  className?: string;
}

interface FlatVisibleNode {
  unit: OrgUnitSummaryDto | OrgUnitEntity;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
  ancestorIsLast: boolean[];
  parentOrgUnitId?: string | null;
  siblingCount: number;
  indexInSiblings: number;
}

/**
 * Sub-component to fetch and render children of an expanded node into the tree state.
 */
function NodeChildrenFetcher({
  unitId,
  onLoaded,
}: {
  unitId: string;
  onLoaded: (children: OrgUnitSummaryDto[]) => void;
}) {
  const { data: childrenData } = useOrgUnitChildren(unitId, { enabled: true });

  React.useEffect(() => {
    if (childrenData) {
      onLoaded(childrenData);
    }
  }, [childrenData, onLoaded]);

  return null;
}

/**
 * OrgTree — Production Organization Tree Component.
 *
 * Implements:
 * - Part 2.1: Scoped-fragment support ("Your departments" header with scope explanation).
 * - Part 2.4: Lazy-loading via /units/:id/children, expansion persistence, deep-linking (?node=<id>),
 *   and list virtualisation when expanded rows exceed 200.
 * - Part 2.5: Bilingual Arabic handling (dir="rtl" lang="ar" strictly on text nodes).
 * - Part 2.7: Indented skeleton rows during initial and child loading (no bare spinners).
 * - Part 3.1 & WAI-ARIA: Complete keyboard navigation (Arrows, Enter, Home/End, role="tree", role="treeitem").
 */
export function OrgTree({
  selectedId,
  onSelect,
  onSelectUnit,
  onAddChild,
  onMove,
  onMoveUnit,
  onDelete,
  onDeleteUnit,
  onToggleActive,
  onToggleActiveUnit,
  forceExpandAll,
  className,
}: OrgTreeProps) {
  const effectiveSelect = onSelect || onSelectUnit || (() => {});
  const effectiveMove = onMove || onMoveUnit;
  const effectiveDelete = onDelete || onDeleteUnit;
  const effectiveToggleActive = onToggleActive || onToggleActiveUnit;

  const { can } = usePermission();

  // Reference for virtualizer scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Search filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Deep-link node ID resolved from window.location.search on mount (Part 2.4)
  const [deepLinkNodeId, setDeepLinkNodeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const node = params.get("node");
        if (node) {
          setDeepLinkNodeId(node);
        }
      } catch {
        // Ignore URL parsing errors
      }
    }
  }, []);

  // Expansion set initialized from sessionStorage (Part 2.4 Persistence)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_KEY);
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch {
        // Fallback to default
      }
    }
    return new Set<string>();
  });

  // Cached children map: parentId -> OrgUnitSummaryDto[]
  const [childrenCache, setChildrenCache] = React.useState<Map<string, OrgUnitSummaryDto[]>>(
    new Map()
  );

  // Keyboard navigation focused node ID
  const [focusedId, setFocusedId] = React.useState<string | null>(selectedId || null);

  // Fetch unit types map
  const { data: typesList } = useOrgUnitTypes();
  const typesMap = React.useMemo(() => {
    const map = new Map<number, { name: string; code: string }>();
    if (typesList) {
      typesList.forEach((t) => map.set(t.orgUnitTypeId, { name: t.name, code: t.code }));
    }
    return map;
  }, [typesList]);

  // Visible Units Query (page size <= 100)
  const {
    data: unitsData,
    isLoading: isLoadingRoots,
    isError: isErrorRoots,
    refetch: refetchRoots,
  } = useOrgUnits({ page: 1, pageSize: 100, isActive: true });

  // Server-side Search Query (Part 2.4)
  const { data: searchResultsData, isLoading: isSearching } = useOrgUnits(
    { search: debouncedSearch, page: 1, pageSize: 25 },
    { enabled: debouncedSearch.trim().length > 0 }
  );

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync expanded IDs to sessionStorage on change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          SESSION_STORAGE_EXPANDED_KEY,
          JSON.stringify(Array.from(expandedIds))
        );
      } catch {
        // Ignore session storage quota errors
      }
    }
  }, [expandedIds]);

  // Identify root units (depth 0 or no parent) vs scoped fragment units
  const rootUnits = React.useMemo(() => {
    const list = unitsData?.data || [];
    return list.filter((u) => u.depth === 0 || !u.parentOrgUnitId);
  }, [unitsData]);

  // Detect whether this is a scoped fragment (no root depth 0 nodes visible)
  const isScopedFragment =
    !isLoadingRoots &&
    rootUnits.length === 0 &&
    Boolean(unitsData?.data && unitsData.data.length > 0);

  const effectiveRoots: (OrgUnitSummaryDto | OrgUnitEntity)[] = React.useMemo(() => {
    if (rootUnits.length > 0) {
      return rootUnits;
    }
    if (isScopedFragment && unitsData?.data) {
      const allVisibleIds = new Set(unitsData.data.map((u) => u.orgUnitId));
      const topLevelScoped = unitsData.data.filter(
        (u) => !u.parentOrgUnitId || !allVisibleIds.has(u.parentOrgUnitId)
      );
      return topLevelScoped.length > 0 ? topLevelScoped : unitsData.data;
    }
    return [];
  }, [rootUnits, isScopedFragment, unitsData]);

  // Handle forceExpandAll prop changes
  React.useEffect(() => {
    if (forceExpandAll !== undefined) {
      if (forceExpandAll) {
        // Expand all cached nodes
        const allIds = new Set<string>();
        effectiveRoots.forEach((r) => allIds.add(r.orgUnitId));
        childrenCache.forEach((children, pId) => {
          allIds.add(pId);
          children.forEach((c) => allIds.add(c.orgUnitId));
        });
        setExpandedIds(allIds);
      } else {
        // Collapse all except root
        const rootOnly = new Set<string>();
        effectiveRoots.forEach((r) => rootOnly.add(r.orgUnitId));
        setExpandedIds(rootOnly);
      }
    }
  }, [forceExpandAll, effectiveRoots, childrenCache]);

  // Deep link node resolution (?node=<id>) (Part 2.4)
  const { data: ancestorPathData } = useOrgUnitAncestors(deepLinkNodeId || undefined, {
    enabled: Boolean(deepLinkNodeId),
  });

  React.useEffect(() => {
    if (deepLinkNodeId && ancestorPathData && ancestorPathData.length > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorPathData.forEach((a) => next.add(a.orgUnitId));
        return next;
      });
      setFocusedId(deepLinkNodeId);
    }
  }, [deepLinkNodeId, ancestorPathData]);

  // Auto-expand root on initial load if expandedIds is empty
  React.useEffect(() => {
    if (effectiveRoots.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set(effectiveRoots.map((r) => r.orgUnitId)));
    }
  }, [effectiveRoots, expandedIds.size]);

  // Helper to toggle expansion
  const toggleExpand = React.useCallback((unitId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  }, []);

  // Update children cache when loaded
  const handleChildrenLoaded = React.useCallback((parentId: string, children: OrgUnitSummaryDto[]) => {
    setChildrenCache((prev) => {
      const next = new Map(prev);
      next.set(parentId, children);
      return next;
    });
  }, []);

  // Flatten visible tree nodes for virtualisation & keyboard navigation
  const flatVisibleNodes: FlatVisibleNode[] = React.useMemo(() => {
    const list: FlatVisibleNode[] = [];

    function traverse(
      nodes: (OrgUnitSummaryDto | OrgUnitEntity)[],
      depth: number,
      ancestorIsLast: boolean[]
    ) {
      nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        const isExpanded = expandedIds.has(node.orgUnitId);
        const children = childrenCache.get(node.orgUnitId);
        const hasChildren =
          node.childCount !== undefined
            ? node.childCount > 0
            : children && children.length > 0;

        list.push({
          unit: node,
          depth,
          isLast,
          hasChildren: Boolean(hasChildren),
          ancestorIsLast,
          parentOrgUnitId: node.parentOrgUnitId,
          siblingCount: nodes.length,
          indexInSiblings: index,
        });

        if (isExpanded && children && children.length > 0) {
          traverse(children, depth + 1, [...ancestorIsLast, isLast]);
        }
      });
    }

    traverse(effectiveRoots, 0, []);
    return list;
  }, [effectiveRoots, expandedIds, childrenCache]);

  // Virtualizer for high-performance rendering (>200 items) (Part 2.4)
  const isVirtualised = flatVisibleNodes.length > 200;
  const rowVirtualizer = useVirtualizer({
    count: flatVisibleNodes.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 36, // ~36px compact row height per §1.4
    overscan: 12,
  });

  // WAI-ARIA Treeview Keyboard Navigation Handler (Part 3.1)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatVisibleNodes.length === 0) return;

    const currentIndex = flatVisibleNodes.findIndex((n) => n.unit.orgUnitId === focusedId);
    const validIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentNode = flatVisibleNodes[validIndex];

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex = Math.min(flatVisibleNodes.length - 1, validIndex + 1);
        const nextNode = flatVisibleNodes[nextIndex];
        setFocusedId(nextNode.unit.orgUnitId);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex = Math.max(0, validIndex - 1);
        const prevNode = flatVisibleNodes[prevIndex];
        setFocusedId(prevNode.unit.orgUnitId);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (currentNode.hasChildren) {
          if (!expandedIds.has(currentNode.unit.orgUnitId)) {
            // Expand closed node
            setExpandedIds((prev) => new Set(prev).add(currentNode.unit.orgUnitId));
          } else {
            // Move to first child if already open
            const nextIndex = validIndex + 1;
            if (nextIndex < flatVisibleNodes.length) {
              setFocusedId(flatVisibleNodes[nextIndex].unit.orgUnitId);
            }
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (expandedIds.has(currentNode.unit.orgUnitId)) {
          // Collapse open node
          setExpandedIds((prev) => {
            const next = new Set(prev);
            next.delete(currentNode.unit.orgUnitId);
            return next;
          });
        } else if (currentNode.parentOrgUnitId) {
          // Move focus to parent node
          setFocusedId(currentNode.parentOrgUnitId);
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (currentNode) {
          effectiveSelect(currentNode.unit);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        if (flatVisibleNodes.length > 0) {
          setFocusedId(flatVisibleNodes[0].unit.orgUnitId);
        }
        break;
      }
      case "End": {
        e.preventDefault();
        if (flatVisibleNodes.length > 0) {
          setFocusedId(flatVisibleNodes[flatVisibleNodes.length - 1].unit.orgUnitId);
        }
        break;
      }
    }
  };

  // Node Fetchers: render hidden fetchers for all expanded nodes whose children are not in cache
  const pendingChildFetchIds = React.useMemo(() => {
    const list: string[] = [];
    expandedIds.forEach((id) => {
      if (!childrenCache.has(id)) {
        list.push(id);
      }
    });
    return list;
  }, [expandedIds, childrenCache]);

  return (
    <div
      className={cn("flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden Child Data Fetchers */}
      {pendingChildFetchIds.map((id) => (
        <NodeChildrenFetcher
          key={id}
          unitId={id}
          onLoaded={(children) => handleChildrenLoaded(id, children)}
        />
      ))}

      {/* Tree Toolbar: Search & View Controls */}
      <div className="p-2.5 border-b border-border bg-muted/20 space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tree by name or code..."
            className="h-8 pl-8 pr-8 text-xs bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Search Results Drawer */}
        {debouncedSearch && (
          <div className="p-2 rounded-lg bg-background border border-border shadow-xs space-y-1.5 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pb-1 border-b border-border/40 font-medium">
              <span>Search Results ({searchResultsData?.total || 0})</span>
              {isSearching && <span className="text-primary animate-pulse">Searching...</span>}
            </div>

            {searchResultsData?.data && searchResultsData.data.length > 0 ? (
              searchResultsData.data.map((result) => (
                <div
                  key={result.orgUnitId}
                  onClick={() => {
                    effectiveSelect(result);
                    setFocusedId(result.orgUnitId);
                    setSearchQuery("");
                  }}
                  className="flex flex-col p-1.5 rounded hover:bg-muted cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{result.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded">
                      {result.code}
                    </span>
                  </div>
                  {/* Ancestor Path Disambiguation (Part 2.4) */}
                  {result.parentName ? (
                    <UnitPath
                      path={[result.parentName]}
                      currentName={result.name}
                      showCurrent={false}
                      className="text-[10px] text-muted-foreground/80 mt-0.5"
                    />
                  ) : null}
                </div>
              ))
            ) : !isSearching ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No matching units found.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Scoped Fragment Header (Part 2.1) */}
      {isScopedFragment && (
        <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 shrink-0">
          <Lock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Your departments</span>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Your view is limited to your assigned organizational scope.
            </p>
          </div>
        </div>
      )}

      {/* Main Tree Scroll Container */}
      <div
        ref={scrollContainerRef}
        role="tree"
        aria-label="Organization Hierarchy Tree"
        tabIndex={0}
        className="flex-1 overflow-y-auto p-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary select-none"
      >
        {/* Loading State: Indented Skeletons (Part 2.7) */}
        {isLoadingRoots && flatVisibleNodes.length === 0 ? (
          <div className="space-y-2 p-2" aria-label="Loading hierarchy...">
            {[0, 1, 1, 2, 2, 3].map((depth, idx) => (
              <div
                key={idx}
                className="flex items-center h-8 gap-2"
                style={{ paddingLeft: `${depth * 20}px` }}
              >
                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 flex-1 max-w-[140px] rounded" />
              </div>
            ))}
          </div>
        ) : isErrorRoots ? (
          /* Error State with Retry (Part 2.7) */
          <div className="p-6 text-center space-y-3">
            <p className="text-xs text-destructive font-medium">
              Failed to load organization hierarchy.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchRoots()}
              className="gap-1.5 text-xs h-7"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        ) : flatVisibleNodes.length === 0 ? (
          /* Empty State (Part 2.7) */
          <div className="p-6 text-center space-y-2">
            <p className="text-xs font-medium text-foreground">No organization units available.</p>
            <p className="text-[11px] text-muted-foreground">
              {isScopedFragment
                ? "No units found within your assigned scope."
                : "Create a root organization to initialize the tree."}
            </p>
          </div>
        ) : isVirtualised ? (
          /* Virtualised List Render (>200 items) (Part 2.4) */
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const node = flatVisibleNodes[virtualRow.index];
              return (
                <div
                  key={node.unit.orgUnitId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TreeRow
                    node={node}
                    isExpanded={expandedIds.has(node.unit.orgUnitId)}
                    isSelected={selectedId === node.unit.orgUnitId}
                    isFocused={focusedId === node.unit.orgUnitId}
                    typesMap={typesMap}
                    onToggle={(e) => toggleExpand(node.unit.orgUnitId, e)}
                    onSelect={() => {
                      setFocusedId(node.unit.orgUnitId);
                      effectiveSelect(node.unit);
                    }}
                    onAddChild={onAddChild}
                    onMove={effectiveMove}
                    onDelete={effectiveDelete}
                    onToggleActive={effectiveToggleActive}
                    can={can}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Direct List Render (<=200 items) */
          <div className="space-y-0.5">
            {flatVisibleNodes.map((node) => (
              <TreeRow
                key={node.unit.orgUnitId}
                node={node}
                isExpanded={expandedIds.has(node.unit.orgUnitId)}
                isSelected={selectedId === node.unit.orgUnitId}
                isFocused={focusedId === node.unit.orgUnitId}
                typesMap={typesMap}
                onToggle={(e) => toggleExpand(node.unit.orgUnitId, e)}
                onSelect={() => {
                  setFocusedId(node.unit.orgUnitId);
                  effectiveSelect(node.unit);
                }}
                onAddChild={onAddChild}
                onMove={effectiveMove}
                onDelete={effectiveDelete}
                onToggleActive={effectiveToggleActive}
                can={can}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tree Footer / Unit Count */}
      <div className="p-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
        <span>{flatVisibleNodes.length} units visible</span>
        <span className="font-mono text-[10px]">
          {isVirtualised ? "Virtualised (O(1) DOM)" : "Standard Mode"}
        </span>
      </div>
    </div>
  );
}

/**
 * TreeRow — Individual accessible WAI-ARIA treeitem row.
 */
interface TreeRowProps {
  node: FlatVisibleNode;
  isExpanded: boolean;
  isSelected: boolean;
  isFocused: boolean;
  typesMap: Map<number, { name: string; code: string }>;
  onToggle: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onAddChild?: (parent: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onMove?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onDelete?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleActive?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  can: (permission: string) => boolean;
}

function TreeRow({
  node,
  isExpanded,
  isSelected,
  isFocused,
  typesMap,
  onToggle,
  onSelect,
  onAddChild,
  onMove,
  onDelete,
  onToggleActive,
  can,
}: TreeRowProps) {
  const { unit, depth, isLast, hasChildren, ancestorIsLast, siblingCount, indexInSiblings } = node;
  const typeCode = unit.type?.code || (unit.orgUnitTypeId ? typesMap.get(unit.orgUnitTypeId)?.code : "DEP") || "DEP";
  const statusType: OMSStatus = unit.isActive ? "active" : "terminated";

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 1}
      aria-setsize={siblingCount}
      aria-posinset={indexInSiblings + 1}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between h-[34px] px-1.5 rounded-md cursor-pointer transition-colors select-none",
        isSelected
          ? "bg-primary/15 text-primary font-medium ring-1 ring-primary/30"
          : isFocused
          ? "bg-muted text-foreground ring-1 ring-border"
          : "hover:bg-muted/60 text-foreground",
        !unit.isActive && "opacity-50"
      )}
    >
      {/* Left indent, expand toggle, and unit identity */}
      <div
        className="flex items-center h-full min-w-0 flex-1"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Expand / Collapse Toggle */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isExpanded ? `Collapse ${unit.name}` : `Expand ${unit.name}`}
          className={cn(
            "h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 transition-colors mr-1",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Standard Type Icon (Part 3.3 & v2 Foundations) */}
        <OrgTypeIcon type={typeCode} size="xs" className="mr-2 shrink-0" />

        {/* Unit Code in Monospace */}
        <span className="font-mono text-[11px] text-muted-foreground font-semibold shrink-0 mr-2">
          {unit.code}
        </span>

        {/* English Name */}
        <span className="text-xs truncate text-foreground font-medium mr-2">
          {unit.name}
        </span>

        {/* Arabic Name with strict text-node isolation (Part 2.5) */}
        {unit.nameAr && (
          <span
            dir="rtl"
            lang="ar"
            className="text-[11px] text-muted-foreground/80 font-arabic truncate hidden lg:inline mr-2"
          >
            {unit.nameAr}
          </span>
        )}
      </div>

      {/* Right-aligned Meta Badges & Action Menu */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {/* Child Count */}
        {unit.childCount !== undefined && unit.childCount > 0 && (
          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/40">
            {unit.childCount}
          </span>
        )}

        {/* Status Dot */}
        <StatusBadge status={statusType} size="sm" showDot={true} className="hidden sm:inline-flex" />

        {/* Hover Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={`Actions for ${unit.name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={onSelect} className="gap-2 cursor-pointer">
                <Eye className="h-3.5 w-3.5 text-primary" />
                View Details & Tabs
              </DropdownMenuItem>

              {can(ORG_PERMISSIONS.CREATE) && onAddChild && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(unit);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                  Add Sub-Unit
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.MOVE) && onMove && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(unit);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
                  Move Subtree
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.UPDATE) && onToggleActive && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(unit);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Power className="h-3.5 w-3.5 text-amber-600" />
                  {unit.isActive ? "Deactivate Unit" : "Activate Unit"}
                </DropdownMenuItem>
              )}

              {can(ORG_PERMISSIONS.DELETE) && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(unit);
                    }}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Unit
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
