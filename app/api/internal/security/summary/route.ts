// app/api/internal/security/summary/route.ts

import { NextResponse } from "next/server";
import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

const repository =
    new SecurityRepository();

export async function GET() {

    try {

        const summary =
            await repository
                .getSecuritySummary();

        return NextResponse.json({
            success: true,
            data: summary,
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load security summary",
            },
            {
                status: 500,
            }
        );
    }
}