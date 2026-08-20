import { proxyToBackend } from "@/lib/api/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await proxyToBackend(request, "/api/v1/auth/logout");

        const response = NextResponse.json({ success: true });
        response.cookies.delete("oms_access_token");
        response.cookies.delete("oms_refresh_token");
        return response;
    } catch {
        const response = NextResponse.json({ success: true });
        response.cookies.delete("oms_access_token");
        response.cookies.delete("oms_refresh_token");
        return response;
    }
}