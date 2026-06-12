import {
    NextRequest,
    NextResponse
} from "next/server";

import { authorize } from "@/lib/auth/authorization";
import { AuthRepository } from "@/lib/repositories/AuthRepository";
import {
    SessionService
} from "@/lib/services/SessionService";

const sessionService =
    new SessionService();

const authRepository = new AuthRepository()



export async function DELETE(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {

    await authorize(request, ["SECURITY.SESSIONS.REVOKE"]);

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

        const { id } =
            await context.params;

        /**
         * Prevent self termination
         */

        if (
            id === currentSessionId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Cannot terminate current session"
                },
                {
                    status: 400
                }
            );
        }

        /**
         * Verify ownership
         */

        const session =
            await sessionService
                .getSessionById(id);

        if (!session) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Session not found"
                },
                {
                    status: 404
                }
            );
        }

        if (
            session.UserID !== userId
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Forbidden"
                },
                {
                    status: 403
                }
            );
        }

        await sessionService
            .revokeSession(id);

        const user = await authRepository.getUserSessionData(userId);

        await authRepository.createLogoutHistory({
            userId,
            loginSessionId: id,
            logoutReason:
                "SESSION_TERMINATED",
            ipAddress:
                request.headers.get(
                    "x-forwarded-for"
                ) ?? "",
            userAgent:
                request.headers.get(
                    "user-agent"
                ) ?? "",
            username:
                user?.username ?? "Unknown"
        });

        return NextResponse.json({
            success: true,
            message:
                "Session terminated"
        });

    } catch (error) {
        console.error("Error terminating session:", error);

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