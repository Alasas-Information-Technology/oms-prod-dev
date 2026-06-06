import { getDb } from "@/lib/db";

export class UserRepository {

    async findById(userId: string) {
        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
        SELECT
            UserID,
            Username,
            Email,
            EmployeeID,
            IsActive
        FROM auth.Users
        WHERE UserID = @UserID
      `);

        return result.recordset[0];
    }

    async findByEmail(email: string) {
        const db = await getDb();

        const result = await db
            .request()
            .input("Email", email)
            .query(`
        SELECT *
        FROM auth.Users
        WHERE Email = @Email
      `);

        return result.recordset[0];
    }

    async getUserRoles(userId: string) {
        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
        SELECT
            r.RoleCode
        FROM auth.UserRoles ur
        INNER JOIN auth.Roles r
            ON r.RoleID = ur.RoleID
        WHERE ur.UserID = @UserID
      `);

        return result.recordset.map(
            (r) => r.RoleCode
        );
    }
}