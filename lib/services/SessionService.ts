import { SECURITY } from "@/lib/constants/security";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { SecurityEventService } from "./SecurityEventService";
import { SECURITY_EVENTS } from "../constants/securityEvents";


export class SessionService {

    private securityEventService =
        new SecurityEventService();



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

        await this.securityEventService.log(
            SECURITY_EVENTS.SESSION_REVOKED,
            {
                description:
                    "User Session Revoked",

                loginSessionId
            }
        );
    }

    /**
     * Revokes both the session AND the refresh token in a single atomic operation.
     * Used when replay attacks are detected to immediately invalidate everything.
     */
    async revokeSessionFull(
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
                RevokedAt = SYSUTCDATETIME(),
                RefreshTokenRevokedAt = SYSUTCDATETIME()
            WHERE LoginSessionID = @LoginSessionID
        `);
    }

    async createSession(
        userId: string,
        ipAddress?: string,
        userAgent?: string,
        browserName?: string,
        deviceType?: string,
        deviceFingerprint?: string

    ): Promise<string> {

        const db = await getDb();

        const loginSessionId = uuidv4();
        const fingerprint =
            `${browserName}|${deviceType}`;

        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .input("UserID", userId)
            .input("IPAddress", ipAddress)
            .input("UserAgent", userAgent)
            .input("BrowserName", browserName)
            .input("DeviceType", deviceType)
            .input("SessionExpiryDays", SECURITY.SESSION_EXPIRY_DAYS)
            .input("Fingerprint", fingerprint)
            .input("DeviceFingerprint", deviceFingerprint)
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
                LastActivityAt,
                Fingerprint,
                DeviceFingerprint
            )
            VALUES
            (
                @LoginSessionID,
                @UserID,
                1,
                SYSUTCDATETIME(),
                DATEADD(DAY, @SessionExpiryDays, SYSUTCDATETIME()),

                @IPAddress,
                @UserAgent,
                @BrowserName,
                @DeviceType,
                SYSUTCDATETIME(),
                @Fingerprint,
                @DeviceFingerprint
            )
        `);

        await this.securityEventService.log(
            SECURITY_EVENTS.SESSION_CREATED,
            {
                userId,
                description:
                    "User Session Created",

                loginSessionId,

                ipAddress,

                userAgent,
            }
        );


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
            .input(
                "RefreshTokenDays",
                SECURITY.REFRESH_TOKEN_DAYS
            )
            .query(`
            UPDATE auth.LoginSessions
            SET
                RefreshTokenHash =
                    @RefreshTokenHash,

                RefreshTokenExpiresAt =
                    DATEADD(
                        DAY,
                        @RefreshTokenDays,
                        SYSUTCDATETIME()
                    ),

                RefreshTokenRevokedAt = NULL
            WHERE LoginSessionID =
                @LoginSessionID
        `);
    }

    /**
     * Find a session by refresh token hash WITHOUT filtering on revocation status.
     * This is critical for replay detection: if we find a match where
     * RefreshTokenRevokedAt IS NOT NULL, it means a previously-rotated token
     * is being reused — a replay attack.
     */
    async findSessionByRefreshTokenHash(
        refreshTokenHash: string
    ) {

        const db = await getDb();

        const result =
            await db
                .request()
                .input(
                    "RefreshTokenHash",
                    refreshTokenHash
                )
                .query(`
                SELECT TOP 1
                    LoginSessionID,
                    UserID,
                    IsActive,
                    ExpiresAt,
                    RevokedAt,
                    RefreshTokenHash,
                    RefreshTokenExpiresAt,
                    RefreshTokenRevokedAt,
                    IPAddress,
                    UserAgent,
                    BrowserName,
                    DeviceType,
                    LastActivityAt
                FROM auth.LoginSessions
                WHERE RefreshTokenHash =
                    @RefreshTokenHash
            `);

        return result.recordset[0] ?? null;
    }

    /**
     * @deprecated Use findSessionByRefreshTokenHash() instead for replay-safe lookups.
     */
    async getSessionByRefreshToken(
        refreshTokenHash: string
    ) {

        const db = await getDb();

        const result =
            await db
                .request()
                .input(
                    "RefreshTokenHash",
                    refreshTokenHash
                )
                .query(`
                SELECT TOP 1 *
                FROM auth.LoginSessions
                WHERE RefreshTokenHash =
                    @RefreshTokenHash
                AND IsActive = 1
                AND RefreshTokenRevokedAt IS NULL
                AND RefreshTokenExpiresAt >
                    SYSUTCDATETIME()
            `);

        return result.recordset[0];
    }

    async rotateRefreshToken(
        loginSessionId: string,
        refreshTokenHash: string,
        ipAddress?: string,
        userAgent?: string
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
            .input(
                "RefreshTokenDays",
                SECURITY.REFRESH_TOKEN_DAYS
            )
            .query(`
            UPDATE auth.LoginSessions
            SET
                RefreshTokenHash =
                    @RefreshTokenHash,

                RefreshTokenExpiresAt =
                    DATEADD(
                        DAY,
                        @RefreshTokenDays,
                        SYSUTCDATETIME()
                    )

            WHERE LoginSessionID =
                @LoginSessionID
        `);

        await this.securityEventService.log(
            SECURITY_EVENTS.REFRESH_TOKEN_ROTATED,
            {
                description:
                    "Refresh Token Rotated",

                loginSessionId,

                ipAddress,

                userAgent,
            }
        );
    }

    async updateLastActivity(
        loginSessionId: string
    ): Promise<void> {
        const db = await getDb();
        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .query(`
            UPDATE auth.LoginSessions
            SET
                LastActivityAt = SYSUTCDATETIME()
            WHERE LoginSessionID = @LoginSessionID
        `);

    }

    async revokeRefreshToken(
        loginSessionId: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<void> {
        const db = await getDb();
        await db
            .request()
            .input("LoginSessionID", loginSessionId)
            .query(`
            UPDATE auth.LoginSessions
            SET
                RefreshTokenRevokedAt = SYSUTCDATETIME()
            WHERE LoginSessionID = @LoginSessionID
        `);
        await this.securityEventService.log(
            SECURITY_EVENTS.REFRESH_TOKEN_REVOKED,
            {
                description:
                    "Refresh Token Revoked",

                loginSessionId,

                ipAddress,

                userAgent,
            }
        );
    }

    async getSessionById(
        loginSessionId: string
    ) {

        const db =
            await getDb();

        const result =
            await db.request()
                .input(
                    "LoginSessionID",
                    loginSessionId
                )
                .query(`
                SELECT
                    LoginSessionID,
                    UserID,
                    IsActive
                FROM auth.LoginSessions
                WHERE LoginSessionID =
                    @LoginSessionID
            `);

        return (
            result.recordset[0] ??
            null
        );
    }

    async revokeAllOtherSessions(
        userId: string,
        currentSessionId: string
    ): Promise<void> {

        const db =
            await getDb();

        await db.request()
            .input(
                "UserID",
                userId
            )
            .input(
                "CurrentSessionID",
                currentSessionId
            )
            .query(`
            UPDATE
                auth.LoginSessions
            SET
                IsActive = 0,
                RevokedAt =
                    SYSUTCDATETIME()
            WHERE
                UserID = @UserID
            AND
                LoginSessionID <>
                @CurrentSessionID
            AND
                IsActive = 1
        `);
    }

}
