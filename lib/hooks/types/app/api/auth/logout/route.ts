import { proxyToBackend } from "@/lib/api/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await proxyToBackend(request, "/api/v1/auth/logout");
    } catch {}

    const response = NextResponse.json({ success: true });
    response.cookies.delete({ name: "oms_access_token", path: "/" });
    response.cookies.delete({ name: "oms_refresh_token", path: "/" });
    return response;
}

export async function GET(request: NextRequest) {
    try {
        await proxyToBackend(request, "/api/v1/auth/logout");
    } catch {}

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete({ name: "oms_access_token", path: "/" });
    response.cookies.delete({ name: "oms_refresh_token", path: "/" });
    return response;
}