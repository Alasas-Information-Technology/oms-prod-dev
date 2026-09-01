export interface AttentionItem {
  id: string;
  type: "requisitions" | "budget" | "candidates" | "workforce" | "leave" | "vendors";
  label: string;
  count: number;
  href: string;
  description?: string;
}

export const DASHBOARD_ATTENTION_FIXTURES: AttentionItem[] = [
  {
    id: "requisitions",
    type: "requisitions",
    label: "Requisitions",
    count: 4,
    href: "/app/requests?tab=needs-my-action",
    description: "Requisitions awaiting your review or decision",
  },
  {
    id: "budget",
    type: "budget",
    label: "Budget amendment",
    count: 1,
    href: "/app/budget?tab=needs-my-action",
    description: "Inter-departmental allocation transfer",
    // TODO(budget): wire when the module ships
  },
  {
    id: "candidates",
    type: "candidates",
    label: "Interview bypass",
    count: 2,
    href: "/app/candidates?tab=needs-my-action",
    description: "Executive candidate waiver approval requests",
    // TODO(candidates): wire when the module ships
  },
  {
    id: "workforce",
    type: "workforce",
    label: "Closure, termination, replacement",
    count: 0,
    href: "/app/workforce?tab=needs-my-action",
    // TODO(workforce): wire when the module ships
  },
  {
    id: "leave",
    type: "leave",
    label: "Leave requests",
    count: 0,
    href: "/app/leave?tab=needs-my-action",
    // TODO(leave): wire when the module ships
  },
  {
    id: "vendors",
    type: "vendors",
    label: "Vendor rate card",
    count: 0,
    href: "/app/vendors?tab=needs-my-action",
    // TODO(vendors): wire when the module ships
  },
];

export function getNeedsAttentionSummary() {
  const activeItems = DASHBOARD_ATTENTION_FIXTURES.filter((item) => item.count > 0);
  const totalCount = activeItems.reduce((sum, item) => sum + item.count, 0);

  return {
    items: activeItems,
    allItems: DASHBOARD_ATTENTION_FIXTURES,
    totalCount,
  };
}
