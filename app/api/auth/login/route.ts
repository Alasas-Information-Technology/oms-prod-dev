import { SECURITY } from "@/lib/constants/security";
import { SECURITY_EVENTS } from "@/lib/constants/securityEvents";
import { SecurityEventService } from "@/lib/services/SecurityEventService";
import { LoginUseCase } from "@/lib/use-cases/LoginUseCase";
import { randomUUID as uuidv4 } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const loginUseCase =
    new LoginUseCase();

const securityEventService =
    new SecurityEventService();



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

    const deviceFingerprint = request.cookies.get("oms_device_id")?.value ?? uuidv4();

    try {
        const body = await request.json();

        const result =
            await loginUseCase.execute(
                body.username,
                body.password,
                ipAddress,
                userAgent,
                deviceFingerprint,
                body.confirmRevokeOldest
            );

        // Build response WITHOUT tokens in the body (security requirement)
        const response = NextResponse.json({
            success: true,
            session: result.session,
        });

        response.cookies.set("oms_access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.ACCESS_TOKEN_COOKIE_MAX_AGE,
        });

        response.cookies.set("oms_refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SECURITY.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        response.cookies.set(
            "oms_device_id",
            deviceFingerprint,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: SECURITY.DEVICE_ID_COOKIE_MAX_AGE
            }
        );

        return response;

    } catch (error: any) {

        console.error(error);

        if (
            error.name ===
            "RateLimitExceededError"
        ) {

            await securityEventService.log(
                SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
                {
                    ipAddress,
                    userAgent,
                    description: "Login rate limit exceeded"
                }
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        error.message,
                },
                {
                    status: 429,
                }
            );
        }

        if (error.message === "MAX_SESSIONS_REACHED") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Maximum number of sessions reached, please contact your admin."
                },
                { status: 403 }
            );
        }

        if (error.message === "CONFIRM_REVOKE_OLDEST") {
            return NextResponse.json(
                {
                    success: false,
                    code: "CONFIRM_REVOKE_OLDEST",
                    message: "Confirmation required to revoke oldest session"
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 401
            }
        );
    }
}