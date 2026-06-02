import { ScopeRepository }
    from "@/lib/repositories/ScopeRepository";

export class ScopeService {
    private scopeRepository =
        new ScopeRepository();

    async getScopes(userId: string) {
        return this.scopeRepository
            .getScopes(userId);
    }

    async canAccessDepartment(
        userId: string,
        departmentId: string
    ): Promise<boolean> {

        const scopes =
            await this.getScopes(userId);

        return scopes.some(scope =>
            scope.ScopeCode === "GLOBAL" ||
            scope.DepartmentID === departmentId
        );
    }

    async canAccessBusinessUnit(
        userId: string,
        businessUnitId: string
    ): Promise<boolean> {

        const scopes =
            await this.getScopes(userId);

        return scopes.some(scope =>
            scope.ScopeCode === "GLOBAL" ||
            scope.BusinessUnitID === businessUnitId
        );
    }

    async canAccessSection(
        userId: string,
        sectionId: string
    ): Promise<boolean> {

        const scopes =
            await this.getScopes(userId);

        return scopes.some(scope =>
            scope.ScopeCode === "GLOBAL" ||
            scope.SectionID === sectionId
        );
    }

    async isGlobalUser(
        userId: string
    ): Promise<boolean> {

        const scopes =
            await this.getScopes(userId);

        return scopes.some(scope =>
            scope.ScopeCode === "GLOBAL"
        );
    }
}