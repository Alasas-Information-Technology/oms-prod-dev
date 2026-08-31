import { DASHBOARD_PERSONA_LAYOUTS } from "../src/lib/dashboard/fixtures";
import { calculateBalancedSpans } from "../src/components/oms/dashboard/DashboardGrid";
import { DashboardPersona } from "../src/types/dashboard";

const personas: DashboardPersona[] = ["requestor", "hod", "hr", "finance", "systemAdmin"];

console.log("===============================================================================");
console.log("VERIFYING PERSONA DASHBOARD LAYOUTS & HOLE-FREE GRID PACKING");
console.log("===============================================================================");

let allPassed = true;

for (const persona of personas) {
  const layout = DASHBOARD_PERSONA_LAYOUTS[persona];
  console.log(`\n--- Persona: [${persona}] ---`);
  console.log(`Greeting: ${layout.greeting.name} (${layout.greeting.period})`);
  console.log(`Scope: ${layout.scope.level} - ${layout.scope.label}`);

  let totalWidgets = 0;

  for (const band of layout.bands) {
    if (!band.widgets || band.widgets.length === 0) continue;

    const balancedSpans = calculateBalancedSpans(band.widgets);
    const sortedWidgets = [...band.widgets].sort((a, b) => a.priority - b.priority);

    totalWidgets += sortedWidgets.length;

    // Check row packing
    let currentRowSum = 0;
    const rows: { id: string; span: number }[][] = [];
    let currentRow: { id: string; span: number }[] = [];

    for (const w of sortedWidgets) {
      const span = balancedSpans.get(w.id)!;
      if (currentRowSum + span > 12) {
        rows.push(currentRow);
        currentRow = [{ id: w.id, span }];
        currentRowSum = span;
      } else {
        currentRow.push({ id: w.id, span });
        currentRowSum += span;
      }
    }
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    console.log(`  Band ${band.band} (${sortedWidgets.length} widgets):`);
    rows.forEach((r, idx) => {
      const rowSum = r.reduce((s, x) => s + x.span, 0);
      const isFilled = rowSum === 12;
      const widgetsStr = r.map(x => `${x.id}(span ${x.span})`).join(" + ");
      console.log(`    Row ${idx + 1}: ${widgetsStr} = ${rowSum}/12 cols ${isFilled ? "✅ [HOLE-FREE]" : "❌ [GAP]"}`);
      if (!isFilled) allPassed = false;
    });
  }

  console.log(`Total Widgets: ${totalWidgets}`);
}

console.log("\n===============================================================================");
if (allPassed) {
  console.log("✅ ALL 5 PERSONAS PRODUCED 100% HOLE-FREE 12-COLUMN BALANCED LAYOUTS!");
} else {
  console.log("❌ SOME ROWS HAVE GAPS");
  process.exit(1);
}
console.log("===============================================================================");
