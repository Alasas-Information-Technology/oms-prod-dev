import { SECURITY } from "@/lib/constants/security";
import { randomUUID as uuidv4 } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || "UNKNOWN";
    const userAgent = request.headers.get("user-agent") || "UNKNOWN";
    const deviceFingerprint = request.cookies.get("oms_device_id")?.value || uuidv4();

    try {
        const body = await request.json();

        const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-forwarded-for": ipAddress,
                "user-agent": userAgent,
                "x-device-fingerprint": deviceFingerprint,
            },
            body: JSON.stringify({
                username: body.username,
                password: body.password,
                confirmRevokeOldest: body.confirmRevokeOldest,
                deviceFingerprint,
            }),
            cache: "no-store",
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            const errorPayload = data?.error || data || { message: "Authentication failed" };
            return NextResponse.json(errorPayload, { status: backendResponse.status });
        }

        const loginResult = data?.data || data;

        // Build response without tokens in the body (tokens stored securely in HttpOnly cookies)
        const response = NextResponse.json({
            success: true,
            session: loginResult.user,
        });

        response.cookies.set("oms_access_token", loginResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.ACCESS_TOKEN_COOKIE_MAX_AGE,
        });

        response.cookies.set("oms_refresh_token", loginResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        response.cookies.set("oms_device_id", deviceFingerprint, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.DEVICE_ID_COOKIE_MAX_AGE,
        });

        return response;
    } catch (error: any) {
        console.error("[Login Proxy Error]:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}