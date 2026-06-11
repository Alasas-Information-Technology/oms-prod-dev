import { NextRequest } from "next/server";
import { PermissionRepository } from "@/lib/repositories/PermissionRepository";


const permissionRepository = new PermissionRepository();

export async function authorize(
    request: NextRequest,
    requiredPermissions: string[]
) {


    const userId =
        JSON.parse(
            request.headers.get(
                "x-user-id"
            ) || "[]"
        );

    const permissions = await permissionRepository.getPermissions(
        userId
    )

    const allowed =
        requiredPermissions.every(
            p =>
                permissions.includes(
                    p
                )
        );

    if (!allowed) {

        throw new Error(
            "FORBIDDEN"
        );
    }
}

