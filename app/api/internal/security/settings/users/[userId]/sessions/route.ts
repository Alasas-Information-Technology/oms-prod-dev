// app/api/internal/security/users/[userId]/sessions/route.ts

import { NextRequest, NextResponse } from "next/server";

import { authorize } from "@/lib/auth/authorization";

import { SessionService } from "@/lib/services/SessionService";

export async function GET(
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
            "SECURITY.SESSIONS.VIEW"
        ]
    );

    const { userId } =
        await params;

    const service =
        new SessionService();

    const sessions =
        await service
            .getSessionById(
                userId
            );

    return NextResponse.json(
        sessions
    );
}