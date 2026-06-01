import { getDb } from "@/lib/db";

export class SessionService {
    async validateSession(
        loginSessionId: string
    ): Promise<boolean> {
        const db = await getDb();

        const result = await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .query(`
        SELECT TOP 1
            LoginSessionID
        FROM auth.LoginSessions
        WHERE LoginSessionID = @LoginSessionID
        AND IsActive = 1
        AND RevokedAt IS NULL
        AND ExpiresAt > SYSUTCDATETIME()
      `);

        return result.recordset.length > 0;
    }

    async revokeSession(
        loginSessionId: string
    ): Promise<void> {
        const db = await getDb();

        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .query(`
        UPDATE auth.LoginSessions
        SET
            IsActive = 0,
            RevokedAt = SYSUTCDATETIME()
        WHERE LoginSessionID = @LoginSessionID
      `);
    }
}