/**
 * Budget Control Center — TypeScript Types & DTO Definitions
 *
 * CRITICAL ARCHITECTURAL INVARIANT:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS.
 * 1 AED = 100 fils (e.g., AED 24,800,000.00 is stored and transported as 2480000000).
 */

export type FundState = "AVAILABLE" | "RESERVED" | "LOCKED" | "CONSUMED";

export type BudgetLineStatus = "ACTIVE" | "FROZEN" | "DEPLETED" | "CLOSED";

export type BudgetPeriodStatus = "OPEN" | "CLOSED" | "AMENDMENT_PENDING";

export type BudgetRequestType = "UNBUDGETED" | "TOP_UP" | "AMENDMENT" | "EXCEPTION";

export type BudgetRequestStatus = "APPROVED" | "AWAITING_APPROVAL" | "EXCEPTION" | "REJECTED";

export type FundMovementStepType =
  | "SUBMITTED_RESERVED"
  | "HOD_APPROVED_LOCKED"
  | "WORK_COMPLETED_CONSUMED"
  | "RELEASED"
  | "REJECTED_RELEASED";

export interface ApiPaginationMetaDto {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedBudgetResponse<T> {
  items: T[];
  meta: ApiPaginationMetaDto;
}

// =============================================================================
// 1. Budget Summary & KPIs (GET /api/v1/budget/summary)
// =============================================================================

export interface IFundStateBreakdownDto {
  /** Percentage of total (0 - 100) rounded to 1 decimal */
  availablePercent: number;
  /** Percentage of total (0 - 100) rounded to 1 decimal */
  reservedPercent: number;
  /** Percentage of total (0 - 100) rounded to 1 decimal */
  lockedPercent: number;
  /** Percentage of total (0 - 100) rounded to 1 decimal */
  consumedPercent: number;
}

export interface IPeriodComparativeDeltaDto {
  /** Delta change in total allocated budget in minor units (fils) */
  totalDeltaFils: number;
  /** Percentage change against previous period (e.g. +7.8%) */
  totalDeltaPercent: number;
  /** Delta change in available funds in minor units (fils) */
  availableDeltaFils?: number;
  /** Delta change in consumed funds in minor units (fils) */
  consumedDeltaFils?: number;
}

export interface IBudgetSummaryDto {
  periodId: string;
  periodCode: string;
  periodName: string;
  scopeLevel: "ORGANIZATION" | "BUSINESS_UNIT" | "DEPARTMENT";
  orgUnitId?: string;
  orgUnitName?: string;
  /** Total allocated budget in minor units (fils) */
  totalFils: number;
  /** Available uncommitted funds in minor units (fils) */
  availableFils: number;
  /** Reserved funds pending requisition approval in minor units (fils) */
  reservedFils: number;
  /** Locked and allocated funds following HOD sign-off in minor units (fils) */
  lockedFils: number;
  /** Consumed disbursed funds in minor units (fils) */
  consumedFils: number;
  /** Calculated percentage shares */
  breakdown: IFundStateBreakdownDto;
  /** Comparison against previous period */
  deltaAgainstPreviousPeriod?: IPeriodComparativeDeltaDto;
  /** Invariant verification: available + reserved + locked + consumed === total */
  isReconciled: boolean;
  /** ISO timestamp of last Oracle Financials sync */
  lastOracleSyncAt: string;
  /** ISO Currency code (default "AED") */
  currency: string;
}

export interface BudgetSummaryQueryDto {
  periodId?: string;
  orgUnitId?: string;
  businessUnitId?: string;
  departmentId?: string;
}

// =============================================================================
// 2. Budget Lines Table (GET /api/v1/budget/lines)
// =============================================================================

export interface IBudgetLineDto {
  id: string;
  code: string;
  name: string;
  periodId: string;
  departmentId: string;
  departmentName: string;
  businessUnitName?: string;
  /** Total baseline allocation in minor units (fils) */
  totalFils: number;
  /** Available uncommitted funds in minor units (fils) */
  availableFils: number;
  /** Reserved funds in minor units (fils) */
  reservedFils: number;
  /** Locked funds in minor units (fils) */
  lockedFils: number;
  /** Consumed funds in minor units (fils) */
  consumedFils: number;
  status: BudgetLineStatus;
  /** Invariant verification: available + reserved + locked + consumed === total */
  isReconciled: boolean;
  lastReconciledAt: string;
  activeRequisitionsCount: number;
}

export interface IBudgetLinesQueryDto {
  periodId?: string;
  orgUnitId?: string;
  businessUnitId?: string;
  departmentId?: string;
  search?: string;
  status?: BudgetLineStatus | "ALL";
  page?: number;
  limit?: number;
  sortBy?: "code" | "name" | "totalFils" | "availableFils" | "consumedFils";
  sortOrder?: "asc" | "desc";
}

export type IBudgetLinesResponseDto = PaginatedBudgetResponse<IBudgetLineDto>;

// =============================================================================
// 3. Fund State Movements (GET /api/v1/budget/lines/:id/movements)
// =============================================================================

export interface IFundMovementDto {
  id: string;
  stepNumber: number;
  stepType: FundMovementStepType;
  label: string;
  description: string;
  /** Transaction amount in minor units (fils) */
  amountFils: number;
  fromState: FundState;
  toState: FundState;
  requestId?: string;
  requestCode?: string;
  requisitionTitle?: string;
  actorName?: string | null;
  actorRole?: string | null;
  timestamp?: string | null;
  /** Whether this lifecycle stage has been reached and executed */
  isCompleted: boolean;
}

export interface IFundMovementsResponseDto {
  budgetLineId?: string;
  budgetLineCode?: string;
  budgetLineName?: string;
  /** True if movements are scoped to a selected line, false if department-wide */
  isLineSpecific: boolean;
  movements: IFundMovementDto[];
}

// =============================================================================
// 4. Period Governance & Approval (GET /api/v1/budget/periods/:id)
// =============================================================================

export interface IPeriodApprovalStepDto {
  level: number;
  role: string;
  roleDisplayName: string;
  approverName?: string;
  approverId?: string;
  approvedAt?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  comments?: string;
}

export interface IPeriodThreeLevelApprovalDto {
  isComplete: boolean;
  currentLevel: number;
  totalLevels: number;
  steps: IPeriodApprovalStepDto[];
}

export interface IBudgetPeriodDto {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: BudgetPeriodStatus;
  lastAmendedAt?: string;
  threeLevelApproval: IPeriodThreeLevelApprovalDto;
  reopenGovernanceRule: string;
  canAmend: boolean;
  canClose: boolean;
  canReopen: boolean;
}

// =============================================================================
// 5. Requests & Exceptions (GET /api/v1/budget/requests)
// =============================================================================

export interface IBudgetRequestsSummaryCountDto {
  unbudgetedCount: number;
  topUpCount: number;
  amendmentsCount: number;
  exceptionsCount: number;
}

export interface IBudgetRequestDto {
  id: string;
  requestCode: string;
  type: BudgetRequestType;
  typeLabel: string;
  description: string;
  /** Request amount in minor units (fils) */
  amountFils: number;
  status: BudgetRequestStatus;
  ownerName: string;
  departmentName: string;
  requestedOn: string;
  budgetLineCode?: string;
}

export interface IBudgetRequestsQueryDto {
  periodId?: string;
  orgUnitId?: string;
  departmentId?: string;
  type?: BudgetRequestType | "ALL";
  status?: BudgetRequestStatus | "ALL";
  page?: number;
  limit?: number;
}

export interface IBudgetRequestsResponseDto {
  summaryCounts: IBudgetRequestsSummaryCountDto;
  items: IBudgetRequestDto[];
  meta: ApiPaginationMetaDto;
}

// =============================================================================
// 6. Safeguards (GET /api/v1/budget/safeguards)
// =============================================================================

export interface ISafeguardItemDto {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "WARNING";
  isHealthy: boolean;
  lastReconciledAt?: string;
  syncBatchId?: string;
}

export interface IBudgetSafeguardsResponseDto {
  safeguards: ISafeguardItemDto[];
}
