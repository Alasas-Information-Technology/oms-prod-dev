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

    async updateSettings(data: UpdateSecuritySettingsDto, updatedBy: string) {
        const settingsToUpdate = [
            { code: "MAX_CONCURRENT_SESSIONS", value: String(data.maxConcurrentSessions) },
            { code: "ALLOW_MULTIPLE_SESSIONS", value: String(data.allowMultipleSessions) },
            { code: "AUTO_REVOKE_OLDEST_SESSION", value: String(data.autoRevokeOldestSession) },
            { code: "ACCESS_TOKEN_LIFETIME", value: String(data.accessTokenLifetime) },
            { code: "REFRESH_TOKEN_LIFETIME", value: String(data.refreshTokenLifetime) },
            { code: "REQUIRE_SESSION_FINGERPRINTING", value: String(data.requireSessionFingerprinting) },
            { code: "MAX_FAILED_LOGIN_ATTEMPTS", value: String(data.maxFailedLoginAttempts) },
            { code: "LOCKOUT_DURATION", value: String(data.lockoutDuration) },
            { code: "ENABLE_REPLAY_DETECTION", value: String(data.enableReplayDetection) },
            { code: "REPLAY_ACTION_REVOKE", value: String(data.replayActionRevoke) },
            { code: "REPLAY_ACTION_LOG", value: String(data.replayActionLog) },
            { code: "REPLAY_ACTION_LOGOUT", value: String(data.replayActionLogout) },
            { code: "SECURITY_EVENTS_RETENTION", value: String(data.securityEventsRetention) },
            { code: "LOGIN_HISTORY_RETENTION", value: String(data.loginHistoryRetention) },
            { code: "LOGOUT_HISTORY_RETENTION", value: String(data.logoutHistoryRetention) },
            { code: "FAILED_LOGIN_RETENTION", value: String(data.failedLoginRetention) },
        ];

        for (const setting of settingsToUpdate) {
            await this.repository.update(setting.code, setting.value, updatedBy);
        }
    }
}