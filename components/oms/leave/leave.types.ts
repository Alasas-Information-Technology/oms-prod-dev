export type LeaveTypeId = "annual" | "sick" | "comp-off" | "unpaid";
export type LeaveRequestStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "withdrawn";

export interface LeaveBalance {
  id: LeaveTypeId;
  label: string;
  entitlementLabel: string;
  entitled?: number;
  used?: number;
  pending?: number;
  remaining?: number;
  approvalOnly?: boolean;
}

export interface LeaveRequestRecord {
  id: string;
  typeId: LeaveTypeId;
  typeLabel: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  paid: boolean;
  status: LeaveRequestStatus;
  approver: string;
  requestedAt: Date;
  reason: string;
}

export interface LeaveApprovalStep {
  id: string;
  label: string;
  description: string;
  state: "complete" | "current" | "upcoming";
}

export interface LeaveEntitlementRule {
  id: string;
  label: string;
}

export interface LeaveRequestSubmission {
  typeId: LeaveTypeId;
  startDate: Date;
  endDate: Date;
  duration: number;
  halfDay: boolean;
  reason: string;
  attachmentName?: string;
}
