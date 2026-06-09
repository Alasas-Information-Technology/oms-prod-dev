import {
    NextRequest,
    NextResponse
}
    from "next/server";

import {
    GetActiveSessionsUseCase
}
    from "@/lib/use-cases/GetActiveSessionsUseCase";



export async function GET(
    request: NextRequest
) {

    const userId =
        request.headers.get(
            "x-user-id"
        );

    const loginSessionId =
        request.headers.get(
            "x-login-session-id"
        );

    if (
        !userId ||
        !loginSessionId
    ) {
        return NextResponse.json(
            {
                success: false
            },
            {
                status: 401
            }
        );
    }

    const useCase =
        new GetActiveSessionsUseCase();

    const sessions =
        await useCase.execute(
            userId,
            loginSessionId
        );

    return NextResponse.json({
        success: true,
        sessions
    });

}