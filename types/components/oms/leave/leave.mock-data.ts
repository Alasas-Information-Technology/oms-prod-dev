import {
  LeaveApprovalStep,
  LeaveBalance,
  LeaveEntitlementRule,
  LeaveRequestRecord,
} from "./leave.types";

export const LEAVE_BALANCES: LeaveBalance[] = [
  {
    id: "annual",
    label: "Annual Leave",
    entitlementLabel: "Paid",
    entitled: 30,
    used: 2,
    pending: 0,
    remaining: 28,
  },
  {
    id: "sick",
    label: "Sick Leave",
    entitlementLabel: "Paid",
    entitled: 90,
    used: 0,
    pending: 0,
    remaining: 90,
  },
  {
    id: "comp-off",
    label: "Comp-Off",
    entitlementLabel: "Paid",
    entitled: 5,
    used: 0,
    pending: 0,
    remaining: 5,
  },
  {
    id: "unpaid",
    label: "Unpaid Leave",
    entitlementLabel: "Unpaid",
    approvalOnly: true,
  },
];

export const LEAVE_HISTORY: LeaveRequestRecord[] = [
  {
    id: "LV-2026-0042",
    typeId: "annual",
    typeLabel: "Annual Leave",
    startDate: new Date(2026, 8, 17),
    endDate: new Date(2026, 8, 18),
    duration: 2,
    paid: true,
    status: "approved",
    approver: "Omar Al Hashmi",
    requestedAt: new Date(2026, 8, 5),
    reason: "Personal appointment",
  },
  {
    id: "LV-2026-0031",
    typeId: "sick",
    typeLabel: "Sick Leave",
    startDate: new Date(2026, 7, 14),
    endDate: new Date(2026, 7, 14),
    duration: 1,
    paid: true,
    status: "approved",
    approver: "Omar Al Hashmi",
    requestedAt: new Date(2026, 7, 14),
    reason: "Medical rest",
  },
  {
    id: "LV-2026-0018",
    typeId: "annual",
    typeLabel: "Annual Leave",
    startDate: new Date(2026, 6, 5),
    endDate: new Date(2026, 6, 5),
    duration: 0.5,
    paid: true,
    status: "withdrawn",
    approver: "Omar Al Hashmi",
    requestedAt: new Date(2026, 6, 2),
    reason: "Personal errand",
  },
];

export const LEAVE_APPROVAL_STEPS: LeaveApprovalStep[] = [
  {
    id: "submitted",
    label: "Request submitted",
    description: "The employee submits the leave request.",
    state: "complete",
  },
  {
    id: "manager",
    label: "Reporting line manager",
    description: "Manager reviews dates and team coverage.",
    state: "current",
  },
  {
    id: "entitlement",
    label: "Entitlement validation",
    description: "Balance and policy rules are checked.",
    state: "upcoming",
  },
  {
    id: "decision",
    label: "Approved or rejected",
    description: "The final decision is recorded and notified.",
    state: "upcoming",
  },
];

export const LEAVE_ENTITLEMENT_RULES: LeaveEntitlementRule[] = [
  { id: "working-days", label: "Leave is counted using scheduled working days." },
  { id: "balance", label: "Requests cannot exceed the available paid balance." },
  { id: "attachment", label: "Medical evidence may be required for sick leave." },
  { id: "approval", label: "All requests require reporting-manager approval." },
  { id: "carry-forward", label: "Carry-forward is governed by the current HR policy." },
];

export const DEFAULT_LEAVE_RANGE = {
  from: new Date(2026, 8, 17),
  to: new Date(2026, 8, 18),
};
