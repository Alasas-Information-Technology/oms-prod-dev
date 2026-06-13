import { NextRequest, NextResponse } from "next/server";
import { SecurityRepository } from "@/lib/repositories/SecurityRepository";
import { ReplayEventsUseCase } from "@/lib/use-cases/security-dashboard/chartsUseCase";
import { authorize } from "@/lib/auth/authorization";

export async function GET(request: NextRequest) {
    try {
        await authorize(request, ["SECURITY.DASHBOARD.VIEW"]);
        const repository = new SecurityRepository();
        const useCase = new ReplayEventsUseCase(repository);
        const result = await useCase.execute();
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to load replay events chart data" },
            { status: 500 }
        );
    }
}
