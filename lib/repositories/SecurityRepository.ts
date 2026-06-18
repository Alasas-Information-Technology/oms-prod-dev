import { getDb } from "../db";
import { CreateSecurityEventDto, FailedLoginAttemptDto, FailedLoginsChartDto, LoginHistoryDto, LogoutHistoryDto, SecurityDashboardDto, SecurityEventDto, SecurityEventsByTypeDto, SecuritySummaryDto, SessionActivityDto, SessionsByDeviceDto, SessionsByRoleDto, LoginTrendDto, ReplayEventsDto, LockedAccountsDto, SessionsCreatedPerDayDto } from "../types/security.types";

export class SecurityRepository {


    async getSecurityEvents(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<SecurityEventDto[]> {

        const db = await getDb();


        const offset =
            (page - 1) * pageSize;

        const query = `
            SELECT
                SecurityEventID,
                EventType,
                EventDescription,
                IPAddress,
                UserAgent,
                CreatedAt
            FROM auth.SecurityEvents
            WHERE UserID = @userId
            ORDER BY CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        const result =
            await db.request()
                .input("userId", userId)
                .input("offset", offset)
                .input("pageSize", pageSize)
                .query(query);

        return result.recordset;
    }

    async getFailedLoginAttempts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<FailedLoginAttemptDto[]> {

        const db = await getDb();

        const offset =
            (page - 1) * pageSize;

        const query = `
            SELECT
                f.*
            FROM auth.FailedLoginAttempts f
            INNER JOIN auth.Users u
                ON u.UserID = f.UserID
            WHERE u.UserID = @userId
            ORDER BY AttemptedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        const result =
            await db.request()
                .input("userId", userId)
                .input("offset", offset)
                .input("pageSize", pageSize)
                .query(query);

        return result.recordset;
    }

    async getLoginHistory(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<LoginHistoryDto[]> {

        const db = await getDb();

        const offset =
            (page - 1) * pageSize;

        const query = `
            SELECT
                LoginHistoryID,
                Username,
                IPAddress,
                UserAgent,
                LoginResult,
                LoginAt
            FROM auth.LoginHistory
            WHERE UserID = @userId
            ORDER BY LoginAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        const result =
            await db.request()
                .input("userId", userId)
                .input("offset", offset)
                .input("pageSize", pageSize)
                .query(query);


        return result.recordset;
    }

    async getLogoutHistory(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<LogoutHistoryDto[]> {

        const db = await getDb();

        const offset =
            (page - 1) * pageSize;

        const query = `
            SELECT
                LogoutHistoryID,
                LoginSessionID,
                LogoutAt,
                LogoutReason,
                IPAddress,
                UserAgent
            FROM auth.LogoutHistory
            WHERE UserID = @userId
            ORDER BY LogoutAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        const result =
            await db.request()
                .input("userId", userId)
                .input("offset", offset)
                .input("pageSize", pageSize)
                .query(query);


        return result.recordset;
    }

    async getSessionActivity(
        userId: string
    ): Promise<SessionActivityDto[]> {

        const db = await getDb();

        const query = `
            SELECT
                LoginSessionID,
                LoginAt,
                ExpiresAt,
                IPAddress,
                UserAgent,
                DeviceInfo,
                IsActive
            FROM auth.LoginSessions
            WHERE UserID = @userId
            ORDER BY LoginAt DESC
        `;

        const result =
            await db.request()
                .input("userId", userId)
                .query(query);

        return result.recordset;
    }

    async createSecurityEvent(
        event: CreateSecurityEventDto
    ): Promise<void> {

        const db = await getDb();

        const query = `
            INSERT INTO auth.SecurityEvents
            (
                UserID,
                LoginSessionID,
                EventType,
                EventDescription,
                IPAddress,
                UserAgent
            )
            VALUES
            (
                @userId,
                @loginSessionId,
                @eventType,
                @eventDescription,
                @ipAddress,
                @userAgent
            )
        `;

        await db.request()
            .input("userId", event.userId)
            .input("loginSessionId", event.loginSessionId)
            .input("eventType", event.eventType)
            .input("eventDescription", event.eventDescription)
            .input("ipAddress", event.ipAddress)
            .input("userAgent", event.userAgent)
            .query(query);
    }


    async getSecuritySummarybyId(
        userId: string
    ): Promise<SecuritySummaryDto> {

        const db = await getDb();

        const query = `
        SELECT

            (
                SELECT COUNT(*)
                FROM auth.LoginSessions
                WHERE UserID = @userId
                AND IsActive = 1
                AND RevokedAt IS NULL
            ) AS ActiveSessions,

            (
                SELECT COUNT(*)
                FROM auth.FailedLoginAttempts
                WHERE UserID = @userId
                AND AttemptedAt >= DATEADD(DAY,-30,SYSUTCDATETIME())
            ) AS FailedLoginsLast30Days,

            (
                SELECT COUNT(*)
                FROM auth.LoginHistory
                WHERE UserID = @userId
                AND LoginResult = 'SUCCESS'
                AND LoginAt >= DATEADD(DAY,-30,SYSUTCDATETIME())
            ) AS SuccessfulLoginsLast30Days,

            (
                SELECT COUNT(*)
                FROM auth.SecurityEvents
                WHERE UserID = @userId
                AND CreatedAt >= DATEADD(DAY,-30,SYSUTCDATETIME())
            ) AS SecurityEventsLast30Days,

            (
                SELECT TOP 1 LoginAt
                FROM auth.LoginHistory
                WHERE UserID = @userId
                AND LoginResult = 'SUCCESS'
                ORDER BY LoginAt DESC
            ) AS LastLoginAt,

            (
                SELECT TOP 1 LogoutAt
                FROM auth.LogoutHistory
                WHERE UserID = @userId
                ORDER BY LogoutAt DESC
            ) AS LastLogoutAt,

            u.LockedUntil,

            CASE
                WHEN u.LockedUntil IS NOT NULL
                 AND u.LockedUntil > SYSUTCDATETIME()
                THEN CAST(1 AS BIT)
                ELSE CAST(0 AS BIT)
            END AS AccountLocked

        FROM auth.Users u
        WHERE u.UserID = @userId
    `;

        const result =
            await db.request()
                .input(
                    "userId",
                    userId
                )
                .query(query);

        const row =
            result.recordset[0];

        return {
            activeSessions:
                row.ActiveSessions,

            failedLoginsLast30Days:
                row.FailedLoginsLast30Days,

            successfulLoginsLast30Days:
                row.SuccessfulLoginsLast30Days,

            securityEventsLast30Days:
                row.SecurityEventsLast30Days,

            lastLoginAt:
                row.LastLoginAt,

            lastLogoutAt:
                row.LastLogoutAt,

            accountLocked:
                row.AccountLocked,

            lockedUntil:
                row.LockedUntil,
        };
    }


    async getDashboardSummary(): Promise<SecurityDashboardDto> {

        const db = await getDb();

        const query = `
        SELECT

            (
                SELECT COUNT(*)
                FROM auth.LoginSessions
                WHERE IsActive = 1
                AND RevokedAt IS NULL
            ) AS ActiveSessions,

            (
                SELECT COUNT(*)
                FROM auth.Users
                WHERE LockedUntil IS NOT NULL
                AND LockedUntil > SYSUTCDATETIME()
            ) AS LockedUsers,

            (
                SELECT COUNT(*)
                FROM auth.FailedLoginAttempts
                WHERE AttemptedAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS FailedLogins24Hours,

            (
                SELECT COUNT(*)
                FROM auth.LoginHistory
                WHERE LoginResult = 'SUCCESS'
                AND LoginAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS SuccessfulLogins24Hours,

            (
                SELECT COUNT(*)
                FROM auth.SecurityEvents
                WHERE CreatedAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS SecurityEvents24Hours,

            (
                SELECT COUNT(*)
                FROM auth.RateLimitEvents
                WHERE CreatedAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS RateLimitEvents24Hours,

            (
                SELECT COUNT(DISTINCT UserID)
                FROM auth.LoginHistory
                WHERE LoginResult = 'SUCCESS'
                AND LoginAt >= DATEADD(DAY,-1,SYSUTCDATETIME())
            ) AS ActiveUsersToday,

            (
                SELECT COUNT(*)
                FROM auth.LoginSessions
                WHERE RevokedAt IS NOT NULL
                AND RevokedAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS RevokedSessions24Hours,

            (
                SELECT COUNT(*)
                FROM auth.SecurityEvents
                WHERE EventType = 'REFRESH_TOKEN_REPLAY'
                AND CreatedAt >= DATEADD(HOUR,-24,SYSUTCDATETIME())
            ) AS RefreshTokenReplayEvents24Hours
    `;

        const result =
            await db.request()
                .query(query);

        const row =
            result.recordset[0];

        return {
            activeSessions:
                row.ActiveSessions ?? 0,

            lockedUsers:
                row.LockedUsers ?? 0,

            failedLogins24Hours:
                row.FailedLogins24Hours ?? 0,

            successfulLogins24Hours:
                row.SuccessfulLogins24Hours ?? 0,

            securityEvents24Hours:
                row.SecurityEvents24Hours ?? 0,

            rateLimitEvents24Hours:
                row.RateLimitEvents24Hours ?? 0,

            activeUsersToday:
                row.ActiveUsersToday ?? 0,

            revokedSessions24Hours:
                row.RevokedSessions24Hours ?? 0,

            refreshTokenReplayEvents24Hours:
                row.RefreshTokenReplayEvents24Hours ?? 0,
        };
    }

    async getActiveSessionsDashboard() {

        const db =
            await getDb();

        const result =
            await db.request()
                .query(`
                SELECT
                    ls.LoginSessionID,
                    ls.UserID,
                    u.Username,
                    ls.IPAddress,
                    ls.DeviceInfo,
                    ls.BrowserName,
                    ls.DeviceType,
                    ls.LastActivityAt,
                    ls.LoginAt,
                    ls.ExpiresAt
                FROM auth.LoginSessions ls
                INNER JOIN auth.Users u
                    ON u.UserID = ls.UserID
                WHERE ls.IsActive = 1
                AND ls.RevokedAt IS NULL
                ORDER BY ls.LoginAt DESC
            `);

        return result.recordset;
    }

    async getRecentSecurityEvents(
        page: number = 1,
        pageSize: number = 25
    ) {

        const db = await getDb();

        const offset =
            (page - 1) * pageSize;

        const query = `
        SELECT
            TOP (@pageSize)
            SecurityEventID,
            UserID,
            LoginSessionID,
            EventType,
            EventDescription,
            IPAddress,
            UserAgent,
            CreatedAt
        FROM auth.SecurityEvents
        ORDER BY CreatedAt DESC
    `;

        const result =
            await db.request()
                .input("pageSize", pageSize)
                .query(query);

        return result.recordset;
    }

    async getRecentFailedLogins(
        page: number = 1,
        pageSize: number = 25
    ) {

        const db = await getDb();

        const query = `
        SELECT TOP (@pageSize)

            FailedLoginAttemptID,
            Username,
            IPAddress,
            FailureReason,
            AttemptedAt,
            BrowserName,
            DeviceType

        FROM auth.FailedLoginAttempts

        ORDER BY AttemptedAt DESC
    `;

        const result =
            await db.request()
                .input("pageSize", pageSize)
                .query(query);

        return result.recordset;
    }


    async failedLoginChartData(): Promise<FailedLoginsChartDto[]> {

        const db =
            await getDb();

        const result =
            await db.request()
                .query(`
                    SELECT
                        CAST(AttemptedAt AS DATE) AS [Date],
                        COUNT(*) AS Total
                    FROM auth.FailedLoginAttempts
                    WHERE AttemptedAt >= DATEADD(DAY,-30,SYSUTCDATETIME())
                    GROUP BY CAST(AttemptedAt AS DATE)
                    ORDER BY [Date]
            `);

        return result.recordset.map((row) => ({
            date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date),
            count: Number(row.Total)
        }));
    }


    async securityEventsByTypeChartData(): Promise<SecurityEventsByTypeDto[]> {

        const db =
            await getDb();

        const result =
            await db.request()
                .query(`
                    SELECT
                        EventType,
                        COUNT(*) AS Total
                    FROM auth.SecurityEvents
                    GROUP BY EventType
                    ORDER BY Total DESC
            `);

        return result.recordset.map((row) => ({
            eventType: row.EventType,
            count: Number(row.Total)
        }));
    }

    async sessionsByDeviceChartData(): Promise<SessionsByDeviceDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                DeviceInfo,
                COUNT(*) AS Total
            FROM auth.LoginSessions
            WHERE IsActive=1
            AND RevokedAt IS NULL
            GROUP BY DeviceInfo
        `);
        return result.recordset.map((row) => ({
            device: row.DeviceInfo || "Unknown",
            count: Number(row.Total)
        }));
    }

    async sessionsByRoleChartData(): Promise<SessionsByRoleDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                r.RoleCode,
                COUNT(DISTINCT ls.LoginSessionID) AS Total
            FROM auth.LoginSessions ls
            INNER JOIN auth.UserRoles ur
                ON ur.UserID = ls.UserID
            INNER JOIN auth.Roles r
                ON r.RoleID = ur.RoleID
            WHERE ls.IsActive = 1
            AND ls.RevokedAt IS NULL
            GROUP BY r.RoleCode
            ORDER BY Total DESC
        `);
        return result.recordset.map((row) => ({
            role: row.RoleCode,
            count: Number(row.Total)
        }));
    }

    async loginTrendChartData(): Promise<LoginTrendDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                CAST(LoginAt AS DATE) AS [Date],
                SUM(
                    CASE
                        WHEN LoginResult='SUCCESS'
                        THEN 1
                        ELSE 0
                    END
                ) AS Successes,
                SUM(
                    CASE
                        WHEN LoginResult<>'SUCCESS'
                        THEN 1
                        ELSE 0
                    END
                ) AS Failures
            FROM auth.LoginHistory
            GROUP BY CAST(LoginAt AS DATE)
            ORDER BY [Date]
        `);
        return result.recordset.map((row) => ({
            date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date),
            success: Number(row.Successes),
            failure: Number(row.Failures)
        }));
    }

    async replayEventsChartData(): Promise<ReplayEventsDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                CAST(CreatedAt AS DATE) AS [Date],
                COUNT(*) AS Total
            FROM auth.SecurityEvents
            WHERE EventType='REFRESH_TOKEN_REPLAY'
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY [Date]
        `);
        return result.recordset.map((row) => ({
            date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date),
            count: Number(row.Total)
        }));
    }

    async lockedAccountsChartData(): Promise<LockedAccountsDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                Username,
                FailedLoginCount
            FROM auth.Users
            WHERE LockedUntil > SYSUTCDATETIME()
            ORDER BY FailedLoginCount DESC
        `);
        return result.recordset.map((row) => ({
            username: row.Username,
            lockouts: Number(row.FailedLoginCount)
        }));
    }

    async sessionsCreatedPerDayChartData(): Promise<SessionsCreatedPerDayDto[]> {
        const db = await getDb();
        const result = await db.request().query(`
            SELECT
                CAST(LoginAt AS DATE) AS [Date],
                COUNT(*) AS Total
            FROM auth.LoginSessions
            GROUP BY CAST(LoginAt AS DATE)
            ORDER BY [Date]
        `);
        return result.recordset.map((row) => ({
            date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date),
            count: Number(row.Total)
        }));
    }
}