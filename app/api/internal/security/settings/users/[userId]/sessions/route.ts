import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    return proxyToBackend(request, `/api/v1/internal/security/settings/users/${userId}/sessions`);
}