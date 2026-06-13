// app/api/internal/security/settings/route.ts

import { NextRequest, NextResponse } from "next/server";

import { authorize } from "@/lib/auth/authorization";

import { SecuritySettingsUseCase } from "@/lib/use-cases/SecuritySettingsUseCase";

import {
    updateSecuritySettingsSchema
} from "@/lib/validations/security-settings.schema";

import { SecurityRepository } from "@/lib/repositories/SecurityRepository";


export async function GET(request: NextRequest) {

    await authorize(request, ["SECURITY.ADMIN"]);

    const useCase = new SecuritySettingsUseCase();

    const data = await useCase.getSettings();

    return NextResponse.json(data);
}

// app/api/internal/security/settings/route.ts

export async function PUT(
    request: NextRequest
) {

    await authorize(
        request,
        ["SECURITY.ADMIN"]
    );

    const body =
        await request.json();

    const validated =
        updateSecuritySettingsSchema.parse(
            body
        );

    const userId =
        request.headers.get(
            "x-user-id"
        )!;

    const useCase =
        new SecuritySettingsUseCase();

    await useCase.updateSettings(
        validated,
        userId
    );

    const securityRepository =
        new SecurityRepository();

    await securityRepository
        .createSecurityEvent({
            userId,
            loginSessionId:
                request.headers.get(
                    "x-login-session-id"
                ),
            eventType:
                "SECURITY_SETTING_UPDATED",
            eventDescription:
                "Security settings updated",
            ipAddress:
                request.headers.get(
                    "x-forwarded-for"
                ) ?? "",
            userAgent:
                request.headers.get(
                    "user-agent"
                ) ?? ""
        });

    return NextResponse.json({
        success: true
    });
}