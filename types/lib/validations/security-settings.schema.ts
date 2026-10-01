// lib/validations/security-settings.schema.ts

import { z } from "zod";

export const updateSecuritySettingsSchema = z.object({
    maxConcurrentSessions: z.number().int().min(1).max(20).default(3),
    allowMultipleSessions: z.boolean().default(false),
    autoRevokeOldestSession: z.boolean().default(false),
    accessTokenLifetime: z.number().int().min(5).max(60).default(15),
    refreshTokenLifetime: z.number().int().min(1).max(90).default(30),
    requireSessionFingerprinting: z.boolean().default(false),
    maxFailedLoginAttempts: z.number().int().min(1).max(20).default(5),
    lockoutDuration: z.number().int().min(1).max(1440).default(30),
    enableReplayDetection: z.boolean().default(true),
    replayActionRevoke: z.boolean().default(true),
    replayActionLog: z.boolean().default(true),
    replayActionLogout: z.boolean().default(true),
    securityEventsRetention: z.number().int().min(1).max(3650).default(365),
    loginHistoryRetention: z.number().int().min(1).max(3650).default(365),
    logoutHistoryRetention: z.number().int().min(1).max(3650).default(365),
    failedLoginRetention: z.number().int().min(1).max(3650).default(180),
});

export type UpdateSecuritySettingsInput =
    z.infer<
        typeof updateSecuritySettingsSchema
    >;