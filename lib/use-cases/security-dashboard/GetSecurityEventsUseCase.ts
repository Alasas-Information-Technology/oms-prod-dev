import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetSecurityEventsUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string,
        page: number,
        pageSize: number
    ) {

        return await this.securityRepository
            .getSecurityEvents(
                userId,
                page,
                pageSize
            );
    }
}