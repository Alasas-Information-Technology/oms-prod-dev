import { getDb } from "@/lib/db";

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
            ON ut.UserTypeID = u.UserTypeID

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
}