// app/api/internal/security/users/[userId]/sessions/[sessionId]/route.ts

import {
    NextRequest,
    NextResponse
} from "next/server";

import { authorize }
    from "@/lib/auth/authorization";

import { SessionService }
    from "@/lib/services/SessionService";

export async function DELETE(
    request: NextRequest,
    {
        params
    }: {
        params: Promise<{
            userId: string;
            sessionId: string;
        }>
    }
) {

    await authorize(
        request,
        [
            "SECURITY.SESSIONS.REVOKE"
        ]
    );

    const {
        sessionId
    } =
        await params;

    const service =
        new SessionService();

    await service.revokeSession(
        sessionId,
        true
    );

    return NextResponse.json({
        success: true
    });
}