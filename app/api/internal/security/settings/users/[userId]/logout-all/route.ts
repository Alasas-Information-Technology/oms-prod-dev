// app/api/internal/security/users/[userId]/logout-all/route.ts

import {
    NextRequest,
    NextResponse
} from "next/server";

import { authorize } from "@/lib/auth/authorization";

import { SECURITY_EVENTS } from "@/lib/constants/securityEvents";
import { SessionService } from "@/lib/services/SessionService";

export async function POST(
    request: NextRequest,
    {
        params
    }: {
        params: Promise<{
            userId: string
        }>
    }
) {

    await authorize(
        request,
        [
            "SECURITY.USERS.FORCE_LOGOUT"
        ]
    );

    const { userId } =
        await params;

    const service =
        new SessionService();

    const revoked =
        await service
            .revokeAllSessionsForUser(
                userId,
                SECURITY_EVENTS.ADMIN_FORCE_LOGOUT
            );

    return NextResponse.json({
        success: true,
        revokedSessions:
            revoked
    });
}