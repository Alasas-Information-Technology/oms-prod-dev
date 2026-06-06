import {
    AuthorizationRequest,
    AuthorizationResult,
} from "@/lib/types/authorization.types";

import { PermissionService }
    from "./PermissionService";

import { ScopeService }
    from "./ScopeService";

import { WorkflowPermissionService }
    from "./WorkflowPermissionService";

export class AuthorizationService {

    private permissionService =
        new PermissionService();

    private scopeService =
        new ScopeService();

    private workflowService =
        new WorkflowPermissionService();

    async authorize(
        request: AuthorizationRequest
    ): Promise<AuthorizationResult> {

        const {
            userId,
            permission,
            workflowState,
            departmentId,
            businessUnitId,
        } = request;

        const hasPermission =
            await this.permissionService
                .hasPermission(
                    userId,
                    permission
                );

        if (!hasPermission) {
            return {
                authorized: false,
                reason:
                    "Missing permission",
            };
        }

        if (workflowState) {

            const workflowAllowed =
                await this.workflowService
                    .canExecute(
                        userId,
                        workflowState,
                        permission
                    );

            if (!workflowAllowed) {

                return {
                    authorized: false,
                    reason:
                        "Workflow restriction",
                };
            }
        }

        if (departmentId) {

            const canAccessDepartment =
                await this.scopeService
                    .canAccessDepartment(
                        userId,
                        departmentId
                    );

            if (!canAccessDepartment) {

                return {
                    authorized: false,
                    reason:
                        "Department scope violation",
                };
            }
        }

        if (businessUnitId) {

            const canAccessBU =
                await this.scopeService
                    .canAccessBusinessUnit(
                        userId,
                        businessUnitId
                    );

            if (!canAccessBU) {

                return {
                    authorized: false,
                    reason:
                        "Business Unit scope violation",
                };
            }
        }

        return {
            authorized: true,
        };
    }
}