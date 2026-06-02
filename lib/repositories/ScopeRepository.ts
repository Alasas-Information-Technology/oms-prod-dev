import { getDb } from "@/lib/db";

export class ScopeRepository {
    async getScopes(userId: string) {
        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .query(`
        SELECT
            sd.ScopeCode,

            uos.OrganizationID,
            uos.BusinessUnitID,
            uos.DepartmentID,
            uos.SectionID

        FROM auth.UserOrganizationScopes uos

        INNER JOIN auth.ScopeDefinitions sd
            ON sd.ScopeDefinitionID =
               uos.ScopeDefinitionID

        WHERE uos.UserID = @UserID
      `);

        return result.recordset;
    }
}