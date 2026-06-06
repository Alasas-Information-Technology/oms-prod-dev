import { WorkflowRepository }
    from "@/lib/repositories/WorkflowRepository";

export class WorkflowPermissionService {
    private workflowRepository =
        new WorkflowRepository();

    async canExecute(
        userId: string,
        workflowState: string,
        permission: string
    ): Promise<boolean> {

        return this.workflowRepository
            .canExecute(
                userId,
                workflowState,
                permission
            );
    }
}