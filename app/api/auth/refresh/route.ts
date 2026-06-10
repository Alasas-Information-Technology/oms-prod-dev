import {
    NextRequest,
    NextResponse
} from "next/server";

import {
    RefreshUseCase
} from "@/lib/use-cases/RefreshUseCase";

import { SECURITY } from "@/lib/constants/security";

export async function POST(
    request: NextRequest
) {

    const forwarded =
        request.headers.get(
            "x-forwarded-for"
        );

    const ipAddress =
        forwarded?.split(",")[0] ??
        "UNKNOWN";

    const userAgent =
        request.headers.get(
            "user-agent"
        ) ?? "UNKNOWN";

    try {

        // Read refresh token from HttpOnly cookie only
        const token =
            request.cookies.get("oms_refresh_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing refresh token"
                },
                {
                    status: 401
                }
            );
        }

        const refreshUseCase =
            new RefreshUseCase();

        const result =
            await refreshUseCase
                .execute(token);

        // Build response WITHOUT tokens in the body (security requirement)
        const response = NextResponse
            .json({
                success: true,
            });

        // Set new access token as HttpOnly cookie
        response.cookies.set("oms_access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: SECURITY.ACCESS_TOKEN_COOKIE_MAX_AGE,
        });

        // Set new refresh token as HttpOnly cookie (rotation)
        response.cookies.set("oms_refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: SECURITY.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        return response;

    } catch (error: any) {

        // Replay attack detection — return 403 Forbidden
        if (error?.message === "REFRESH_TOKEN_REPLAY") {
            const response = NextResponse.json(
                {
                    success: false,
                    message: "Security violation detected"
                },
                {
                    status: 403
                }
            );

            // Clear compromised cookies
            response.cookies.delete("oms_access_token");
            response.cookies.delete("oms_refresh_token");

            return response;
        }

        // All other refresh failures — return 401
        return NextResponse
            .json(
                {
                    success: false,
                    message:
                        "Invalid refresh token"
                },
                {
                    status: 401
                }
            );
    }
}