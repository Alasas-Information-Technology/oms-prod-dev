import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
    params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { userId } = await params;
    return proxyToBackend(request, `/api/v1/organization/users/${userId}/managed-units`);
}
