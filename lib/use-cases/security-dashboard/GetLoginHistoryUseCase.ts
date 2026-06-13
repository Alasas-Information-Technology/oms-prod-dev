import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetLoginHistoryUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string,
        page: number,
        pageSize: number
    ) {

        return await this.securityRepository
            .getLoginHistory(
                userId,
                page,
                pageSize
            );
    }
}