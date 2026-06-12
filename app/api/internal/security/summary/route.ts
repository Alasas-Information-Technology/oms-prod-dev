import { NextRequest, NextResponse } from "next/server";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

import { GetSecurityDashboardSummaryUseCase } from "@/lib/use-cases/security-dashboard/GetSecurityDashboardSummaryUseCase";
import { authorize } from "@/lib/auth/authorization";

export async function GET(request: NextRequest) {

    try {
        await authorize(request, ["SECURITY.DASHBOARD.VIEW"]);

        const repository =
            new SecurityRepository();

        const useCase =
            new GetSecurityDashboardSummaryUseCase(
                repository
            );

        const result =
            await useCase.execute();

        return NextResponse.json(
            result
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                message:
                    "Failed to load dashboard"
            },
            {
                status: 500
            }
        );
    }
}