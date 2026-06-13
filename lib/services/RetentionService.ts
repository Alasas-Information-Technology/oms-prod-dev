import { getDb } from "@/lib/db";
import { securitySettingsService } from "./SecuritySettingsService";
import { SecurityEventService } from "./SecurityEventService";
import { SECURITY_EVENTS } from "../constants/securityEvents";

export class RetentionService {
    private securityEventService = new SecurityEventService();

    async executeCleanup(): Promise<void> {
        console.log("[RETENTION] Starting retention cleanup job...");
        
        const policies = await securitySettingsService.getRetentionPolicies();
        const db = await getDb();

        try {
            // Cleanup Security Events
            const securityEventsResult = await db.request()
                .input("Days", policies.securityEvents)
                .query(`
                    DELETE FROM auth.SecurityEvents
                    WHERE CreatedAt < DATEADD(DAY, -@Days, SYSUTCDATETIME())
                `);
            const securityEventsDeleted = securityEventsResult.rowsAffected[0] || 0;

            // Cleanup Login History
            const loginHistoryResult = await db.request()
                .input("Days", policies.loginHistory)
                .query(`
                    DELETE FROM auth.LoginHistory
                    WHERE LoginAt < DATEADD(DAY, -@Days, SYSUTCDATETIME())
                `);
            const loginHistoryDeleted = loginHistoryResult.rowsAffected[0] || 0;

            // Cleanup Failed Login Attempts
            const failedLoginsResult = await db.request()
                .input("Days", policies.failedLogins)
                .query(`
                    DELETE FROM auth.FailedLoginAttempts
                    WHERE AttemptedAt < DATEADD(DAY, -@Days, SYSUTCDATETIME())
                `);
            const failedLoginsDeleted = failedLoginsResult.rowsAffected[0] || 0;

            // Note: LogoutHistory isn't a separate table in the current schema (usually part of LoginSessions or LoginHistory),
            // but if it exists we would delete it here. Assuming it maps to LoginHistory updates or similar, or we can just log 0.
            // For now, tracking what we actually deleted.

            const summary = `Deleted ${securityEventsDeleted} SecurityEvents, ${loginHistoryDeleted} LoginHistory rows, ${failedLoginsDeleted} FailedLoginAttempts.`;
            
            console.log(`[RETENTION] Cleanup completed. ${summary}`);

            await this.securityEventService.log(
                SECURITY_EVENTS.RETENTION_JOB_EXECUTED as any,
                {
                    description: `Retention Job Executed: ${summary}`
                }
            );

        } catch (error) {
            console.error("[RETENTION] Failed to execute cleanup job", error);
            throw error;
        }
    }
}
