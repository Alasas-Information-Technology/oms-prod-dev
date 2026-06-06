import { cookies }
    from "next/headers";

import { authService }
    from "@/lib/services";

export async function getCurrentSession() {

    const token =
        (await cookies())
            .get("oms_access_token")
            ?.value;

    if (!token) {
        throw new Error(
            "Unauthorized"
        );
    }

    return authService
        .validateToken(token);
}