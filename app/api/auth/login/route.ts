import { NextRequest, NextResponse } from "next/server";
import { LoginUseCase } from "@/lib/use-cases/LoginUseCase";


const loginUseCase =
    new LoginUseCase();

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
        const body = await request.json();

        const result =
            await loginUseCase.execute(
                body.username,
                body.password,
                ipAddress,
                userAgent
            );

        return Response.json(result);

    } catch (error: any) {

        console.error(error);

        if (
            error.name ===
            "RateLimitExceededError"
        ) {

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

        return Response.json(
            {
                success: false,
                message: error.message,
                stack: error.stack
            },
            {
                status: 500
            }
        );
    }
}