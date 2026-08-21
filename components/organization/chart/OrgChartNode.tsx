"use client";

import * as React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { OrgUnitCard } from "@/components/oms/org/OrgUnitCard";
import { OrgUnitSummaryDto, OrgUnitEntity } from "@/lib/types/organization.types";

export interface OrgChartNodeData {
  unit: OrgUnitSummaryDto | OrgUnitEntity;
  isSelected?: boolean;
  isExpanded?: boolean;
  childCount?: number;
  orientation?: "TB" | "LR";
  onSelectUnit?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onOpenDetails?: (unit: OrgUnitSummaryDto | OrgUnitEntity) => void;
  onToggleExpand?: (unitId: string) => void;
  [key: string]: unknown;
}

export type OrgChartNodeType = Node<OrgChartNodeData, "orgUnitNode">;

/**
 * OrgChartNode — Custom React Flow Node rendering OrgUnitCard.
 *
 * Implements:
 * - Direct Handle anchoring for orthogonal connector lines.
 * - Dynamic Handle positioning based on vertical (TB) vs horizontal (LR) orientation.
 * - Seamless keyboard and mouse interaction delegation.
 */
export function OrgChartNode({ data, sourcePosition, targetPosition }: NodeProps<OrgChartNodeType>) {
  const {
    unit,
    isSelected = false,
    isExpanded = false,
    childCount,
    orientation = "TB",
    onSelectUnit,
    onOpenDetails,
    onToggleExpand,
  } = (data || {}) as OrgChartNodeData;

  const isVertical = orientation === "TB";
  const targetPos = targetPosition || (isVertical ? Position.Top : Position.Left);
  const sourcePos = sourcePosition || (isVertical ? Position.Bottom : Position.Right);

  if (!unit) return null;

  // Extract type code and name
  const typeCode = unit.type?.code || unit.orgUnitType?.code || "DEPARTMENT";
  const typeName = unit.type?.name || unit.orgUnitType?.name || "Department";
  const headName = unit.head?.displayName || unit.head?.userDisplayName || null;

  return (
    <div
      className="relative group cursor-pointer focus:outline-none"
      onClick={(e) => {
        e.stopPropagation();
        onSelectUnit?.(unit);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenDetails?.(unit);
      }}
    >
      {/* Target Handle (incoming connection from parent) */}
      <Handle
        type="target"
        position={targetPos}
        className="!opacity-0 !w-2 !h-2 !pointer-events-none !border-0 !bg-transparent"
      />

      {/* Presentation Card */}
      <OrgUnitCard
        id={unit.orgUnitId}
        code={unit.code}
        name={unit.name}
        nameAr={unit.nameAr}
        typeCode={typeCode}
        typeName={typeName}
        headName={headName}
        childCount={childCount}
        isSelected={isSelected}
        isExpanded={isExpanded}
        isArchived={!unit.isActive}
        onOpenDetails={(e) => {
          e?.stopPropagation();
          onOpenDetails?.(unit);
        }}
        onToggleExpand={(e) => {
          e?.stopPropagation();
          onToggleExpand?.(unit.orgUnitId);
        }}
      />

      {/* Source Handle (outgoing connection to children) */}
      <Handle
        type="source"
        position={sourcePos}
        className="!opacity-0 !w-2 !h-2 !pointer-events-none !border-0 !bg-transparent"
      />
    </div>
  );
}
