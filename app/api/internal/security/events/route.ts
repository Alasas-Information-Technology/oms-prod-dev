import { NextRequest, NextResponse } from "next/server";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

import { GetSecurityEventsUseCase } from "@/lib/use-cases/security-dashboard/GetSecurityEventsUseCase";
import { authorize } from "@/lib/auth/authorization";

export async function GET(
    request: NextRequest
) {

    try {
        await authorize(request, ["SECURITY.EVENTS.VIEW"]);

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
            new GetSecurityEventsUseCase(
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
                    "Failed to load events"
            },
            {
                status: 500
            }
        );
    }
}