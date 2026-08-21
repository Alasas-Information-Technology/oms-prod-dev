import { hierarchy, tree } from "d3-hierarchy";
import { Node, Edge, Position } from "@xyflow/react";
import { OrgUnitSummaryDto, OrgUnitEntity } from "@/lib/types/organization.types";

export type LayoutOrientation = "TB" | "LR"; // TB = Top-to-Bottom (Vertical), LR = Left-to-Right (Horizontal)

export interface LayoutOptions {
  orientation?: LayoutOrientation;
  expandedIds: Set<string>;
  showAllSiblingsForParents?: Set<string>;
  selectedUnitId?: string | null;
  siblingThreshold?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  spacingX?: number;
  spacingY?: number;
}

export interface HierarchyTreeNode {
  id: string;
  isSyntheticCollapsed?: boolean;
  parentOrgUnitId?: string | null;
  totalSiblingsCount?: number;
  collapsedCount?: number;
  childTypeWord?: string;
  unit?: OrgUnitSummaryDto | OrgUnitEntity;
  children?: HierarchyTreeNode[];
}

export interface ComputedChartLayout {
  nodes: Node[];
  edges: Edge[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * Computes deterministic tree coordinates using D3-Hierarchy and transforms
 * entities into React Flow nodes and orthogonal elbow edges.
 *
 * Implements:
 * - Part 3.2: Top-down and Left-to-right computed layouts with orthogonal connectors.
 * - Part 5: Sibling collapse beyond 12 cards into a "+ N more departments" card.
 * - 60 FPS guarantee: $O(N)$ calculation where $N$ is only visible/expanded nodes.
 */
export function computeTreeLayout(
  rootUnits: (OrgUnitSummaryDto | OrgUnitEntity)[],
  childrenCache: Map<string, (OrgUnitSummaryDto | OrgUnitEntity)[]>,
  options: LayoutOptions
): ComputedChartLayout {
  const {
    orientation = "TB",
    expandedIds,
    showAllSiblingsForParents = new Set(),
    selectedUnitId,
    siblingThreshold = 12,
    nodeWidth = 240,
    nodeHeight = 180,
    spacingX = 40,
    spacingY = 70,
  } = options;

  if (!rootUnits || rootUnits.length === 0) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  // 1. Build Hierarchical Tree Structure with Sibling Clamping
  function buildSubtree(unit: OrgUnitSummaryDto | OrgUnitEntity): HierarchyTreeNode {
    const isExpanded = expandedIds.has(unit.orgUnitId);
    const rawChildren = childrenCache.get(unit.orgUnitId) || [];

    if (!isExpanded || rawChildren.length === 0) {
      return {
        id: unit.orgUnitId,
        parentOrgUnitId: unit.parentOrgUnitId,
        unit,
      };
    }

    const showAll = showAllSiblingsForParents.has(unit.orgUnitId);
    const totalChildren = rawChildren.length;

    let visibleChildNodes: HierarchyTreeNode[];

    if (totalChildren > siblingThreshold && !showAll) {
      // Keep first (siblingThreshold) children
      const sliced = rawChildren.slice(0, siblingThreshold).map(buildSubtree);
      const remainingCount = totalChildren - siblingThreshold;

      // Determine child type word
      const sampleChild = rawChildren[0];
      const childTypeName = sampleChild?.orgUnitType?.name || sampleChild?.type?.name || "Unit";
      const childTypeWord =
        childTypeName.toLowerCase().includes("sec")
          ? "sections"
          : childTypeName.toLowerCase().includes("dep")
          ? "departments"
          : childTypeName.toLowerCase().includes("bus")
          ? "business units"
          : "units";

      // Append synthetic collapsed node
      sliced.push({
        id: `collapsed-siblings-${unit.orgUnitId}`,
        isSyntheticCollapsed: true,
        parentOrgUnitId: unit.orgUnitId,
        totalSiblingsCount: totalChildren,
        collapsedCount: remainingCount,
        childTypeWord,
      });

      visibleChildNodes = sliced;
    } else {
      visibleChildNodes = rawChildren.map(buildSubtree);
    }

    return {
      id: unit.orgUnitId,
      parentOrgUnitId: unit.parentOrgUnitId,
      unit,
      children: visibleChildNodes,
    };
  }

  // Virtual root if multiple top-level roots exist
  const virtualRoot: HierarchyTreeNode = {
    id: "__virtual_root__",
    children: rootUnits.map(buildSubtree),
  };

  // 2. Compute Layout with D3 Tree Algorithm
  const d3Root = hierarchy<HierarchyTreeNode>(virtualRoot, (d) => d.children);

  const isVertical = orientation === "TB";
  const stepX = isVertical ? nodeWidth + spacingX : nodeHeight + spacingY;
  const stepY = isVertical ? nodeHeight + spacingY : nodeWidth + spacingX;

  const treeLayout = tree<HierarchyTreeNode>().nodeSize([stepX, stepY]);
  treeLayout(d3Root);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // 3. Map D3 coordinates to React Flow Nodes & Edges
  d3Root.each((d) => {
    // Skip virtual root node
    if (d.data.id === "__virtual_root__") {
      return;
    }

    // Determine coordinate mapping with safe defaults
    const nodeX = d.x ?? 0;
    const nodeY = d.y ?? 0;
    const rawX = isVertical ? nodeX : nodeY;
    const rawY = isVertical ? nodeY : nodeX;

    // Center-offset node positions
    const posX = rawX - nodeWidth / 2;
    const posY = rawY - nodeHeight / 2;

    minX = Math.min(minX, posX);
    maxX = Math.max(maxX, posX + nodeWidth);
    minY = Math.min(minY, posY);
    maxY = Math.max(maxY, posY + nodeHeight);

    const sourcePosition = isVertical ? Position.Bottom : Position.Right;
    const targetPosition = isVertical ? Position.Top : Position.Left;

    if (d.data.isSyntheticCollapsed) {
      // Synthetic Collapsed Siblings Node
      nodes.push({
        id: d.data.id,
        type: "collapsedSiblingsNode",
        position: { x: posX, y: posY },
        sourcePosition,
        targetPosition,
        data: {
          parentId: d.data.parentOrgUnitId,
          totalCount: d.data.totalSiblingsCount,
          collapsedCount: d.data.collapsedCount,
          childTypeWord: d.data.childTypeWord,
        },
      });
    } else if (d.data.unit) {
      const unit = d.data.unit;
      const isSelected = selectedUnitId === unit.orgUnitId;
      const isExpanded = expandedIds.has(unit.orgUnitId);
      const childCount =
        unit.childCount !== undefined
          ? unit.childCount
          : (childrenCache.get(unit.orgUnitId) || []).length;

      nodes.push({
        id: unit.orgUnitId,
        type: "orgUnitNode",
        position: { x: posX, y: posY },
        sourcePosition,
        targetPosition,
        data: {
          unit,
          isSelected,
          isExpanded,
          childCount,
          orientation,
        },
      });
    }

    // Edge from parent
    if (d.parent && d.parent.data.id !== "__virtual_root__") {
      edges.push({
        id: `edge-${d.parent.data.id}->${d.data.id}`,
        source: d.parent.data.id,
        target: d.data.id,
        type: "smoothstep",
        style: {
          stroke: "var(--border)",
          strokeWidth: 1.5,
        },
      });
    }
  });

  return {
    nodes,
    edges,
    bounds: {
      minX: Number.isFinite(minX) ? minX : 0,
      maxX: Number.isFinite(maxX) ? maxX : 0,
      minY: Number.isFinite(minY) ? minY : 0,
      maxY: Number.isFinite(maxY) ? maxY : 0,
      width: Number.isFinite(maxX - minX) ? Math.max(0, maxX - minX) : 0,
      height: Number.isFinite(maxY - minY) ? Math.max(0, maxY - minY) : 0,
    },
  };
}
