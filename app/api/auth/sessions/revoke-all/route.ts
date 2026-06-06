import {
    NextRequest,
    NextResponse
} from "next/server";

import {
    SessionService
} from "@/lib/services/SessionService";

const sessionService =
    new SessionService();

export async function POST(
    request: NextRequest
) {

    try {

        const userId =
            request.headers.get(
                "x-user-id"
            );

        const currentSessionId =
            request.headers.get(
                "x-login-session-id"
            );

        if (
            !userId ||
            !currentSessionId
        ) {
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

        await sessionService
            .revokeAllOtherSessions(
                userId,
                currentSessionId
            );

        return NextResponse.json({
            success: true,
            message:
                "All other sessions terminated"
        });

    } catch {

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal Server Error"
            },
            {
                status: 500
            }
        );
    }
}