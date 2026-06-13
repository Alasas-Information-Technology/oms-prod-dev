// lib/usecases/SecuritySettingsUseCase.ts

import { SecuritySettingsRepository } from "@/lib/repositories/SecuritySettingsRepository";
import { SecuritySettingsResponseDto, UpdateSecuritySettingsDto } from "@/lib/types/security-settings.types";

export class SecuritySettingsUseCase {
    constructor(
        private repository = new SecuritySettingsRepository()
    ) { }

    async getSettings(): Promise<SecuritySettingsResponseDto> {
        const rows = await this.repository.getAll();
        const map = Object.fromEntries(
            rows.map((x: any) => [x.SettingCode, x.SettingValue])
        );

        return {
            maxConcurrentSessions: Number(map.MAX_CONCURRENT_SESSIONS || 3),
            allowMultipleSessions: map.ALLOW_MULTIPLE_SESSIONS === "true",
            autoRevokeOldestSession: map.AUTO_REVOKE_OLDEST_SESSION === "true",
            accessTokenLifetime: Number(map.ACCESS_TOKEN_LIFETIME || 15),
            refreshTokenLifetime: Number(map.REFRESH_TOKEN_LIFETIME || 30),
            requireSessionFingerprinting: map.REQUIRE_SESSION_FINGERPRINTING === "true",
            maxFailedLoginAttempts: Number(map.MAX_FAILED_LOGIN_ATTEMPTS || 5),
            lockoutDuration: Number(map.LOCKOUT_DURATION || 30),
            enableReplayDetection: map.ENABLE_REPLAY_DETECTION !== "false", // default true
            replayActionRevoke: map.REPLAY_ACTION_REVOKE !== "false",
            replayActionLog: map.REPLAY_ACTION_LOG !== "false",
            replayActionLogout: map.REPLAY_ACTION_LOGOUT !== "false",
            securityEventsRetention: Number(map.SECURITY_EVENTS_RETENTION || 365),
            loginHistoryRetention: Number(map.LOGIN_HISTORY_RETENTION || 365),
            logoutHistoryRetention: Number(map.LOGOUT_HISTORY_RETENTION || 365),
            failedLoginRetention: Number(map.FAILED_LOGIN_RETENTION || 180),
        };
    }

    async updateSettings(
        data: UpdateSecuritySettingsDto,
        updatedBy: string,
        ipAddress?: string,
        userAgent?: string
    ) {
        const oldSettings = await this.getSettings();

        const settingsToUpdate = [
            { code: "MAX_CONCURRENT_SESSIONS", value: String(data.maxConcurrentSessions), old: String(oldSettings.maxConcurrentSessions) },
            { code: "ALLOW_MULTIPLE_SESSIONS", value: String(data.allowMultipleSessions), old: String(oldSettings.allowMultipleSessions) },
            { code: "AUTO_REVOKE_OLDEST_SESSION", value: String(data.autoRevokeOldestSession), old: String(oldSettings.autoRevokeOldestSession) },
            { code: "ACCESS_TOKEN_LIFETIME", value: String(data.accessTokenLifetime), old: String(oldSettings.accessTokenLifetime) },
            { code: "REFRESH_TOKEN_LIFETIME", value: String(data.refreshTokenLifetime), old: String(oldSettings.refreshTokenLifetime) },
            { code: "REQUIRE_SESSION_FINGERPRINTING", value: String(data.requireSessionFingerprinting), old: String(oldSettings.requireSessionFingerprinting) },
            { code: "MAX_FAILED_LOGIN_ATTEMPTS", value: String(data.maxFailedLoginAttempts), old: String(oldSettings.maxFailedLoginAttempts) },
            { code: "LOCKOUT_DURATION", value: String(data.lockoutDuration), old: String(oldSettings.lockoutDuration) },
            { code: "ENABLE_REPLAY_DETECTION", value: String(data.enableReplayDetection), old: String(oldSettings.enableReplayDetection) },
            { code: "REPLAY_ACTION_REVOKE", value: String(data.replayActionRevoke), old: String(oldSettings.replayActionRevoke) },
            { code: "REPLAY_ACTION_LOG", value: String(data.replayActionLog), old: String(oldSettings.replayActionLog) },
            { code: "REPLAY_ACTION_LOGOUT", value: String(data.replayActionLogout), old: String(oldSettings.replayActionLogout) },
            { code: "SECURITY_EVENTS_RETENTION", value: String(data.securityEventsRetention), old: String(oldSettings.securityEventsRetention) },
            { code: "LOGIN_HISTORY_RETENTION", value: String(data.loginHistoryRetention), old: String(oldSettings.loginHistoryRetention) },
            { code: "LOGOUT_HISTORY_RETENTION", value: String(data.logoutHistoryRetention), old: String(oldSettings.logoutHistoryRetention) },
            { code: "FAILED_LOGIN_RETENTION", value: String(data.failedLoginRetention), old: String(oldSettings.failedLoginRetention) },
        ];

        const { SecurityEventService } = await import("@/lib/services/SecurityEventService");
        const securityEventService = new SecurityEventService();
        const { SECURITY_EVENTS } = await import("@/lib/constants/securityEvents");
        const { securityEventBus } = await import("@/lib/events/securityEventBus");

        for (const setting of settingsToUpdate) {
            if (setting.value !== setting.old) {
                await this.repository.update(setting.code, setting.value, updatedBy);
                
                await securityEventService.log(SECURITY_EVENTS.SECURITY_SETTING_CHANGED as any, {
                    userId: updatedBy,
                    ipAddress,
                    userAgent,
                    description: `Security setting ${setting.code} changed from ${setting.old} to ${setting.value}`
                });
            }
        }

        if (typeof securityEventBus !== "undefined") {
            securityEventBus.emit("security-event");
        }
    }
}