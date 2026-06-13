import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetUserSecuritySummaryUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string
    ) {

        return await this.securityRepository
            .getSecuritySummarybyId(
                userId
            );
    }
}