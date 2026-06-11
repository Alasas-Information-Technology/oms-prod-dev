import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetSecurityDashboardSummaryUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {

        return await this.securityRepository
            .getDashboardSummary();
    }
}