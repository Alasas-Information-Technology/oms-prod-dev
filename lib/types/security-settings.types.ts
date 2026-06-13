// lib/types/security-settings.types.ts

export interface SecuritySettingDto {
    settingCode: string;
    settingValue: string;
    settingType: string;
    description?: string;
}

export interface SecuritySettingsResponseDto {
    maxConcurrentSessions: number;
    allowMultipleSessions: boolean;
    autoRevokeOldestSession: boolean;
    accessTokenLifetime: number;
    refreshTokenLifetime: number;
    requireSessionFingerprinting: boolean;
    maxFailedLoginAttempts: number;
    lockoutDuration: number;
    enableReplayDetection: boolean;
    replayActionRevoke: boolean;
    replayActionLog: boolean;
    replayActionLogout: boolean;
    securityEventsRetention: number;
    loginHistoryRetention: number;
    logoutHistoryRetention: number;
    failedLoginRetention: number;
}

export interface UpdateSecuritySettingsDto extends SecuritySettingsResponseDto {}