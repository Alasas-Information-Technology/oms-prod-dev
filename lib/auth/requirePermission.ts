import { NextRequest } from "next/server";

export function requirePermission(
    request: NextRequest,
    permission: string
) {

    const permissions =
        JSON.parse(
            request.headers.get(
                "x-permissions"
            ) || "[]"
        );

    if (
        !permissions.includes(
            permission
        )
    ) {

        throw new Error(
            "FORBIDDEN"
        );
    }
}