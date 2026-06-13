import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetSecurityDashboardDataUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {

        const [
            summary,
            events,
            failedLogins,
            activeSessions
        ] = await Promise.all([
            this.securityRepository.getDashboardSummary(),

            this.securityRepository.getRecentSecurityEvents(
                1,
                25
            ),

            this.securityRepository.getRecentFailedLogins(
                1,
                25
            ),

            this.securityRepository.getActiveSessionsDashboard()
        ]);

        return {
            summary,
            events,
            failedLogins,
            activeSessions
        };
    }
}