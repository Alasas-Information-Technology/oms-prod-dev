import { SecuritySettingsUseCase } from "@/lib/use-cases/SecuritySettingsUseCase";
import { SecuritySettingsResponseDto } from "@/lib/types/security-settings.types";
import { securityEventBus } from "@/lib/events/securityEventBus";

class SecuritySettingsService {
    private static instance: SecuritySettingsService;
    private useCase = new SecuritySettingsUseCase();
    private cache: SecuritySettingsResponseDto | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes fallback TTL

    private constructor() {
        // Auto-invalidate when settings change
        if (typeof securityEventBus !== "undefined") {
            securityEventBus.on("security-event", () => {
                this.invalidateCache();
            });
        }
    }

    public static getInstance(): SecuritySettingsService {
        if (!SecuritySettingsService.instance) {
            SecuritySettingsService.instance = new SecuritySettingsService();
        }
        return SecuritySettingsService.instance;
    }

    public invalidateCache() {
        this.cache = null;
        this.cacheTimestamp = 0;
        console.log("[SECURITY] Settings cache invalidated.");
    }

    public async refreshCache(): Promise<void> {
        this.cache = await this.useCase.getSettings();
        this.cacheTimestamp = Date.now();
        console.log("[SECURITY] Settings cache refreshed.");
    }

    public async getSettings(): Promise<SecuritySettingsResponseDto> {
        if (!this.cache || Date.now() - this.cacheTimestamp > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
        return this.cache!;
    }

    // --- Typed Getters ---

    public async getAccessTokenLifetime(): Promise<number> {
        const settings = await this.getSettings();
        return settings.accessTokenLifetime;
    }

    public async getRefreshTokenLifetime(): Promise<number> {
        const settings = await this.getSettings();
        return settings.refreshTokenLifetime;
    }

    public async requireSessionFingerprinting(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.requireSessionFingerprinting;
    }

    public async getMaxConcurrentSessions(): Promise<number> {
        const settings = await this.getSettings();
        return settings.maxConcurrentSessions;
    }

    public async isMultipleSessionsAllowed(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.allowMultipleSessions;
    }

    public async getAutoRevokeOldestSession(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.autoRevokeOldestSession;
    }

    public async getMaxFailedLoginAttempts(): Promise<number> {
        const settings = await this.getSettings();
        return settings.maxFailedLoginAttempts;
    }

    public async getLockoutDuration(): Promise<number> {
        const settings = await this.getSettings();
        return settings.lockoutDuration;
    }

    public async isReplayDetectionEnabled(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.enableReplayDetection;
    }

    public async getReplayActions(): Promise<{ revoke: boolean; log: boolean; logout: boolean }> {
        const settings = await this.getSettings();
        return {
            revoke: settings.replayActionRevoke,
            log: settings.replayActionLog,
            logout: settings.replayActionLogout
        };
    }

    public async getRetentionPolicies(): Promise<{ securityEvents: number; loginHistory: number; logoutHistory: number; failedLogins: number }> {
        const settings = await this.getSettings();
        return {
            securityEvents: settings.securityEventsRetention,
            loginHistory: settings.loginHistoryRetention,
            logoutHistory: settings.logoutHistoryRetention,
            failedLogins: settings.failedLoginRetention
        };
    }
}

export const securitySettingsService = SecuritySettingsService.getInstance();
