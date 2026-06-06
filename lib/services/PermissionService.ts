import { PermissionRepository }
    from "@/lib/repositories/PermissionRepository";

export class PermissionService {
    private permissionRepository =
        new PermissionRepository();

    async getPermissions(
        userId: string
    ): Promise<string[]> {
        return this.permissionRepository
            .getPermissions(userId);
    }

    async hasPermission(
        userId: string,
        permission: string
    ): Promise<boolean> {

        const permissions =
            await this.getPermissions(userId);

        return permissions.includes(permission);
    }

    async hasAnyPermission(
        userId: string,
        permissions: string[]
    ): Promise<boolean> {

        const userPermissions =
            await this.getPermissions(userId);

        return permissions.some(permission =>
            userPermissions.includes(permission)
        );
    }

    async hasAllPermissions(
        userId: string,
        permissions: string[]
    ): Promise<boolean> {

        const userPermissions =
            await this.getPermissions(userId);

        return permissions.every(permission =>
            userPermissions.includes(permission)
        );
    }
}