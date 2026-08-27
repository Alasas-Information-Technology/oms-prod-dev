"use client";

import * as React from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  useViewport,
  MiniMap,
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
  Undo2,
  Redo2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrgChartNode, CollapsedSiblingsCard, DottedCanvasGrid } from "./chart";
import { computeTreeLayout, LayoutOrientation } from "@/lib/org-chart/tree-layout";
import {
  useOrgUnits,
  useOrgUnitAncestors,
} from "@/hooks/useOrganization";
import {
  useOrgChartLayoutPersistence,
  NodePositionsMap,
} from "@/hooks/useOrgChartLayoutPersistence";
import { orgUnitsApi } from "@/lib/api/organization";
import { OrgUnitSummaryDto, OrgUnitEntity } from "@/lib/types/organization.types";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = {
  orgUnitNode: OrgChartNode as React.ComponentType<any>,
  collapsedSiblingsNode: CollapsedSiblingsCard as React.ComponentType<any>,
};

const STORAGE_KEY_EXPANDED = "oms_org_chart_expanded_v3";
const STORAGE_KEY_ORIENTATION = "oms_org_chart_orientation_v1";

export interface OrgChartCanvasProps {
  selectedUnitId?: string | null;
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onOpenDetails?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onAddUnit?: () => void;
  onSwitchToList?: () => void;
  deepLinkUnitId?: string | null;
  /**
   * Whether dragging is disabled (e.g. while Move flow, Add flow, or detail panel is open).
   */
  isLocked?: boolean;
  /**
   * User identifier for persisting personal layout in localStorage per Part 1.2 / Part 5.
   */
  userId?: string;
  /**
   * Whether an element is actively being dragged (raises dot grid opacity to 12% per Part 2).
   */
  isDragging?: boolean;
  className?: string;
}

function OrgChartCanvasInner({
  selectedUnitId,
  onSelectUnit,
  onOpenDetails,
  onAddUnit,
  onSwitchToList,
  deepLinkUnitId,
  isLocked = false,
  userId = "default",
  isDragging,
  className,
}: OrgChartCanvasProps) {
  const reactFlowInstance = useReactFlow();
  const [internalIsDragging, setInternalIsDragging] = React.useState(false);
  const [draggedNodeId, setDraggedNodeId] = React.useState<string | null>(null);
  const effectiveIsDragging = isDragging ?? internalIsDragging;

  const isOptionPressedRef = React.useRef(false);

  // Track Alt / Option key for free drag (bypassing snap per Part 1.4)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) isOptionPressedRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) isOptionPressedRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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

  const activeUnitIds = React.useMemo(
    () => new Set(allUnitsData?.data?.map((u) => u.orgUnitId) || []),
    [allUnitsData]
  );

  // 2. Personal Layout Persistence (Part 1.2 & Part 5)
  const rootUnitId = effectiveRoots[0]?.orgUnitId || "root";
  const {
    positions: customPositions,
    setNodePosition,
    updatePositions,
    undo,
    redo,
    resetLayout,
    canUndo,
    canRedo,
    hasCustomPositions,
  } = useOrgChartLayoutPersistence({
    userId,
    rootUnitId,
    activeUnitIds,
  });

  // Indicator and Reset Confirmation States (Part 4)
  const [isIndicatorFaded, setIsIndicatorFaded] = React.useState(false);
  const [isHoveringTopLeft, setIsHoveringTopLeft] = React.useState(false);
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const fadeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { zoom } = useViewport();
  const zoomPercentage = Math.round((zoom || 1) * 100);

  // Custom layout indicator 4s fade-out timer (Part 4)
  React.useEffect(() => {
    if (hasCustomPositions) {
      setIsIndicatorFaded(false);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setIsIndicatorFaded(true);
      }, 4000);
    } else {
      setIsIndicatorFaded(false);
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [hasCustomPositions, customPositions]);

  const performReset = React.useCallback(() => {
    setIsResetting(true);
    resetLayout();
    setTimeout(() => {
      setIsResetting(false);
    }, 350);
  }, [resetLayout]);

  const handleRequestReset = React.useCallback(() => {
    if (!hasCustomPositions) return;
    const movedCount = Object.keys(customPositions).length;
    if (movedCount > 5) {
      setShowConfirmReset(true);
    } else {
      performReset();
    }
  }, [hasCustomPositions, customPositions, performReset]);

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

  // 2. Populate children cache from allUnitsData
  React.useEffect(() => {
    if (allUnitsData?.data && allUnitsData.data.length > 0) {
      setChildrenCache((prev) => {
        const next = new Map(prev);
        const parentMap = new Map<string, (OrgUnitSummaryDto | OrgUnitEntity)[]>();
        for (const unit of allUnitsData.data) {
          if (unit.parentOrgUnitId) {
            const list = parentMap.get(unit.parentOrgUnitId) || [];
            list.push(unit);
            parentMap.set(unit.parentOrgUnitId, list);
          }
        }
        for (const [parentId, children] of parentMap.entries()) {
          if (!next.has(parentId)) {
            next.set(parentId, children);
          }
        }
        return next;
      });
    }
  }, [allUnitsData?.data]);

  // 3. Default Expansion: Only Root Org is expanded so only Org and Business Units are visible by default
  const hasInitializedExpansionRef = React.useRef(false);

  React.useEffect(() => {
    if (
      effectiveRoots.length > 0 &&
      !hasInitializedExpansionRef.current &&
      allUnitsData?.data &&
      allUnitsData.data.length > 0
    ) {
      hasInitializedExpansionRef.current = true;

      // Expand strictly ONLY the root organization entities so Business Units are visible and Departments/Sections stay collapsed
      setExpandedIds(() => {
        const next = new Set<string>();
        effectiveRoots.forEach((root) => next.add(root.orgUnitId));
        return next;
      });

      // Pre-fetch children for the roots
      effectiveRoots.forEach(async (root) => {
        try {
          const children = await orgUnitsApi.getChildren(root.orgUnitId);
          setChildrenCache((prev) => {
            const next = new Map(prev);
            next.set(root.orgUnitId, children);
            return next;
          });
        } catch {
          // Handled gracefully
        }
      });
    }
  }, [effectiveRoots, allUnitsData?.data]);

  // 4. Lazy Expansion Toggle Handler
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

  // 5. Show All Siblings Handler
  const handleShowAllSiblings = React.useCallback((parentId: string) => {
    setShowAllSiblingsForParents((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });
  }, []);

  // 6. Deep Link Resolution (?unit=<id>)
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

  // 7. Compute Layout Nodes & Edges (with Custom Positions & Part 1.5 Collision Avoidance)
  const computedLayout = React.useMemo(() => {
    const rawLayout = computeTreeLayout(effectiveRoots, childrenCache, {
      orientation,
      expandedIds,
      showAllSiblingsForParents,
      selectedUnitId,
      siblingThreshold: 12,
      nodeWidth: 240,
      nodeHeight: 160,
      spacingX: 48,
      spacingY: 72,
    });

    const CARD_WIDTH = 240;
    const CARD_HEIGHT = 160;
    const GRID_STEP = 24;

    // Placed positions map
    const placedPositions: Record<string, { x: number; y: number }> = {};

    // First place nodes that have explicit customPositions saved by user
    for (const node of rawLayout.nodes) {
      if (customPositions[node.id]) {
        placedPositions[node.id] = { ...customPositions[node.id] };
      }
    }

    // Helper: checks collision with already placed cards
    const isOverlapping = (x: number, y: number, excludeId: string) => {
      for (const [id, pos] of Object.entries(placedPositions)) {
        if (id === excludeId) continue;
        const overlapX = Math.abs(x - pos.x) < CARD_WIDTH + GRID_STEP;
        const overlapY = Math.abs(y - pos.y) < CARD_HEIGHT + GRID_STEP;
        if (overlapX && overlapY) return true;
      }
      return false;
    };

    // Second: place new/expanded nodes at computed auto-layout position
    // If overlapping, offset by one grid step (24px) until clear (Part 1.5)
    for (const node of rawLayout.nodes) {
      if (!placedPositions[node.id]) {
        let posX = Math.round(node.position.x / GRID_STEP) * GRID_STEP;
        let posY = Math.round(node.position.y / GRID_STEP) * GRID_STEP;

        let iterations = 0;
        while (isOverlapping(posX, posY, node.id) && iterations < 50) {
          if (orientation === "TB") {
            posY += GRID_STEP;
          } else {
            posX += GRID_STEP;
          }
          iterations++;
        }

        placedPositions[node.id] = { x: posX, y: posY };
      }
    }

    // Attach interaction callbacks & drag state to node data
    const nodesWithHandlers = rawLayout.nodes.map((node) => {
      const pos = placedPositions[node.id] || node.position;
      const isBeingDragged = draggedNodeId === node.id;

      if (node.type === "collapsedSiblingsNode") {
        return {
          ...node,
          position: pos,
          draggable: false,
          data: {
            ...node.data,
            orientation,
            onShowAllSiblings: handleShowAllSiblings,
          },
        };
      }

      return {
        ...node,
        position: pos,
        draggable: !isLocked,
        data: {
          ...node.data,
          orientation,
          isDraggingNode: isBeingDragged,
          onSelectUnit,
          onOpenDetails,
          onToggleExpand: handleToggleExpand,
        },
      };
    });

    return {
      nodes: nodesWithHandlers,
      edges: rawLayout.edges,
      bounds: rawLayout.bounds,
    };
  }, [
    effectiveRoots,
    childrenCache,
    orientation,
    expandedIds,
    showAllSiblingsForParents,
    selectedUnitId,
    customPositions,
    draggedNodeId,
    isLocked,
    onSelectUnit,
    onOpenDetails,
    handleToggleExpand,
    handleShowAllSiblings,
  ]);

  // Live node & edge states for ReactFlow real-time 60fps drag preview
  const [nodes, setNodes, onNodesChange] = useNodesState(computedLayout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedLayout.edges);

  // Sync computed layout changes into nodes and edges state
  React.useEffect(() => {
    setNodes(computedLayout.nodes);
  }, [computedLayout.nodes, setNodes]);

  React.useEffect(() => {
    setEdges(computedLayout.edges);
  }, [computedLayout.edges, setEdges]);

  // 8. Auto-center on initial layout, orientation change, or deep link
  React.useEffect(() => {
    if (computedLayout.nodes.length > 0) {
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.15, duration: 400 });
        } catch {
          // Viewport not yet mounted
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [computedLayout.nodes.length, orientation, reactFlowInstance]);

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

  // 9. Node Drag Handlers (Part 3.1 - 3.3)
  const handleNodeDragStart = React.useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      if (isLocked) return;
      setDraggedNodeId(node.id);
      setInternalIsDragging(true);
    },
    [isLocked]
  );

  // Auto-pan when within 60px of a canvas edge, capped at 8px/frame (Part 3.2)
  const handleNodeDrag = React.useCallback(
    (event: MouseEvent | TouchEvent, _node: Node) => {
      const flowEl = document.querySelector(".react-flow");
      if (flowEl) {
        const rect = flowEl.getBoundingClientRect();
        const EDGE_THRESHOLD = 60;
        const MAX_PAN_SPEED = 8;

        const clientX = "clientX" in event ? event.clientX : (event.touches?.[0]?.clientX ?? 0);
        const clientY = "clientY" in event ? event.clientY : (event.touches?.[0]?.clientY ?? 0);

        let panX = 0;
        let panY = 0;

        if (clientX < rect.left + EDGE_THRESHOLD) {
          panX = Math.max(
            -MAX_PAN_SPEED,
            -((rect.left + EDGE_THRESHOLD - clientX) / EDGE_THRESHOLD) * MAX_PAN_SPEED
          );
        } else if (clientX > rect.right - EDGE_THRESHOLD) {
          panX = Math.min(
            MAX_PAN_SPEED,
            ((clientX - (rect.right - EDGE_THRESHOLD)) / EDGE_THRESHOLD) * MAX_PAN_SPEED
          );
        }

        if (clientY < rect.top + EDGE_THRESHOLD) {
          panY = Math.max(
            -MAX_PAN_SPEED,
            -((rect.top + EDGE_THRESHOLD - clientY) / EDGE_THRESHOLD) * MAX_PAN_SPEED
          );
        } else if (clientY > rect.bottom - EDGE_THRESHOLD) {
          panY = Math.min(
            MAX_PAN_SPEED,
            ((clientY - (rect.bottom - EDGE_THRESHOLD)) / EDGE_THRESHOLD) * MAX_PAN_SPEED
          );
        }

        if (panX !== 0 || panY !== 0) {
          const viewport = reactFlowInstance.getViewport();
          reactFlowInstance.setViewport({
            x: viewport.x - panX,
            y: viewport.y - panY,
            zoom: viewport.zoom,
          });
        }
      }
    },
    [reactFlowInstance]
  );

  // Snap to 24px grid on release unless Option key is held (Part 3.3)
  const handleNodeDragStop = React.useCallback(
    (event: MouseEvent | TouchEvent, node: Node) => {
      setDraggedNodeId(null);
      setInternalIsDragging(false);

      const GRID_STEP = 24;
      const isAltPressed = "altKey" in event ? Boolean(event.altKey) : false;
      const isFree = isOptionPressedRef.current || isAltPressed;

      const finalX = isFree
        ? node.position.x
        : Math.round(node.position.x / GRID_STEP) * GRID_STEP;
      const finalY = isFree
        ? node.position.y
        : Math.round(node.position.y / GRID_STEP) * GRID_STEP;

      setNodePosition(node.id, { x: finalX, y: finalY }, true);
    },
    [setNodePosition]
  );

  // 10. Keyboard Navigation & Shortcuts (Part 3.4, Part 3.5, Part 9)
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // Undo: Cmd+Z / Ctrl+Z (Part 3.4)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Shift+Z / Ctrl+Y (Part 3.4)
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Keyboard Nudging (Part 3.5): Shift+arrow = 24px, Option+Shift+arrow = 1px
      if (
        selectedUnitId &&
        (e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        if (e.shiftKey) {
          e.preventDefault();
          const step = e.altKey ? 1 : 24;
          const currentNode = computedLayout.nodes.find((n) => n.id === selectedUnitId);
          const currentPos = customPositions[selectedUnitId] ||
            currentNode?.position || { x: 0, y: 0 };

          let dx = 0;
          let dy = 0;
          if (e.key === "ArrowLeft") dx = -step;
          if (e.key === "ArrowRight") dx = step;
          if (e.key === "ArrowUp") dy = -step;
          if (e.key === "ArrowDown") dy = step;

          setNodePosition(
            selectedUnitId,
            { x: currentPos.x + dx, y: currentPos.y + dy },
            true
          );
          return;
        }
      }

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
      customPositions,
      setNodePosition,
      undo,
      redo,
      onSelectUnit,
      onOpenDetails,
    ]
  );

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Organization Chart Canvas. Use arrow keys to navigate between departments, Enter or Space to open details, Plus/Minus to zoom, Zero to fit view."
      onKeyDown={handleKeyDown}
      className={cn(
        "relative w-full h-full min-h-[500px] overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none",
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

      {/* Top-Left Notification & Indicator Stack (16px inset per Part 4) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
        {/* Scoped User Notice Banner (Part 6.2 - Calm, non-technical) */}
        {isScopedFragment && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-xs text-xs text-muted-foreground animate-in fade-in-50 pointer-events-auto">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>You&apos;re seeing the parts of the organization you work with.</span>
          </div>
        )}

        {/* Custom Layout Indicator (Part 4: 12px text, --text-secondary, --surface-2 at 90%, 0.5px border, 8px radius, 6/10 padding) */}
        {hasCustomPositions && (
          <div
            onMouseEnter={() => setIsHoveringTopLeft(true)}
            onMouseLeave={() => setIsHoveringTopLeft(false)}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card/90 backdrop-blur-md border border-border/80 shadow-xs text-xs text-muted-foreground transition-opacity duration-300 pointer-events-auto select-none",
              !isHoveringTopLeft && !effectiveIsDragging && isIndicatorFaded
                ? "opacity-0 hover:opacity-100"
                : "opacity-100"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-foreground">Custom layout</span>
            <button
              type="button"
              onClick={handleRequestReset}
              className="ml-1 text-xs font-semibold text-primary hover:underline cursor-pointer focus:outline-none"
            >
              Reset
            </button>
          </div>
        )}
      </div>

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
            Loading organization chart...
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
              Unable to load organization chart
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We encountered a network issue loading the organization units. Please retry.
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
              Let&apos;s set up your organization
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No departments or teams have been created yet. Add the first root entity to begin.
            </p>
          </div>
          {onAddUnit && (
            <Button size="sm" onClick={onAddUnit} className="gap-2 text-xs">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          )}
        </div>
      )}

      {/* Core Interactive Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // Viewport Virtualization & 60fps Optimization (Part 5)
        onlyRenderVisibleElements={true}
        nodesDraggable={!isLocked}
        nodeDragThreshold={4}
        panActivationKeyCode="Space"
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
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
        {/* Part 2 Dotted Canvas Grid: 1px dots, 24px spacing, --text-primary at 6%/12% opacity, radial edge mask, zoom scaling */}
        <DottedCanvasGrid isDragging={effectiveIsDragging} />

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

      {/* Floating Canvas Controls Overlay (Bottom-Right Cluster - Part 4) */}
      {/* [ ⊖ ] 80% [ ⊕ ] │ [ ⤢ ] │ [ ⇅ ] │ [ ↺ ] */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-xs">
        {/* Zoom Sub-cluster */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.zoomOut({ duration: 200 });
            } catch {}
          }}
          title="Zoom out"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>

        <span
          className="text-[11px] font-mono font-medium text-foreground min-w-[32px] text-center select-none"
          title="Current zoom level"
        >
          {zoomPercentage}%
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.zoomIn({ duration: 200 });
            } catch {}
          }}
          title="Zoom in"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/80 my-auto" />

        {/* Fit to View Sub-cluster (Leaves card positions alone per Part 1.3) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
            } catch {}
          }}
          title="Fit to view"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/80 my-auto" />

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
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {orientation === "TB" ? (
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
          )}
        </Button>

        <div className="h-4 w-px bg-border/80 my-auto" />

        {/* Reset Layout Sub-cluster (Part 4: disabled at 40% opacity when unmodified, tooltip "Reset card positions") */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRequestReset}
          disabled={!hasCustomPositions}
          title="Reset card positions"
          className={cn(
            "h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity",
            !hasCustomPositions && "opacity-40 cursor-not-allowed"
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Confirmation Dialog when >5 cards moved per Part 4 */}
      <AlertDialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset card positions?</AlertDialogTitle>
            <AlertDialogDescription>
              Reset all card positions? Your arrangement will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmReset(false);
                performReset();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
