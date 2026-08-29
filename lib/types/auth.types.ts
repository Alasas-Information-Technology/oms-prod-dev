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
    fullName?: string;
    phone?: string;
    location?: string;
    department?: string;
    employeeId?: string;
    avatarUrl?: string;
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