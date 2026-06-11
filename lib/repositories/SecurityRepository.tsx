import sql from "mssql";
import { getDb } from "@/lib/db";

export class SecurityRepository {


    async getSecuritySummary() {

        const db = await getDb();

        const result =
            await db
                .request()
                .query(`
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM auth.LoginSessions
                        WHERE IsRevoked = 0
                    ) AS ActiveSessions,

                    (
                        SELECT COUNT(*)
                        FROM auth.FailedLoginAttempts
                        WHERE CAST(
                            AttemptedAt AS DATE
                        ) = CAST(
                            GETUTCDATE() AS DATE
                        )
                    ) AS FailedLoginsToday,

                    (
                        SELECT COUNT(*)
                        FROM auth.UserSecurity
                        WHERE LockedUntil > GETUTCDATE()
                    ) AS LockedAccounts,

                    (
                        SELECT COUNT(*)
                        FROM auth.SecurityEvents
                        WHERE CAST(
                            CreatedAt AS DATE
                        ) = CAST(
                            GETUTCDATE() AS DATE
                        )
                    ) AS SecurityEventsToday
            `);

        return result.recordset[0];
    }

    async getRecentSecurityEvents(
        page: number,
        pageSize: number
    ) {

        const offset =
            (page - 1) * pageSize;

        const db =
            await getDb();

        const result =
            await db.request()
                .input(
                    "Offset",
                    sql.Int,
                    offset
                )
                .input(
                    "PageSize",
                    sql.Int,
                    pageSize
                )
                .query(`
                SELECT
                    SecurityEventID,
                    EventType,
                    EventDescription,
                    UserID,
                    LoginSessionID,
                    CreatedAt
                FROM auth.SecurityEvents
                ORDER BY CreatedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY
            `);

        return result.recordset;
    }

    async getFailedLogins(
        page: number,
        pageSize: number
    ) {

        const offset =
            (page - 1) * pageSize;

        const db =
            await getDb();

        const result =
            await db.request()
                .input(
                    "Offset",
                    sql.Int,
                    offset
                )
                .input(
                    "PageSize",
                    sql.Int,
                    pageSize
                )
                .query(`
                SELECT
                    FailedLoginAttemptID,
                    Username,
                    IPAddress,
                    FailureReason,
                    AttemptedAt
                FROM auth.FailedLoginAttempts
                ORDER BY AttemptedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY
            `);

        return result.recordset;
    }

}