import { NextRequest }
    from "next/server";

import {
    LogoutUseCase
}
    from "@/lib/use-cases/LogoutUseCase";

const logoutUseCase =
    new LogoutUseCase();

export async function POST(
    request: NextRequest
) {

    try {

        const authHeader =
            request.headers.get(
                "authorization"
            );

        if (!authHeader) {

            return Response.json(
                {
                    message:
                        "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        const token =
            authHeader.replace(
                "Bearer ",
                ""
            );

        const ipAddress =
            request.headers.get(
                "x-forwarded-for"
            ) ?? "UNKNOWN";

        const userAgent =
            request.headers.get(
                "user-agent"
            ) ?? "UNKNOWN";

        await logoutUseCase.execute(
            token,
            ipAddress,
            userAgent
        );

        return Response.json({
            success: true
        });

    } catch {

        return Response.json(
            {
                success: false,
                message:
                    "Logout failed"
            },
            {
                status: 500
            }
        );
    }
}