import { NextResponse } from "next/server";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";
import { GetSecurityDashboardDataUseCase } from "@/lib/use-cases/security-dashboard/GetSecurityDashboardDataUseCase";

export async function GET() {

    try {

        const repository =
            new SecurityRepository();

        const useCase =
            new GetSecurityDashboardDataUseCase(
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
                    "Failed to load security dashboard"
            },
            {
                status: 500
            }
        );
    }
}