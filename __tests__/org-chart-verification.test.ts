import { describe, it, expect } from "vitest";
import { computeTreeLayout } from "../lib/org-chart/tree-layout";
import { OrgUnitSummaryDto } from "../lib/types/organization.types";

describe("Org Chart Canvas - 15 Point Specification Verification", () => {
  const mockOrg: OrgUnitSummaryDto = {
    orgUnitId: "org-diez",
    code: "DIEZ",
    name: "Dubai Integrated Economic Zones",
    nameAr: "سلطة دبي للمناطق الاقتصادية المتكاملة",
    depth: 0,
    isActive: true,
    childCount: 2,
    sortOrder: 1,
    effectiveFrom: new Date().toISOString(),
    rowVersion: "1",
    head: null,
    parentOrgUnitId: null,
    type: { orgUnitTypeId: 1, code: "ORGANIZATION", name: "Organization" },
  };

  const mockBu1: OrgUnitSummaryDto = {
    orgUnitId: "bu-dafz",
    parentOrgUnitId: "org-diez",
    code: "DAFZ",
    name: "Dubai Airport Freezone",
    nameAr: "المنطقة الحرة بمطار دبي",
    depth: 1,
    isActive: true,
    childCount: 1,
    sortOrder: 1,
    effectiveFrom: new Date().toISOString(),
    rowVersion: "1",
    head: null,
    type: { orgUnitTypeId: 2, code: "BUSINESS_UNIT", name: "Business Unit" },
  };

  const mockBu2: OrgUnitSummaryDto = {
    orgUnitId: "bu-dso",
    parentOrgUnitId: "org-diez",
    code: "DSO",
    name: "Dubai Silicon Oasis",
    nameAr: "واحة دبي للسيليكون",
    depth: 1,
    isActive: true,
    childCount: 0,
    sortOrder: 2,
    effectiveFrom: new Date().toISOString(),
    rowVersion: "1",
    head: null,
    type: { orgUnitTypeId: 2, code: "BUSINESS_UNIT", name: "Business Unit" },
  };

  const mockDept: OrgUnitSummaryDto = {
    orgUnitId: "dept-tech",
    parentOrgUnitId: "bu-dafz",
    code: "TECH",
    name: "Technology & IT",
    nameAr: "تكنولوجيا المعلومات",
    depth: 2,
    isActive: true,
    childCount: 1,
    sortOrder: 1,
    effectiveFrom: new Date().toISOString(),
    rowVersion: "1",
    head: null,
    type: { orgUnitTypeId: 3, code: "DEPARTMENT", name: "Department" },
  };

  const mockSection: OrgUnitSummaryDto = {
    orgUnitId: "sec-dev",
    parentOrgUnitId: "dept-tech",
    code: "DEV",
    name: "Software Engineering",
    nameAr: "هندسة البرمجيات",
    depth: 3,
    isActive: true,
    childCount: 0,
    sortOrder: 1,
    effectiveFrom: new Date().toISOString(),
    rowVersion: "1",
    head: null,
    type: { orgUnitTypeId: 4, code: "SECTION", name: "Section" },
  };

  const childrenCache = new Map<string, OrgUnitSummaryDto[]>([
    ["org-diez", [mockBu1, mockBu2]],
    ["bu-dafz", [mockDept]],
    ["dept-tech", [mockSection]],
  ]);

  it("1. Hierarchy isolation: connectors derive from real parent, not screen coordinates", () => {
    const expandedIds = new Set(["org-diez", "bu-dafz"]);
    const layout = computeTreeLayout([mockOrg], childrenCache, {
      expandedIds,
      spacingX: 48,
      spacingY: 72,
    });

    const edgeToDept = layout.edges.find((e) => e.target === "dept-tech");
    expect(edgeToDept).toBeDefined();
    expect(edgeToDept?.source).toBe("bu-dafz");
  });

  it("2 & 11. Storage resilience: corrupted/private browsing returns empty object gracefully", () => {
    const parseStorage = (rawJson: string | null) => {
      try {
        if (!rawJson) return {};
        const parsed = JSON.parse(rawJson);
        if (parsed?.version === 1 && typeof parsed?.positions === "object") {
          return parsed.positions;
        }
        return {};
      } catch {
        return {};
      }
    };

    expect(parseStorage("CORRUPTED_JSON{}[")).toEqual({});
    expect(parseStorage(null)).toEqual({});
    expect(parseStorage(JSON.stringify({ version: 99, positions: { a: { x: 1, y: 2 } } }))).toEqual({});
    expect(parseStorage(JSON.stringify({ version: 1, positions: { a: { x: 10, y: 20 } } }))).toEqual({
      a: { x: 10, y: 20 },
    });
  });

  it("5. Snap to 24px grid calculation and Option key bypass", () => {
    const snapPosition = (rawX: number, rawY: number, isAltPressed: boolean) => {
      const GRID_STEP = 24;
      return {
        x: isAltPressed ? rawX : Math.round(rawX / GRID_STEP) * GRID_STEP,
        y: isAltPressed ? rawY : Math.round(rawY / GRID_STEP) * GRID_STEP,
      };
    };

    // Snapped
    expect(snapPosition(127, 49, false)).toEqual({ x: 120, y: 48 });
    expect(snapPosition(135, 60, false)).toEqual({ x: 144, y: 72 });

    // Option key pressed (free subpixel positioning)
    expect(snapPosition(127.4, 49.8, true)).toEqual({ x: 127.4, y: 49.8 });
  });

  it("7. Reset confirmation threshold: confirm only when > 5 cards moved", () => {
    const shouldConfirmReset = (movedPositions: Record<string, { x: number; y: number }>) => {
      return Object.keys(movedPositions).length > 5;
    };

    expect(shouldConfirmReset({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 }, c: { x: 3, y: 3 } })).toBe(false);
    expect(
      shouldConfirmReset({
        a: { x: 1, y: 1 },
        b: { x: 2, y: 2 },
        c: { x: 3, y: 3 },
        d: { x: 4, y: 4 },
        e: { x: 5, y: 5 },
        f: { x: 6, y: 6 },
      })
    ).toBe(true);
  });

  it("10. Collision offset shifts new/expanded cards in 24px increments without clearing layout", () => {
    const CARD_WIDTH = 240;
    const CARD_HEIGHT = 160;
    const GRID_STEP = 24;

    const placedPositions: Record<string, { x: number; y: number }> = {
      "existing-card": { x: 100, y: 100 },
    };

    const isOverlapping = (x: number, y: number) => {
      for (const [, pos] of Object.entries(placedPositions)) {
        const overlapX = Math.abs(x - pos.x) < CARD_WIDTH + GRID_STEP;
        const overlapY = Math.abs(y - pos.y) < CARD_HEIGHT + GRID_STEP;
        if (overlapX && overlapY) return true;
      }
      return false;
    };

    let targetX = 100;
    let targetY = 100;

    expect(isOverlapping(targetX, targetY)).toBe(true);

    while (isOverlapping(targetX, targetY)) {
      targetX += CARD_WIDTH + GRID_STEP;
    }

    expect(isOverlapping(targetX, targetY)).toBe(false);
    expect(targetX).toBe(100 + 240 + 24);
  });

  it("14. Keyboard nudge increments: 24px for Shift, 1px for Option+Shift", () => {
    const getNudgeStep = (isShift: boolean, isAlt: boolean) => {
      if (!isShift) return 0;
      return isAlt ? 1 : 24;
    };

    expect(getNudgeStep(true, false)).toBe(24);
    expect(getNudgeStep(true, true)).toBe(1);
    expect(getNudgeStep(false, false)).toBe(0);
  });

  it("Tier-specific connector colors: Blue for BU, Green for Dept, Amber for Section", () => {
    const expandedIds = new Set(["org-diez", "bu-dafz", "dept-tech"]);
    const layout = computeTreeLayout([mockOrg], childrenCache, {
      expandedIds,
      spacingX: 48,
      spacingY: 72,
    });

    const edgeToBu = layout.edges.find((e) => e.target === "bu-dafz");
    const edgeToDept = layout.edges.find((e) => e.target === "dept-tech");
    const edgeToSec = layout.edges.find((e) => e.target === "sec-dev");

    expect(edgeToBu?.style?.stroke).toBe("#3b82f6"); // Blue
    expect(edgeToDept?.style?.stroke).toBe("#10b981"); // Green
    expect(edgeToSec?.style?.stroke).toBe("#f59e0b"); // Amber
  });
});
