import { WIDGET_REGISTRY } from "../lib/dashboard/registry";
import { calculateBalancedSpans } from "../components/oms/dashboard/DashboardGrid";
import { WidgetId, WidgetPlacement } from "../types/dashboard";

console.log("===============================================================================");
console.log("VERIFYING BAND A PERMISSION GATING & HOLE-FREE ROW BALANCING");
console.log("===============================================================================");

// Case 1: User with only REQUISITION.VIEW
const userPerms = ["REQUISITION.VIEW"];
const bandAWidgets: WidgetId[] = [
  "needs-my-action",
  "requests-in-approval",
  "onboarding-cases",
  "expiring-documents",
  "auto-close-watch",
  "open-exceptions",
  "candidates-awaiting-review",
  "vendor-submissions",
  "security-events",
];

const visibleWidgets: WidgetPlacement[] = [];

for (const id of bandAWidgets) {
  const def = WIDGET_REGISTRY[id];
  const isPermitted = def.requiredPermissions.every((p) => userPerms.includes(p));
  if (isPermitted) {
    visibleWidgets.push({
      id,
      span: def.defaultSpan,
      priority: 10,
    });
  }
}

console.log(`User with only ['REQUISITION.VIEW'] sees: ${visibleWidgets.map(w => w.id).join(", ")}`);
console.log(`Expected: needs-my-action, requests-in-approval, auto-close-watch, open-exceptions`);

const isCorrectSet =
  visibleWidgets.length === 4 &&
  visibleWidgets.some(w => w.id === "needs-my-action") &&
  visibleWidgets.some(w => w.id === "requests-in-approval") &&
  visibleWidgets.some(w => w.id === "auto-close-watch") &&
  visibleWidgets.some(w => w.id === "open-exceptions");

console.log(`Widget Set Check: ${isCorrectSet ? "✅ PASS" : "❌ FAIL"}`);

const balancedSpans = calculateBalancedSpans(visibleWidgets);
const totalSpan = visibleWidgets.reduce((sum, w) => sum + (balancedSpans.get(w.id) || 0), 0);
console.log(`Total Row Span: ${totalSpan}/12 cols ${totalSpan === 12 ? "✅ [HOLE-FREE]" : "❌ [GAP]"}`);

// Case 2: 3 widgets in Band A (A1, A2, A5)
const threeWidgets: WidgetPlacement[] = [
  { id: "needs-my-action", span: 3, priority: 10 },
  { id: "requests-in-approval", span: 3, priority: 20 },
  { id: "auto-close-watch", span: 3, priority: 30 },
];
const threeSpans = calculateBalancedSpans(threeWidgets);
const threeSum = threeWidgets.reduce((sum, w) => sum + (threeSpans.get(w.id) || 0), 0);
console.log(`\n3 Widgets Test: spans = ${threeWidgets.map(w => `${w.id}:${threeSpans.get(w.id)}`).join(", ")} (Sum = ${threeSum}/12) ${threeSum === 12 ? "✅ [HOLE-FREE]" : "❌ [GAP]"}`);

console.log("===============================================================================");
