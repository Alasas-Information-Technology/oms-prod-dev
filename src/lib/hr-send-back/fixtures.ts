/**
 * HR Send Back Mock Fixtures
 *
 * CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER STRINGS.
 * 1 AED = 100 fils (e.g., AED 240,000.00 = 24000000 fils).
 */

import { HrSendBackOptionsResponse } from "@/src/types/hr-send-back";

/**
 * Fixture (a): OMS-2026-0139 — Full Case (Cycle 2)
 * Data Governance Specialist, requester Mariam Al Mansoori.
 * 5 selectable fields (including budgetAmount with financialImpact: true),
 * 4 suggested asks, 4-step reapproval route, reserved 24,000,000 fils,
 * 30-day deadline, cycle 2 with 1 prior thread entry.
 */
export const FIXTURE_HR_SEND_BACK_OMS_2026_0139: HrSendBackOptionsResponse = {
  requestId: "OMS-2026-0139",
  requestTitle: "Data Governance Specialist",
  requester: {
    userId: "usr-req-001",
    name: "Mariam Al Mansoori",
    role: "Data Management Lead",
    email: "mariam.almansoori@diez.ae",
    avatarUrl: "/avatars/mariam.jpg",
  },
  modes: [
    {
      code: "MORE_INFO",
      label: "Ask a question",
      consequence: "She answers. Nothing needs re-approval and the request stays with you.",
      requiresFieldSelection: false,
      showsRoute: false,
      showsBudget: false,
    },
    {
      code: "INFO_WITH_APPROVAL",
      label: "Ask for changes that need re-approval",
      consequence:
        "She updates the details, then it goes back through Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before returning to you.",
      requiresFieldSelection: true,
      showsRoute: true,
      showsBudget: true,
    },
    {
      code: "AMEND",
      label: "Ask her to amend the request",
      consequence: "She revises it. Full approval and budget checks repeat.",
      requiresFieldSelection: true,
      showsRoute: true,
      showsBudget: true,
    },
  ],
  selectableFields: [
    {
      key: "engagementEndDate",
      label: "Engagement end date",
      type: "DATE",
      currentValue: "2027-06-30",
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "duration",
      label: "Duration",
      type: "NUMBER",
      currentValue: 10,
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue:
        "Initial scope for corporate data governance setup across central administration departments.",
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "budgetAmount",
      label: "Budget amount",
      type: "MONEY",
      currentValue: 24000000, // AED 240,000.00
      financialImpact: true,
      warning: "Letting her change this could start a budget amendment.",
      selectable: true,
    },
    {
      key: "resourceCount",
      label: "Number of resources",
      type: "NUMBER",
      currentValue: 1,
      financialImpact: false,
      warning: null,
      selectable: true,
    },
  ],
  suggestedAsks: [
    { id: "sug-1", text: "Attach the job description", fieldKey: null },
    { id: "sug-2", text: "Clarify the business justification", fieldKey: "justification" },
    { id: "sug-3", text: "Update the engagement end date", fieldKey: "engagementEndDate" },
    { id: "sug-4", text: "Confirm the work location", fieldKey: null },
  ],
  reapprovalRoute: [
    {
      stage: "LINE_MANAGER",
      label: "Line Manager",
      user: {
        userId: "usr-mgr-010",
        name: "Omar Al Hashmi",
        role: "Head of Section",
      },
    },
    {
      stage: "HOD",
      label: "Head of Department",
      user: {
        userId: "usr-hod-005",
        name: "Fatima Al Marri",
        role: "Director of Digital Security",
      },
    },
    {
      stage: "BUDGET_OFFICER",
      label: "Budget Officer",
      user: {
        userId: "usr-fin-022",
        name: "Khalid Al Suwaidi",
        role: "Finance Officer",
      },
    },
    {
      stage: "HR_REVIEW",
      label: "HR Review",
      user: {
        userId: "usr-hr-042",
        name: "Aisha Al Nuaimi",
        role: "HR Specialist",
      },
    },
  ],
  budget: {
    reserved: 24000000,
    note: "Changing the budget amount would start an amendment.",
  },
  deadline: {
    daysAllowed: 30,
    closesAt: "2026-09-30T00:00:00Z",
    restartsOnSend: true,
  },
  thread: [
    {
      id: "thread-cycle-1",
      actor: {
        userId: "usr-hr-042",
        name: "Aisha Al Nuaimi",
        role: "HR Specialist",
        avatarUrl: "/avatars/aisha.jpg",
      },
      action: "CLARIFICATION_REQUESTED",
      message:
        "Please clarify the data-governance deliverables, update the engagement end date to align with the metadata milestone, and attach the approved project plan.",
      attachments: [
        {
          id: "att-0139-01",
          name: "Data_Governance_Requirements_v2.pdf",
          sizeBytes: 2457600,
          url: "https://storage.diez.ae/requests/Data_Governance_Requirements_v2.pdf",
          scanStatus: "VERIFIED",
        },
      ],
      at: "2026-08-01T10:00:00Z",
    },
  ],
  cycleNumber: 2,
  draft: null,
};

/**
 * Fixture (b): Cycle 1 — Empty Thread
 * Cycle 1 request where no prior clarification thread exists.
 * Used to verify the thread history panel is strictly omitted.
 */
export const FIXTURE_HR_SEND_BACK_CYCLE_1: HrSendBackOptionsResponse = {
  ...FIXTURE_HR_SEND_BACK_OMS_2026_0139,
  requestId: "OMS-2026-0140",
  requestTitle: "Senior AI Systems Architect",
  cycleNumber: 1,
  thread: [],
  draft: null,
};

/**
 * Fixture (c): Short Field List — 2 Selectable Fields
 * Used to verify the "short list" explanatory note:
 * "Fields that cannot be changed at this stage are absent, not disabled — with a
 * short note saying why if the list looks short."
 */
export const FIXTURE_HR_SEND_BACK_SHORT_FIELDS: HrSendBackOptionsResponse = {
  ...FIXTURE_HR_SEND_BACK_OMS_2026_0139,
  requestId: "OMS-2026-0141",
  requestTitle: "DevOps & Cloud Infrastructure Specialist",
  cycleNumber: 1,
  thread: [],
  selectableFields: [
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue: "Cloud migration and data warehouse modernization across DIEZ cloud infrastructure.",
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "engagementEndDate",
      label: "Engagement end date",
      type: "DATE",
      currentValue: "2027-03-31",
      financialImpact: false,
      warning: null,
      selectable: true,
    },
  ],
  draft: null,
};

/**
 * Fixture Registry for mock lookup
 */
export const MOCK_HR_SEND_BACK_FIXTURES: Record<string, HrSendBackOptionsResponse> = {
  "OMS-2026-0139": FIXTURE_HR_SEND_BACK_OMS_2026_0139,
  "OMS-2026-0140": FIXTURE_HR_SEND_BACK_CYCLE_1,
  "OMS-2026-0141": FIXTURE_HR_SEND_BACK_SHORT_FIELDS,
};
