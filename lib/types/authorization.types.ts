export interface AuthorizationRequest {
    userId: string;

    permission: string;

    workflowState?: string;

    departmentId?: string;

    businessUnitId?: string;
}

export interface AuthorizationResult {
    authorized: boolean;

    reason?: string;
}