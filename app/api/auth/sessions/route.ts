import {
    NextRequest,
    NextResponse
} from "next/server";

import { authorize } from "@/lib/auth/authorization";
import {
    GetActiveSessionsUseCase
} from "@/lib/use-cases/GetActiveSessionsUseCase";



export async function GET(
    request: NextRequest
) {

    await authorize(request, ["SECURITY.FAILED_LOGINS.VIEW"]);

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