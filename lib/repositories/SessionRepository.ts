import { getDb } from "@/lib/db";

export class SessionRepository {

    async getUserSessions(
        userId: string
    ) {

        const db = await getDb();

        const result =
            await db.request()
                .input(
                    "UserID",
                    userId
                )
                .query(`
                    SELECT
                        LoginSessionID,
                        IPAddress,
                        BrowserName,
                        DeviceType,
                        LoginAt,
                        LastActivityAt,
                        ExpiresAt,
                        IsActive
                    FROM auth.LoginSessions
                    WHERE UserID = @UserID
                    AND IsActive = 1
                    ORDER BY
                        LastActivityAt DESC
                `);

        return result.recordset;
    }


}