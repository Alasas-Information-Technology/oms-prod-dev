import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetFailedLoginsUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(
        userId: string,
        page: number,
        pageSize: number
    ) {

        return await this.securityRepository
            .getFailedLoginAttempts(
                userId,
                page,
                pageSize
            );
    }
}