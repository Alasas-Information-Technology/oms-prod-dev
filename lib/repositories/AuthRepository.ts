import { getDb } from "@/lib/db";
import {
    verifyPassword
} from "@/lib/utils/password";
import * as sql from "mssql";


export interface AuthUserRecord {
    userId: string;

    username: string;

    email: string;

    employeeId?: string;

    userType: string;

    roles: string[];

    permissions: string[];

    scopes: {
        scopeCode: string;

        organizationId?: string;

        businessUnitId?: string;

        departmentId?: string;

        sectionId?: string;
    }[];
}

export interface CreateLoginHistoryDto {
    userId?: string;

    username: string;

    ipAddress?: string;

    userAgent?: string;

    loginSessionId?: string;

    deviceType?: string;

    browserName?: string;

    isSSOLogin?: boolean;

    loginResult: "SUCCESS" | "FAILED";

    failureReason?: string;
}

export class AuthRepository {

    async getUserSessionData(
        userId: string
    ): Promise<AuthUserRecord | null> {

        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
        SELECT
            u.UserID,
            u.Username,
            u.Email,
            u.EmployeeID,

            ut.UserTypeCode,

            r.RoleCode,

            p.PermissionCode,

            sd.ScopeCode,

            uos.OrganizationID,
            uos.BusinessUnitID,
            uos.DepartmentID,
            uos.SectionID

        FROM auth.Users u

        LEFT JOIN auth.UserTypes ut
            ON ut.UserTypeCode = u.UserType

        LEFT JOIN auth.UserRoles ur
            ON ur.UserID = u.UserID

        LEFT JOIN auth.Roles r
            ON r.RoleID = ur.RoleID

        LEFT JOIN auth.RolePermissions rp
            ON rp.RoleID = r.RoleID

        LEFT JOIN auth.Permissions p
            ON p.PermissionID =
               rp.PermissionID

        LEFT JOIN auth.UserOrganizationScopes uos
            ON uos.UserID = u.UserID

        LEFT JOIN auth.ScopeDefinitions sd
            ON sd.ScopeDefinitionID =
               uos.ScopeDefinitionID

        WHERE u.UserID = @UserID
          AND u.IsActive = 1
      `);

        if (result.recordset.length === 0) {
            return null;
        }

        const firstRow = result.recordset[0];

        const roles = [
            ...new Set(
                result.recordset
                    .map(r => r.RoleCode)
                    .filter(Boolean)
            ),
        ];

        const permissions = [
            ...new Set(
                result.recordset
                    .map(r => r.PermissionCode)
                    .filter(Boolean)
            ),
        ];

        const scopesMap = new Map();

        for (const row of result.recordset) {

            const key = [
                row.ScopeCode,
                row.OrganizationID,
                row.BusinessUnitID,
                row.DepartmentID,
                row.SectionID,
            ].join("|");

            if (!scopesMap.has(key)) {

                scopesMap.set(key, {
                    scopeCode: row.ScopeCode,

                    organizationId:
                        row.OrganizationID,

                    businessUnitId:
                        row.BusinessUnitID,

                    departmentId:
                        row.DepartmentID,

                    sectionId:
                        row.SectionID,
                });
            }
        }

        return {
            userId: firstRow.UserID,

            username: firstRow.Username,

            email: firstRow.Email,

            employeeId: firstRow.EmployeeID,

            userType: firstRow.UserTypeCode,

            roles,

            permissions,

            scopes: Array.from(
                scopesMap.values()
            ),
        };
    }

    async getUserByUsername(
        username: string
    ): Promise<any | null> {

        const db = await getDb();

        const result = await db
            .request()
            .input("Username", username)
            .query(`
            SELECT TOP 1 *
            FROM auth.Users
            WHERE Username = @Username
            AND IsActive = 1
            AND IsDeleted = 0
        `);


        console.log("🚀 ~ AuthRepository ~ getUserByUsername ~ result:", result)

        return result.recordset[0] ?? null;
    }

    async createLoginHistory(
        data: CreateLoginHistoryDto
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", data.userId ?? null)
            .input("Username", data.username)
            .input("IPAddress", data.ipAddress ?? null)
            .input("UserAgent", data.userAgent ?? null)
            .input("LoginSessionID", data.loginSessionId ?? null)
            .input("DeviceType", data.deviceType ?? null)
            .input("BrowserName", data.browserName ?? null)
            .input("IsSSOLogin", data.isSSOLogin ?? false)
            .input("LoginResult", data.loginResult)
            .input("FailureReason", data.failureReason ?? null)
            .query(`
            INSERT INTO auth.LoginHistory
            (
                UserID,
                Username,
                IPAddress,
                UserAgent,
                LoginSessionID,
                DeviceType,
                BrowserName,
                IsSSOLogin,
                LoginResult,
                FailureReason
            )
            VALUES
            (
                @UserID,
                @Username,
                @IPAddress,
                @UserAgent,
                @LoginSessionID,
                @DeviceType,
                @BrowserName,
                @IsSSOLogin,
                @LoginResult,
                @FailureReason
            )
        `);
    }

    async createLogoutHistory(
        data: {
            loginSessionId: string;
            userId: string;
            username: string;
            ipAddress?: string;
            userAgent?: string;
            logoutReason?: string;
        }
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input(
                "LoginSessionID",
                data.loginSessionId
            )
            .input(
                "UserID",
                data.userId
            )
            .input(
                "Username",
                data.username
            )
            .input(
                "IPAddress",
                data.ipAddress ?? null
            )
            .input(
                "UserAgent",
                data.userAgent ?? null
            )
            .input(
                "LogoutReason",
                data.logoutReason ??
                "USER_LOGOUT"
            )
            .query(`
            INSERT INTO auth.LogoutHistory
            (
                LoginSessionID,
                UserID,
                Username,
                IPAddress,
                UserAgent,
                LogoutReason
            )
            VALUES
            (
                @LoginSessionID,
                @UserID,
                @Username,
                @IPAddress,
                @UserAgent,
                @LogoutReason
            )
        `);
    }

    // security 

    async getUserSecurityInfo(
        username: string
    ): Promise<{
        userId: string;
        failedLoginCount: number;
        lockedUntil: Date | null;
    } | null> {

        const db = await getDb();

        const result = await db
            .request()
            .input("Username", username)
            .query(`
            SELECT
                UserID,
                FailedLoginCount,
                LockedUntil
            FROM auth.Users
            WHERE Username = @Username
              AND IsDeleted = 0
        `);

        if (result.recordset.length === 0) {
            return null;
        }

        return {
            userId:
                result.recordset[0].UserID,

            failedLoginCount:
                result.recordset[0]
                    .FailedLoginCount ?? 0,

            lockedUntil:
                result.recordset[0]
                    .LockedUntil,
        };
    }
    async recordFailedLogin(
        userId: string
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", userId)
            .query(`
            UPDATE auth.Users
            SET
                FailedLoginCount =
                    ISNULL(
                        FailedLoginCount,
                        0
                    ) + 1,

                LastFailedLoginAt =
                    SYSUTCDATETIME(),

                UpdatedAt =
                    SYSUTCDATETIME()

            WHERE UserID = @UserID
        `);
    }
    async lockUser(
        userId: string,
        lockMinutes: number = 15
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", userId)
            .input("LockMinutes", lockMinutes)
            .query(`
            UPDATE auth.Users
            SET
                LockedUntil =
                    DATEADD(
                        MINUTE,
                        @LockMinutes,
                        SYSUTCDATETIME()
                    ),

                UpdatedAt =
                    SYSUTCDATETIME()

            WHERE UserID = @UserID
        `);
    }
    async resetFailedLogin(
        userId: string
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", userId)
            .query(`
            UPDATE auth.Users
            SET
                FailedLoginCount = 0,

                LockedUntil = NULL,

                LastFailedLoginAt = NULL,

                UpdatedAt =
                    SYSUTCDATETIME()

            WHERE UserID = @UserID
        `);
    }
    async getFailedLoginCount(
        userId: string
    ): Promise<number> {

        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
            SELECT
                FailedLoginCount
            FROM auth.Users
            WHERE UserID = @UserID
        `);

        if (
            result.recordset.length === 0
        ) {
            return 0;
        }

        return (
            result.recordset[0]
                .FailedLoginCount ?? 0
        );
    }
    async unlockUser(
        userId: string
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", userId)
            .query(`
            UPDATE auth.Users
            SET
                FailedLoginCount = 0,

                LockedUntil = NULL,

                UpdatedAt =
                    SYSUTCDATETIME()

            WHERE UserID = @UserID
        `);
    }
    async getUserCredential(
        userId: string
    ): Promise<{
        passwordHash: string;
    } | null> {

        const db = await getDb();

        const result = await db
            .request()
            .input(
                "UserID",
                userId
            )
            .query(`
            SELECT TOP 1
                PasswordHash
            FROM auth.LocalCredentials
            WHERE UserID = @UserID
            AND IsActive = 1
        `);

        if (
            result.recordset.length === 0
        ) {
            return null;
        }

        return {
            passwordHash:
                result.recordset[0]
                    .PasswordHash,
        };
    }
    async validatePassword(
        userId: string,
        password: string
    ): Promise<boolean> {

        const credential =
            await this.getUserCredential(
                userId
            );

        if (!credential) {
            return false;
        }

        return await verifyPassword(
            password,
            credential.passwordHash
        );
    }


    // Security Events

    async createFailedLoginAttempt(
        data: {
            userId?: string;
            username: string;
            ipAddress?: string;
            userAgent?: string;
            deviceType?: string;
            browserName?: string;
            isSSOLogin?: boolean;
            failureReason?: string;
        }
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input("UserID", data.userId ?? null)
            .input("Username", data.username)
            .input("IPAddress", data.ipAddress ?? null)
            .input("UserAgent", data.userAgent ?? null)
            .input("DeviceType", data.deviceType ?? null)
            .input("BrowserName", data.browserName ?? null)
            .input("IsSSOLogin", data.isSSOLogin ?? false)
            .input("FailureReason", data.failureReason ?? null)
            .query(`
            INSERT INTO auth.FailedLoginAttempts
            (
                UserID,
                Username,
                IPAddress,
                UserAgent,
                DeviceType,
                BrowserName,
                IsSSOLogin,
                FailureReason
            )
            VALUES
            (
                @UserID,
                @Username,
                @IPAddress,
                @UserAgent,
                @DeviceType,
                @BrowserName,
                @IsSSOLogin,
                @FailureReason
            )
        `);
    }

    async createSecurityEvent(
        data: {
            userId?: string;
            loginSessionId?: string;
            eventType: string;
            eventDescription?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()

            .input(
                "UserID",
                sql.UniqueIdentifier,
                data.userId ?? null
            )

            .input(
                "LoginSessionID",
                sql.UniqueIdentifier,
                data.loginSessionId ?? null
            )

            .input(
                "EventType",
                sql.NVarChar(100),
                data.eventType
            )

            .input(
                "EventDescription",
                sql.NVarChar(1000),
                data.eventDescription ?? null
            )

            .input(
                "IPAddress",
                sql.NVarChar(100),
                data.ipAddress ?? null
            )

            .input(
                "UserAgent",
                sql.NVarChar(sql.MAX),
                data.userAgent ?? null
            )

            .query(`
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
            @UserID,
            @LoginSessionID,
            @EventType,
            @EventDescription,
            @IPAddress,
            @UserAgent
        )
    `);
    }
}