import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetLogoutHistoryUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string,
        page: number,
        pageSize: number
    ) {

        return await this.securityRepository
            .getLogoutHistory(
                userId,
                page,
                pageSize
            );
    }
}