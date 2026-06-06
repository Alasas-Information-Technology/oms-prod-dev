import { getDb } from "@/lib/db";

export class PermissionRepository {
    async getPermissions(userId: string) {
        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
        ;WITH RoleTree AS
        (
            SELECT RoleID
            FROM auth.UserRoles
            WHERE UserID = @UserID

            UNION ALL

            SELECT rh.ParentRoleID
            FROM auth.RoleHierarchy rh
            INNER JOIN RoleTree rt
                ON rt.RoleID = rh.ChildRoleID
        )

        SELECT DISTINCT
            p.PermissionCode
        FROM RoleTree rt

        INNER JOIN auth.RolePermissions rp
            ON rp.RoleID = rt.RoleID

        INNER JOIN auth.Permissions p
            ON p.PermissionID = rp.PermissionID
      `);

        return result.recordset.map(
            (r) => r.PermissionCode
        );
    }
}