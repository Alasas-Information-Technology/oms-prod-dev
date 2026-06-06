export interface UserScope {
    scopeCode: string;

    organizationId?: string;
    businessUnitId?: string;
    departmentId?: string;
    sectionId?: string;
}

export interface UserSession {
    userId: string;

    username: string;

    email: string;

    userType: string;

    roles: string[];

    permissions: string[];

    scopes: UserScope[];

    loginSessionId: string;
}

export interface User {
    userId: string;

    username: string;

    email: string;

    employeeId?: string;

    isActive: boolean;
}

export interface JwtPayload {
    userId: string;

    loginSessionId: string;
}