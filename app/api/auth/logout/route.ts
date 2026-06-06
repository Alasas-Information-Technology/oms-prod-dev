import {
    NextRequest,
    NextResponse,
} from "next/server";

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

        // Read user context from middleware-injected headers
        const loginSessionId =
            request.headers.get(
                "x-login-session-id"
            );

        const userId =
            request.headers.get(
                "x-user-id"
            );

        if (!loginSessionId || !userId) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        const ipAddress =
            request.headers.get(
                "x-forwarded-for"
            ) ?? "UNKNOWN";

        const userAgent =
            request.headers.get(
                "user-agent"
            ) ?? "UNKNOWN";

        await logoutUseCase.execute(
            loginSessionId,
            userId,
            ipAddress,
            userAgent
        );

        // Build response and clear both auth cookies
        const response = NextResponse.json({
            success: true
        });

        response.cookies.delete("oms_access_token");
        response.cookies.delete("oms_refresh_token");

        return response;

    } catch {

        // Even on error, attempt to clear cookies
        const response = NextResponse.json(
            {
                success: false,
                message:
                    "Logout failed"
            },
            {
                status: 500
            }
        );

        response.cookies.delete("oms_access_token");
        response.cookies.delete("oms_refresh_token");

        return response;
    }
}