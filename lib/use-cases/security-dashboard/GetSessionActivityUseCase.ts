import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetSessionActivityUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string
    ) {

        return await this.securityRepository
            .getSessionActivity(
                userId
            );
    }
}