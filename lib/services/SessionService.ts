import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

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

    async createSession(
        userId: string
    ): Promise<string> {

        const db = await getDb();

        const loginSessionId = uuidv4();

        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .input("UserID", userId)
            .query(`
            INSERT INTO auth.LoginSessions
            (
                LoginSessionID,
                UserID,
                IsActive,
                LoginAt,
                ExpiresAt
            )
            VALUES
            (
                @LoginSessionID,
                @UserID,
                1,
                SYSUTCDATETIME(),
                DATEADD(DAY,1,SYSUTCDATETIME())
            )
        `);

        return loginSessionId;
    }

}


