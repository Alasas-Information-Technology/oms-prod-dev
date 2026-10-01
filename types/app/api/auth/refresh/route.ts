import { SECURITY } from "@/lib/constants/security";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");

export async function POST(request: NextRequest) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || "UNKNOWN";
    const userAgent = request.headers.get("user-agent") || "UNKNOWN";
    const deviceFingerprint = request.cookies.get("oms_device_id")?.value;

    const token = request.cookies.get("oms_refresh_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Missing refresh token" },
            { status: 401 }
        );
    }

    try {
        const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-forwarded-for": ipAddress,
                "user-agent": userAgent,
                "x-device-fingerprint": deviceFingerprint || "",
            },
            body: JSON.stringify({
                refreshToken: token,
                deviceFingerprint,
            }),
            cache: "no-store",
        });

        const contentType = backendResponse.headers.get("content-type") || "";
        let data: any = null;

        if (contentType.includes("application/json")) {
            data = await backendResponse.json();
        } else {
            const rawText = await backendResponse.text();
            console.error(`[Refresh Proxy Error]: Backend at ${BACKEND_BASE_URL} returned non-JSON response (${backendResponse.status}):`, rawText.slice(0, 300));
            return NextResponse.json(
                {
                    success: false,
                    message: `Backend service at ${BACKEND_BASE_URL} returned non-JSON response (${backendResponse.status}). Ensure backend is running on the expected port.`,
                },
                { status: backendResponse.status || 502 }
            );
        }

        // Check for concurrent refresh response
        if (data?.code === "CONCURRENT_REFRESH" || data?.error?.code === "CONCURRENT_REFRESH") {
            return NextResponse.json({
                success: true,
                message: "Concurrent refresh handled",
            });
        }

        // Check for replay attack detection
        if (backendResponse.status === 403 || data?.code === "REFRESH_TOKEN_REPLAY" || data?.error?.code === "REFRESH_TOKEN_REPLAY") {
            const response = NextResponse.json(
                { success: false, message: "Security violation detected" },
                { status: 403 }
            );
            response.cookies.delete("oms_access_token");
            response.cookies.delete("oms_refresh_token");
            return response;
        }

        if (!backendResponse.ok) {
            const errorPayload = data?.error || data || { message: "Invalid refresh token" };
            return NextResponse.json(errorPayload, { status: backendResponse.status });
        }

        const refreshResult = data?.data || data;

        const response = NextResponse.json({ success: true });

        response.cookies.set("oms_access_token", refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.ACCESS_TOKEN_COOKIE_MAX_AGE,
        });

        response.cookies.set("oms_refresh_token", refreshResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        return response;
    } catch (error: any) {
        console.error("[Refresh Proxy Error]:", error);
        return NextResponse.json(
            { success: false, message: "Failed to refresh token" },
            { status: 500 }
        );
    }
}