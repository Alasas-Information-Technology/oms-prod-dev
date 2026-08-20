import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string; sessionId: string }> }
) {
    const { userId, sessionId } = await params;
    return proxyToBackend(request, `/api/v1/internal/security/settings/users/${userId}/sessions/${sessionId}`);
}