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
        userId: string,
        ipAddress?: string,
        userAgent?: string,
        browserName?: string,
        deviceType?: string

    ): Promise<string> {

        const db = await getDb();

        const loginSessionId = uuidv4();

        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .input("UserID", userId)
            .input("IPAddress", ipAddress)
            .input("UserAgent", userAgent)
            .input("BrowserName", browserName)
            .input("DeviceType", deviceType)
            .query(`
            INSERT INTO auth.LoginSessions
            (
                LoginSessionID,
                UserID,
                IsActive,
                LoginAt,
                ExpiresAt,

                IPAddress,
                UserAgent,
                BrowserName,
                DeviceType,
                LastActivityAt
            )
            VALUES
            (
                @LoginSessionID,
                @UserID,
                1,
                SYSUTCDATETIME(),
                DATEADD(DAY,1,SYSUTCDATETIME()),

                @IPAddress,
                @UserAgent,
                @BrowserName,
                @DeviceType,
                SYSUTCDATETIME()
            )
        `);

        return loginSessionId;
    }

    async updateRefreshToken(
        loginSessionId: string,
        refreshTokenHash: string
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input(
                "LoginSessionID",
                loginSessionId
            )
            .input(
                "RefreshTokenHash",
                refreshTokenHash
            )
            .query(`
            UPDATE auth.LoginSessions
            SET
                RefreshTokenHash =
                    @RefreshTokenHash,

                RefreshTokenExpiresAt =
                    DATEADD(
                        DAY,
                        7,
                        SYSUTCDATETIME()
                    )
            WHERE LoginSessionID =
                @LoginSessionID
        `);
    }

}


