export interface SecurityRepository {
    getSecurityEvents(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<SecurityEventDto[]>;

    getFailedLoginAttempts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<FailedLoginAttemptDto[]>;

    getLoginHistory(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<LoginHistoryDto[]>;

    getLogoutHistory(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<LogoutHistoryDto[]>;

    getSessionActivity(
        userId: string
    ): Promise<SessionActivityDto[]>;

    createSecurityEvent(
        event: CreateSecurityEventDto
    ): Promise<void>;

    getSecuritySummarybyId(
        userId: string
    ): Promise<SecuritySummaryDto>;

    getSecurityDashboard():
        Promise<SecurityDashboardDto>;
}

export interface SecurityEventDto {
    securityEventId: number;
    eventType: string;
    eventDescription: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export interface FailedLoginAttemptDto {
    failedLoginAttemptId: number;
    username: string;
    ipAddress: string | null;
    attemptedAt: Date;
    failureReason: string | null;
    userAgent: string | null;
    deviceType: string | null;
    browserName: string | null;
}

export interface LoginHistoryDto {
    loginHistoryId: number;
    username: string;
    ipAddress: string | null;
    userAgent: string | null;
    loginResult: string;
    loginAt: Date;
}

export interface LogoutHistoryDto {
    logoutHistoryId: number;
    loginSessionId: string;
    logoutAt: Date;
    logoutReason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
}

export interface SessionActivityDto {
    loginSessionId: string;
    loginAt: Date;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    deviceInfo: string | null;
    isActive: boolean;
}

export interface CreateSecurityEventDto {
    userId?: string | null;

    loginSessionId?: string | null;

    eventType: string;

    eventDescription?: string | null;

    ipAddress?: string | null;

    userAgent?: string | null;
}

export interface SecuritySummaryDto {
    activeSessions: number;

    failedLoginsLast30Days: number;

    successfulLoginsLast30Days: number;

    securityEventsLast30Days: number;

    lastLoginAt: Date | null;

    lastLogoutAt: Date | null;

    accountLocked: boolean;

    lockedUntil: Date | null;
}

export interface SecurityDashboardDto {
    activeSessions: number;

    lockedUsers: number;

    failedLogins24Hours: number;

    securityEvents24Hours: number;

    rateLimitEvents24Hours: number;

    activeUsersToday: number;

    successfulLogins24Hours: number;

    revokedSessions24Hours: number;

    refreshTokenReplayEvents24Hours: number;
}


export interface FailedLoginsChartDto {
    date: string;
    count: number;
}

export interface SecurityEventsByTypeDto {
    eventType: string;
    count: number;
}

export interface SessionsByDeviceDto {
    device: string;
    count: number;
}

export interface SessionsByRoleDto {
    role: string;
    count: number;
}

export interface LoginTrendDto {
    date: string;
    success: number;
    failure: number;
}

export interface ReplayEventsDto {
    date: string;
    count: number;
}

export interface LockedAccountsDto {
    username: string;
    lockouts: number;
}

export interface SessionsCreatedPerDayDto {
    date: string;
    count: number;
}