"use client";

import * as React from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Plus,
  Compass,
  Building2,
  Layers,
  ArrowUpDown,
  ArrowLeftRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgChartNode, CollapsedSiblingsCard } from "./chart";
import { computeTreeLayout, LayoutOrientation } from "@/lib/org-chart/tree-layout";
import {
  useOrgUnits,
  useOrgUnitAncestors,
} from "@/hooks/useOrganization";
import { orgUnitsApi } from "@/lib/api/organization";
import { OrgUnitSummaryDto, OrgUnitEntity } from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = {
  orgUnitNode: OrgChartNode as React.ComponentType<any>,
  collapsedSiblingsNode: CollapsedSiblingsCard as React.ComponentType<any>,
};

const STORAGE_KEY_EXPANDED = "oms_org_chart_expanded_v2";
const STORAGE_KEY_ORIENTATION = "oms_org_chart_orientation_v2";

export interface OrgChartCanvasProps {
  selectedUnitId?: string | null;
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onOpenDetails?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddUnit?: () => void;
  onSwitchToList?: () => void;
  deepLinkUnitId?: string | null;
  className?: string;
}

function OrgChartCanvasInner({
  selectedUnitId,
  onSelectUnit,
  onOpenDetails,
  onAddUnit,
  onSwitchToList,
  deepLinkUnitId,
  className,
}: OrgChartCanvasProps) {
  const reactFlowInstance = useReactFlow();

  // Layout & Viewport States
  const [orientation, setOrientation] = React.useState<LayoutOrientation>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY_ORIENTATION);
        if (saved === "TB" || saved === "LR") return saved;
      } catch {
        // Fallback to default
      }
    }
    return "TB";
  });

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY_EXPANDED);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        }
      } catch {
        // Fallback to default
      }
    }
    return new Set<string>();
  });

  const [showAllSiblingsForParents, setShowAllSiblingsForParents] = React.useState<Set<string>>(
    new Set()
  );

  // In-memory cache for children fetched dynamically
  const [childrenCache, setChildrenCache] = React.useState<
    Map<string, (OrgUnitSummaryDto | OrgUnitEntity)[]>
  >(new Map());

  const [isLoadingChildrenMap, setIsLoadingChildrenMap] = React.useState<
    Record<string, boolean>
  >({});

  // 1. Load Root Organization Units (Max page size 100)
  const {
    data: allUnitsData,
    isLoading: isLoadingRoots,
    isError: isErrorRoots,
    refetch: refetchRoots,
  } = useOrgUnits({ page: 1, pageSize: 100, isActive: true });

  // Identify root units (depth 0 or no parent) vs scoped fragment units
  const rootUnits = React.useMemo(() => {
    const list = allUnitsData?.data || [];
    return list.filter((u) => u.depth === 0 || !u.parentOrgUnitId);
  }, [allUnitsData]);

  const isScopedFragment =
    !isLoadingRoots &&
    rootUnits.length === 0 &&
    Boolean(allUnitsData?.data && allUnitsData.data.length > 0);

  const effectiveRoots: (OrgUnitSummaryDto | OrgUnitEntity)[] = React.useMemo(() => {
    if (rootUnits.length > 0) {
      return rootUnits;
    }
    if (isScopedFragment && allUnitsData?.data) {
      const allVisibleIds = new Set(allUnitsData.data.map((u) => u.orgUnitId));
      const topLevelScoped = allUnitsData.data.filter(
        (u) => !u.parentOrgUnitId || !allVisibleIds.has(u.parentOrgUnitId)
      );
      return topLevelScoped.length > 0 ? topLevelScoped : allUnitsData.data;
    }
    return [];
  }, [rootUnits, isScopedFragment, allUnitsData]);

  // Persist state changes in sessionStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY_ORIENTATION, orientation);
      } catch {
        // Ignore
      }
    }
  }, [orientation]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          STORAGE_KEY_EXPANDED,
          JSON.stringify(Array.from(expandedIds))
        );
      } catch {
        // Ignore
      }
    }
  }, [expandedIds]);

  // 2. Auto-expand the first two levels on initial mount (Part 3.2 & Part 5)
  const hasInitializedExpansionRef = React.useRef(false);

  React.useEffect(() => {
    if (
      effectiveRoots.length > 0 &&
      !hasInitializedExpansionRef.current
    ) {
      hasInitializedExpansionRef.current = true;

      setExpandedIds((prev) => {
        const next = new Set(prev);
        effectiveRoots.forEach((root) => next.add(root.orgUnitId));
        return next;
      });

      // Pre-fetch children for each root
      effectiveRoots.forEach(async (root) => {
        try {
          const children = await orgUnitsApi.getChildren(root.orgUnitId);
          setChildrenCache((prev) => {
            if (prev.has(root.orgUnitId)) return prev;
            const next = new Map(prev);
            next.set(root.orgUnitId, children);
            return next;
          });
        } catch {
          // Handled gracefully
        }
      });
    }
  }, [effectiveRoots]);

  // 3. Lazy Expansion Toggle Handler
  const handleToggleExpand = React.useCallback(
    async (unitId: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(unitId)) {
          next.delete(unitId);
        } else {
          next.add(unitId);
        }
        return next;
      });

      // If not yet in cache, fetch children
      setChildrenCache((currentCache) => {
        if (!currentCache.has(unitId)) {
          setIsLoadingChildrenMap((prev) => ({ ...prev, [unitId]: true }));
          orgUnitsApi
            .getChildren(unitId)
            .then((children) => {
              setChildrenCache((prev) => {
                const next = new Map(prev);
                next.set(unitId, children);
                return next;
              });
            })
            .catch((err) => {
              console.error("Failed to load unit children:", err);
            })
            .finally(() => {
              setIsLoadingChildrenMap((prev) => ({ ...prev, [unitId]: false }));
            });
        }
        return currentCache;
      });
    },
    []
  );

  // 4. Show All Siblings Handler
  const handleShowAllSiblings = React.useCallback((parentId: string) => {
    setShowAllSiblingsForParents((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });
  }, []);

  // 5. Deep Link Resolution (?unit=<id>)
  const { data: ancestorPathData } = useOrgUnitAncestors(
    deepLinkUnitId || undefined,
    { enabled: Boolean(deepLinkUnitId) }
  );

  const fetchedAncestorsRef = React.useRef<string>("");

  React.useEffect(() => {
    if (deepLinkUnitId && ancestorPathData && ancestorPathData.length > 0) {
      if (fetchedAncestorsRef.current === deepLinkUnitId) return;
      fetchedAncestorsRef.current = deepLinkUnitId;

      // Auto-expand all ancestors in the chain
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorPathData.forEach((a) => next.add(a.orgUnitId));
        return next;
      });

      // Pre-fetch children for each ancestor along the path
      ancestorPathData.forEach(async (ancestor) => {
        try {
          const children = await orgUnitsApi.getChildren(ancestor.orgUnitId);
          setChildrenCache((prev) => {
            if (prev.has(ancestor.orgUnitId)) return prev;
            const next = new Map(prev);
            next.set(ancestor.orgUnitId, children);
            return next;
          });
        } catch {
          // Ignore
        }
      });
    }
  }, [deepLinkUnitId, ancestorPathData]);

  // 6. Compute Layout Nodes & Edges (via d3-hierarchy engine)
  const computedLayout = React.useMemo(() => {
    const layout = computeTreeLayout(effectiveRoots, childrenCache, {
      orientation,
      expandedIds,
      showAllSiblingsForParents,
      selectedUnitId,
      siblingThreshold: 12,
    });

    // Attach interaction callbacks to node data
    const nodesWithHandlers = layout.nodes.map((node) => {
      if (node.type === "collapsedSiblingsNode") {
        return {
          ...node,
          data: {
            ...node.data,
            orientation,
            onShowAllSiblings: handleShowAllSiblings,
          },
        };
      }

      return {
        ...node,
        data: {
          ...node.data,
          orientation,
          onSelectUnit,
          onOpenDetails,
          onToggleExpand: handleToggleExpand,
        },
      };
    });

    return {
      nodes: nodesWithHandlers,
      edges: layout.edges,
      bounds: layout.bounds,
    };
  }, [
    effectiveRoots,
    childrenCache,
    orientation,
    expandedIds,
    showAllSiblingsForParents,
    selectedUnitId,
    onSelectUnit,
    onOpenDetails,
    handleToggleExpand,
    handleShowAllSiblings,
  ]);

  // 7. Auto-center on initial layout or deep link
  const initialFitRef = React.useRef(false);

  React.useEffect(() => {
    if (computedLayout.nodes.length > 0 && !initialFitRef.current) {
      initialFitRef.current = true;
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        } catch {
          // Viewport not yet mounted
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [computedLayout.nodes.length, reactFlowInstance]);

  // Center on deep-linked node
  React.useEffect(() => {
    if (deepLinkUnitId) {
      const targetNode = computedLayout.nodes.find((n) => n.id === deepLinkUnitId);
      if (targetNode) {
        const timer = setTimeout(() => {
          try {
            reactFlowInstance.setCenter(
              targetNode.position.x + 120,
              targetNode.position.y + 90,
              { zoom: 0.9, duration: 500 }
            );
          } catch {
            // Viewport not ready
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [deepLinkUnitId, computedLayout.nodes, reactFlowInstance]);

  // 8. Keyboard Navigation for Accessibility (Part 9 & Prompt V3)
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // +/- Zoom Controls
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        reactFlowInstance.zoomIn({ duration: 200 });
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        reactFlowInstance.zoomOut({ duration: 200 });
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
        return;
      }

      // Arrow navigation between cards
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        const unitNodes = computedLayout.nodes.filter(
          (n) => n.type === "orgUnitNode"
        );
        if (unitNodes.length === 0) return;

        const currentIndex = unitNodes.findIndex(
          (n) => n.id === selectedUnitId
        );
        let nextIndex = 0;

        if (currentIndex === -1) {
          nextIndex = 0;
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % unitNodes.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + unitNodes.length) % unitNodes.length;
        }

        const nextNode = unitNodes[nextIndex];
        const unitData = nextNode?.data as any;
        if (unitData && unitData.unit) {
          e.preventDefault();
          onSelectUnit?.(unitData.unit);
          try {
            reactFlowInstance.setCenter(
              nextNode.position.x + 120,
              nextNode.position.y + 90,
              { zoom: 0.9, duration: 300 }
            );
          } catch {
            // Ignore
          }
        }
      }

      // Enter / Space to open details
      if (e.key === "Enter" || e.key === " ") {
        if (selectedUnitId) {
          const selectedNode = computedLayout.nodes.find(
            (n) => n.id === selectedUnitId
          );
          const selectedData = selectedNode?.data as any;
          if (selectedData && selectedData.unit) {
            e.preventDefault();
            onOpenDetails?.(selectedData.unit);
          }
        }
      }
    },
    [
      reactFlowInstance,
      computedLayout.nodes,
      selectedUnitId,
      onSelectUnit,
      onOpenDetails,
    ]
  );

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Organisation Chart Canvas. Use arrow keys to navigate between departments, Enter or Space to open details, Plus/Minus to zoom, Zero to fit view."
      onKeyDown={handleKeyDown}
      className={cn(
        "relative w-full h-[680px] min-h-[500px] rounded-2xl border border-border bg-card/60 shadow-xs overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none",
        className
      )}
    >
      {/* Screen Reader Affordance (Prompt V9 / A11y Requirement) */}
      {onSwitchToList && (
        <button
          type="button"
          onClick={onSwitchToList}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:font-medium focus:text-xs"
        >
          Switch to accessible list view
        </button>
      )}

      {/* Scoped User Notice Banner (Part 6.2 - Calm, non-technical) */}
      {isScopedFragment && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-xs text-xs text-muted-foreground animate-in fade-in-50">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>You&apos;re seeing the parts of the organisation you work with.</span>
        </div>
      )}

      {/* Loading Skeleton Tree State (Part 6.5) */}
      {isLoadingRoots && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur-xs space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>

          <div className="flex items-center gap-8">
            <Skeleton className="w-[240px] h-[160px] rounded-2xl" />
            <Skeleton className="w-[240px] h-[160px] rounded-2xl" />
            <Skeleton className="w-[240px] h-[160px] rounded-2xl" />
          </div>

          <span className="text-xs text-muted-foreground font-medium animate-pulse">
            Loading organisation chart...
          </span>
        </div>
      )}

      {/* Error State with Reason and Retry (Part 6.5) */}
      {isErrorRoots && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-card space-y-3 text-center">
          <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <RotateCw className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Unable to load organisation chart
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We encountered a network issue loading the organisation units. Please retry.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchRoots()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty State: First Run Setup (Part 6.5) */}
      {!isLoadingRoots && !isErrorRoots && effectiveRoots.length === 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-card space-y-4 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-foreground">
              Let&apos;s set up your organisation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No departments or teams have been created yet. Add the first root entity to begin.
            </p>
          </div>
          {onAddUnit && (
            <Button size="sm" onClick={onAddUnit} className="gap-2 text-xs">
              <Plus className="h-4 w-4" />
              Add Organisation
            </Button>
          )}
        </div>
      )}

      {/* Core Interactive Canvas */}
      <ReactFlow
        nodes={computedLayout.nodes}
        edges={computedLayout.edges}
        nodeTypes={nodeTypes}
        // Viewport Virtualization & 60fps Optimization (Part 5)
        onlyRenderVisibleElements={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={false}
        panOnDrag={true}
        minZoom={0.2}
        maxZoom={1.5}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-muted/15"
      >
        <Background
          color="var(--border)"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
          className="opacity-40"
        />

        {/* Minimap (Bottom-Left per Part 3.2) */}
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => {
            if (n.type === "collapsedSiblingsNode") return "var(--muted)";
            return "var(--primary)";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!bottom-4 !left-4 !m-0 !rounded-xl !border !border-border !bg-card/90 !backdrop-blur-md !shadow-xs !overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Floating Canvas Controls Overlay (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-xs">
        {/* Orientation Switcher (Vertical TB / Horizontal LR - Part 6.1) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOrientation(orientation === "TB" ? "LR" : "TB")}
          title={
            orientation === "TB"
              ? "Switch to Horizontal (Left-to-Right) layout"
              : "Switch to Vertical (Top-to-Bottom) layout"
          }
          className="h-7 px-2 text-xs gap-1.5 text-foreground hover:bg-muted"
        >
          {orientation === "TB" ? (
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="hidden sm:inline">
            {orientation === "TB" ? "Top-Down" : "Left-Right"}
          </span>
        </Button>

        <div className="h-4 w-px bg-border/80 my-auto" />

        {/* Zoom Presets: 50%, 80%, 100%, Fit (Part 3.2) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.zoomTo(0.5, { duration: 300 });
            } catch {}
          }}
          className="h-7 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
        >
          50%
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.zoomTo(0.8, { duration: 300 });
            } catch {}
          }}
          className="h-7 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
        >
          80%
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.zoomTo(1.0, { duration: 300 });
            } catch {}
          }}
          className="h-7 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
        >
          100%
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
            } catch {}
          }}
          className="h-7 px-2.5 text-xs font-semibold gap-1"
        >
          <Maximize2 className="h-3 w-3" />
          Fit
        </Button>
      </div>
    </div>
  );
}

/**
 * OrgChartCanvas — Interactive Top-Down / Left-Right Org Chart Canvas.
 *
 * Implements:
 * - Part 3.2: Canvas surface, orthogonal connectors, pan/zoom, minimap, presets.
 * - Part 5: 5,000-unit performance virtualisation, lazy expansion, sibling limit.
 * - Part 6.1: Horizontal layout toggle for deep hierarchies.
 * - Part 6.2: Scoped-fragment support without fake parent boxes.
 */
export function OrgChartCanvas(props: OrgChartCanvasProps) {
  return (
    <ReactFlowProvider>
      <OrgChartCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
