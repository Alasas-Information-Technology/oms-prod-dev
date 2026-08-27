import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return proxyToBackend(request, `/api/v1/organization/units/${id}/activate`);
}
