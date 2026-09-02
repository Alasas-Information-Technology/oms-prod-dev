/**
 * Clarification Mock Fixtures
 *
 * CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER STRINGS.
 * 1 AED = 100 fils (e.g., AED 240,000.00 = 24000000 fils).
 */

import {
  ClarificationDetail,
  ClarificationPreviewResponse,
  InfoWithApprovalClarificationDetail,
  MoreInfoClarificationDetail,
  AmendClarificationDetail,
} from "@/types/clarification";

/**
 * Fixture (a): INFO_WITH_APPROVAL — Full Case
 * Seeded request OMS-2026-0139, Data Governance Specialist, raised by Aisha Al Nuaimi on 5 Aug.
 * 3 asks (2 addressed), 4 editable fields, 5-step route, intact budget, 28 days left, cycle 2, 3-entry thread.
 */
export const FIXTURE_INFO_WITH_APPROVAL: InfoWithApprovalClarificationDetail = {
  clarificationId: "clar-2026-0139-01",
  requestId: "OMS-2026-0139",
  requestTitle: "Data Governance Specialist",
  type: "INFO_WITH_APPROVAL",
  status: "AWAITING_RESPONSE",
  canRespond: true,
  readOnlyReason: null,

  raisedBy: {
    userId: "usr-hr-042",
    name: "Aisha Al Nuaimi",
    role: "HR Specialist",
    avatarUrl: "/avatars/aisha.jpg",
  },
  raisedAt: "2026-08-05T11:20:00Z",
  message:
    "Please clarify the data-governance deliverables, update the engagement end date to 31 Aug 2027 to align with the enterprise metadata milestone, and attach the approved project plan.",
  attachments: [
    {
      id: "att-0139-01",
      name: "Data_Governance_Requirements_v2.pdf",
      sizeBytes: 2457600,
      url: "https://storage.diez.ae/requests/Data_Governance_Requirements_v2.pdf",
      scanStatus: "VERIFIED",
    },
  ],

  asks: [
    {
      id: "ask-1",
      text: "Clarify the data-governance deliverables",
      fieldKey: "justification",
      addressed: true,
    },
    {
      id: "ask-2",
      text: "Update the engagement end date",
      fieldKey: "engagementEndDate",
      addressed: true,
    },
    {
      id: "ask-3",
      text: "Attach the approved project plan",
      fieldKey: null,
      addressed: false,
    },
  ],

  editableFields: [
    {
      key: "engagementEndDate",
      label: "Engagement end date",
      type: "DATE",
      currentValue: "2027-06-30",
      proposedValue: "2027-08-31",
      financialImpact: false,
      helpText: "Aligned with Data Governance Phase 2 milestones",
    },
    {
      key: "durationMonths",
      label: "Duration",
      type: "NUMBER",
      unit: "months",
      currentValue: 10,
      proposedValue: 12,
      financialImpact: false,
      helpText: null,
    },
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue:
        "Initial scope for corporate data governance setup across central administration departments.",
      proposedValue:
        "Expanded scope covering regulatory compliance, metadata catalog implementation, and compliance audits across all DIEZ business units.",
      financialImpact: false,
      helpText: null,
    },
    {
      key: "budgetAmount",
      label: "Budget amount",
      type: "MONEY",
      currentValue: 24000000, // AED 240,000.00
      proposedValue: 24000000, // AED 240,000.00 (unchanged)
      financialImpact: true,
      helpText: "Increasing this starts a budget amendment",
    },
  ],

  thread: [
    {
      id: "th-01",
      actor: {
        userId: "usr-req-101",
        name: "Omar Tariq",
        role: "Requestor",
      },
      action: "SUBMITTED",
      message:
        "Initial requisition submitted for Data Governance Specialist (10 months duration, AED 240,000).",
      attachments: [],
      at: "2026-08-01T09:00:00Z",
    },
    {
      id: "th-02",
      actor: {
        userId: "usr-hr-042",
        name: "Aisha Al Nuaimi",
        role: "HR Specialist",
      },
      action: "CLARIFICATION_REQUESTED",
      message:
        "Preliminary review: Please confirm whether this role will oversee master data management across both DAFZA and DCC clusters.",
      attachments: [],
      at: "2026-08-03T10:15:00Z",
    },
    {
      id: "th-03",
      actor: {
        userId: "usr-req-101",
        name: "Omar Tariq",
        role: "Requestor",
      },
      action: "RESPONSE_SUBMITTED",
      message:
        "Confirmed: The specialist will cover both clusters under unified data architecture governance.",
      attachments: [],
      at: "2026-08-04T14:30:00Z",
    },
  ],
  cycleNumber: 2,

  deadline: {
    closesAt: "2026-09-30T00:00:00Z",
    daysRemaining: 28,
    severity: "NORMAL",
  },

  draft: {
    message:
      "I have updated the engagement end date to 31 Aug 2027 (12 months) and clarified the deliverables in the justification field.",
    fieldValues: {
      engagementEndDate: "2027-08-31",
      durationMonths: 12,
      justification:
        "Expanded scope covering regulatory compliance, metadata catalog implementation, and compliance audits across all DIEZ business units.",
      budgetAmount: 24000000,
    },
    attachments: [],
    savedAt: "2026-08-06T12:04:00Z",
  },

  consequence: {
    requiresReapproval: true,
    approvers: [
      { userId: "usr-lm-001", name: "Omar Al Hashmi", stage: "LINE_MANAGER" },
      { userId: "usr-sh-002", name: "Fatima Al Marri", stage: "SECTION_HEAD" },
      { userId: "usr-hod-003", name: "Khalid Al Suwaidi", stage: "HOD" },
    ],
    summary:
      "Because you are changing approved details, this returns to Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before it reaches HR.",
  },
};

/**
 * Fixture (b): MORE_INFO — Simple Case
 * A simple two-sentence question. No editable fields, no route stepper, no budget panel.
 * Demonstrates clean page collapse.
 */
export const FIXTURE_MORE_INFO: MoreInfoClarificationDetail = {
  clarificationId: "clar-2026-0155-01",
  requestId: "OMS-2026-0155",
  requestTitle: "Senior Cybersecurity Operations Engineer",
  type: "MORE_INFO",
  status: "AWAITING_RESPONSE",
  canRespond: true,
  readOnlyReason: null,

  raisedBy: {
    userId: "usr-hr-042",
    name: "Aisha Al Nuaimi",
    role: "HR Specialist",
  },
  raisedAt: "2026-08-08T08:45:00Z",
  message:
    "Please confirm whether the proposed cybersecurity contractor requires physical security badge access to the DAFZA data center premises or remote VPN access only.",
  attachments: [],

  asks: [
    {
      id: "ask-mi-1",
      text: "Confirm physical data center badge vs remote VPN access",
      fieldKey: null,
      addressed: false,
    },
  ],

  thread: [
    {
      id: "th-mi-01",
      actor: {
        userId: "usr-req-102",
        name: "Rashid Al Mansoori",
        role: "Requestor",
      },
      action: "SUBMITTED",
      message: "Requisition submitted for Cybersecurity Operations Engineer.",
      attachments: [],
      at: "2026-08-07T11:00:00Z",
    },
  ],
  cycleNumber: 1,

  deadline: {
    closesAt: "2026-09-06T00:00:00Z",
    daysRemaining: 26,
    severity: "NORMAL",
  },

  draft: {
    message: "",
    fieldValues: {},
    attachments: [],
    savedAt: "2026-08-08T09:15:00Z",
  },

  consequence: {
    requiresReapproval: false,
    approvers: [],
    summary:
      "Your answer goes to HR, your line manager and your HOD. No new approvals are needed.",
  },
};

/**
 * Fixture (c): AMEND with a Budget Increase
 * Requisition OMS-2026-0142 with budget amount increased from AED 360,000 to AED 420,000.
 * Result: REQUIRES_AMENDMENT.
 */
export const FIXTURE_AMEND_BUDGET_INCREASE: AmendClarificationDetail = {
  clarificationId: "clar-2026-0142-01",
  requestId: "OMS-2026-0142",
  requestTitle: "Senior Enterprise Cloud Architect",
  type: "AMEND",
  status: "AWAITING_RESPONSE",
  canRespond: true,
  readOnlyReason: null,

  raisedBy: {
    userId: "usr-hr-050",
    name: "Mariam Al Falasi",
    role: "HR Talent Lead",
  },
  raisedAt: "2026-08-07T14:10:00Z",
  message:
    "Market rate card benchmarks for Senior Enterprise Cloud Architect indicate an adjustment to AED 420,000 is required for certified AWS/Azure specialists. Please amend the budget allocation.",
  attachments: [
    {
      id: "att-0142-01",
      name: "DIEZ_Cloud_Architect_Market_Benchmark_2026.pdf",
      sizeBytes: 1843200,
      url: "https://storage.diez.ae/requests/benchmark.pdf",
      scanStatus: "VERIFIED",
    },
  ],

  asks: [
    {
      id: "ask-amend-1",
      text: "Increase budget allocation to AED 420,000 based on HR rate card",
      fieldKey: "budgetAmount",
      addressed: true,
    },
  ],

  editableFields: [
    {
      key: "budgetAmount",
      label: "Budget amount",
      type: "MONEY",
      currentValue: 36000000, // AED 360,000.00
      proposedValue: 42000000, // AED 420,000.00 (+ AED 60,000.00)
      financialImpact: true,
      helpText: "Increasing this starts a budget amendment",
    },
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue:
        "Senior Cloud Architect needed for cloud migration program.",
      proposedValue:
        "Senior Cloud Architect required with specialized multi-cloud security certifications per HR rate benchmark.",
      financialImpact: false,
      helpText: null,
    },
  ],

  thread: [
    {
      id: "th-am-01",
      actor: {
        userId: "usr-req-105",
        name: "Hassan Al Mazrouei",
        role: "Requestor",
      },
      action: "SUBMITTED",
      message: "Requisition raised at initial estimate AED 360,000.",
      attachments: [],
      at: "2026-08-05T10:00:00Z",
    },
  ],
  cycleNumber: 1,

  deadline: {
    closesAt: "2026-09-12T00:00:00Z",
    daysRemaining: 18,
    severity: "NORMAL",
  },

  draft: {
    message:
      "Adjusted total budget allocation to AED 420,000 per HR benchmark recommendations.",
    fieldValues: {
      budgetAmount: 42000000,
      justification:
        "Senior Cloud Architect required with specialized multi-cloud security certifications per HR rate benchmark.",
    },
    attachments: [],
    savedAt: "2026-08-07T16:00:00Z",
  },

  consequence: {
    requiresReapproval: true,
    approvers: [
      { userId: "usr-lm-005", name: "Saeed Al Tayer", stage: "LINE_MANAGER" },
      { userId: "usr-hod-005", name: "Dr. Hamad Al Mutawa", stage: "HOD" },
    ],
    summary:
      "HR has asked for changes. Once submitted, this goes through approval and budget checks again.",
  },
};

/**
 * Fixture (d): CRITICAL Deadline (2 days remaining)
 * Tests red banner escalation & urgent consequence copy.
 */
export const FIXTURE_CRITICAL_DEADLINE: InfoWithApprovalClarificationDetail = {
  clarificationId: "clar-2026-0120-02",
  requestId: "OMS-2026-0120",
  requestTitle: "Senior DevOps Infrastructure Specialist",
  type: "INFO_WITH_APPROVAL",
  status: "AWAITING_RESPONSE",
  canRespond: true,
  readOnlyReason: null,

  raisedBy: {
    userId: "usr-hr-042",
    name: "Aisha Al Nuaimi",
    role: "HR Specialist",
  },
  raisedAt: "2026-07-28T09:00:00Z",
  message:
    "URGENT: Final reminder to provide the updated team resource roster and revised project milestones. This request has reached 28 days of pending clarification.",
  attachments: [],

  asks: [
    {
      id: "ask-crit-1",
      text: "Submit updated resource roster and vendor clearance",
      fieldKey: "justification",
      addressed: false,
    },
  ],

  editableFields: [
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue: "Initial DevOps contractor requisition.",
      proposedValue: "Initial DevOps contractor requisition.",
      financialImpact: false,
      helpText: null,
    },
  ],

  thread: [
    {
      id: "th-cr-01",
      actor: {
        userId: "usr-req-101",
        name: "Omar Tariq",
        role: "Requestor",
      },
      action: "SUBMITTED",
      message: "Submitted requisition on 15 July.",
      attachments: [],
      at: "2026-07-15T08:30:00Z",
    },
    {
      id: "th-cr-02",
      actor: {
        userId: "usr-hr-042",
        name: "Aisha Al Nuaimi",
        role: "HR Specialist",
      },
      action: "CLARIFICATION_REQUESTED",
      message: "Please clarify contractor clearance timeline.",
      attachments: [],
      at: "2026-07-28T09:00:00Z",
    },
  ],
  cycleNumber: 2,

  deadline: {
    closesAt: "2026-08-27T23:59:59Z",
    daysRemaining: 2,
    severity: "CRITICAL",
  },

  draft: {
    message: "",
    fieldValues: {},
    attachments: [],
    savedAt: "2026-08-25T11:00:00Z",
  },

  consequence: {
    requiresReapproval: true,
    approvers: [
      { userId: "usr-lm-001", name: "Omar Al Hashmi", stage: "LINE_MANAGER" },
      { userId: "usr-hod-003", name: "Khalid Al Suwaidi", stage: "HOD" },
    ],
    summary:
      "Because you are changing approved details, this returns to Omar Al Hashmi and Khalid Al Suwaidi before it reaches HR.",
  },
};

/**
 * Fixture Map for Fast Lookup
 */
export const MOCK_CLARIFICATION_FIXTURES: Record<string, ClarificationDetail> = {
  "OMS-2026-0139": FIXTURE_INFO_WITH_APPROVAL,
  "info-with-approval": FIXTURE_INFO_WITH_APPROVAL,
  "OMS-2026-0155": FIXTURE_MORE_INFO,
  "more-info": FIXTURE_MORE_INFO,
  "OMS-2026-0142": FIXTURE_AMEND_BUDGET_INCREASE,
  "amend": FIXTURE_AMEND_BUDGET_INCREASE,
  "OMS-2026-0120": FIXTURE_CRITICAL_DEADLINE,
  "critical-deadline": FIXTURE_CRITICAL_DEADLINE,
};

/**
 * Live Previews Generator based on dynamic field values
 */
export function generateMockClarificationPreview(
  clarification: ClarificationDetail,
  fieldValues: Record<string, any>
): ClarificationPreviewResponse {
  if (clarification.type === "MORE_INFO") {
    return {
      type: "MORE_INFO",
      asksAddressed: [],
    };
  }

  const isAmend = clarification.type === "AMEND";
  const editableFields = clarification.editableFields || [];

  // Compute diffs
  const diff = editableFields.map((f) => {
    const rawNewValue = fieldValues[f.key] !== undefined ? fieldValues[f.key] : f.proposedValue;
    const isChanged = String(rawNewValue) !== String(f.currentValue);

    let beforeStr = String(f.currentValue);
    let afterStr = String(rawNewValue);

    if (f.type === "DATE") {
      beforeStr = f.currentValue === "2027-06-30" ? "30 Jun 2027" : String(f.currentValue);
      afterStr = rawNewValue === "2027-08-31" ? "31 Aug 2027" : String(rawNewValue);
    } else if (f.type === "MONEY") {
      beforeStr = `AED ${(Number(f.currentValue) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
      afterStr = `AED ${(Number(rawNewValue) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    } else if (f.unit) {
      beforeStr = `${f.currentValue} ${f.unit}`;
      afterStr = `${rawNewValue} ${f.unit}`;
    }

    return {
      fieldKey: f.key,
      label: f.label,
      before: beforeStr,
      after: afterStr,
      changed: isChanged,
    };
  });

  // Calculate asks addressed
  const asksAddressed = clarification.asks
    .filter((ask) => {
      if (!ask.fieldKey) return ask.addressed;
      const val = fieldValues[ask.fieldKey];
      return val !== undefined && val !== null && String(val).trim().length > 0;
    })
    .map((ask) => ask.id);

  // Dynamic budget calculation
  const proposedBudget = Number(fieldValues.budgetAmount ?? 24000000);
  const currentReservation = isAmend ? 36000000 : 24000000;
  const changeAmount = proposedBudget - currentReservation;
  const lineAvailable = 78000000;

  let budgetResult: "WITHIN_BUDGET" | "REQUIRES_AMENDMENT" | "INSUFFICIENT" = "WITHIN_BUDGET";
  let budgetMessage = "Still within budget";

  if (changeAmount > 0) {
    budgetResult = "REQUIRES_AMENDMENT";
    budgetMessage = "This starts a budget amendment";
  } else if (changeAmount < 0) {
    budgetMessage = "Budget reduction will release unused funds upon approval";
  }

  return {
    type: clarification.type,
    diff,
    route: [
      { index: 1, stage: "REQUESTOR", label: "You", state: "CURRENT" },
      { index: 2, stage: "LINE_MANAGER", label: "Omar Al Hashmi", state: "PENDING" },
      { index: 3, stage: "SECTION_HEAD", label: "Fatima Al Marri", state: "PENDING" },
      { index: 4, stage: "HOD", label: "Khalid Al Suwaidi", state: "PENDING" },
      { index: 5, stage: "HR_REVIEW", label: "HR Specialist (Aisha)", state: "PENDING" },
    ],
    budget: {
      applicable: true,
      currentReservation,
      changeAmount,
      lineAvailable,
      result: budgetResult,
      message: budgetMessage,
    },
    asksAddressed,
  };
}
