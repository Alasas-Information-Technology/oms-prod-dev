import { NextRequest, NextResponse } from "next/server";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

import { GetUserSecuritySummaryUseCase } from "@/lib/use-cases/security-dashboard/GetUserSecuritySummaryUseCase";

export async function GET(
    request: NextRequest
) {

    try {

        const userId =
            request.headers.get(
                "x-user-id"
            )!;

        const repository =
            new SecurityRepository();

        const useCase =
            new GetUserSecuritySummaryUseCase(
                repository
            );

        const result =
            await useCase.execute(
                userId
            );

        return NextResponse.json(
            result
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                message:
                    "Failed to load summary"
            },
            {
                status: 500
            }
        );
    }
}