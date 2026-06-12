import { NextRequest, NextResponse } from "next/server";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

import { GetFailedLoginsUseCase } from "@/lib/use-cases/security-dashboard/GetFailedLoginsUseCase";
import { authorize } from "@/lib/auth/authorization";

export async function GET(
    request: NextRequest
) {

    try {
        await authorize(request, ["SECURITY.FAILED_LOGINS.VIEW"]);

        const page =
            Number(
                request.nextUrl.searchParams.get(
                    "page"
                )
            ) || 1;

        const pageSize =
            Number(
                request.nextUrl.searchParams.get(
                    "pageSize"
                )
            ) || 25;

        const repository =
            new SecurityRepository();

        const useCase =
            new GetFailedLoginsUseCase(
                repository
            );

        const result =
            await useCase.execute(
                "",
                page,
                pageSize
            );

        return NextResponse.json(
            result
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                message:
                    "Failed to load failed logins"
            },
            {
                status: 500
            }
        );
    }
}