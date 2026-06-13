import { NextRequest } from "next/server";

export async function authorize(
    request: NextRequest,
    requiredPermissions: string[]
) {

    const permissions =
        JSON.parse(
            request.headers.get(
                "x-permissions"
            ) ?? "[]"
        );

    // if (
    //     permissions.includes(
    //         "SECURITY.ADMIN"
    //     )
    // ) {
    //     return true;
    // }

    const allowed =
        requiredPermissions.every(
            permission =>
                permissions.includes(
                    permission
                )
        );

    if (!allowed) {
        throw new Error(
            "FORBIDDEN"
        );
    }
}
