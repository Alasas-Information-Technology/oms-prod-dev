import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
    params: Promise<{ managerId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { managerId } = await params;
    return proxyToBackend(request, `/api/v1/organization/managers/${managerId}`);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { managerId } = await params;
    return proxyToBackend(request, `/api/v1/organization/managers/${managerId}`);
}
