import { getDb } from "@/lib/db";

export class WorkflowRepository {

    async canExecute(
        userId: string,
        workflowState: string,
        permission: string
    ) {
        const db = await getDb();

        const result = await db
            .request()
            .input("UserID", userId)
            .input("StateCode", workflowState)
            .input("PermissionCode", permission)
            .query(`
        SELECT TOP 1 1 AS Allowed

        FROM auth.UserRoles ur

        INNER JOIN auth.WorkflowPermissionMatrix wpm
            ON wpm.RoleID = ur.RoleID

        INNER JOIN auth.WorkflowStates ws
            ON ws.WorkflowStateID =
               wpm.WorkflowStateID

        INNER JOIN auth.Permissions p
            ON p.PermissionID =
               wpm.PermissionID

        WHERE ur.UserID = @UserID
        AND ws.StateCode = @StateCode
        AND p.PermissionCode =
            @PermissionCode
        AND wpm.IsAllowed = 1
      `);

        return result.recordset.length > 0;
    }

}