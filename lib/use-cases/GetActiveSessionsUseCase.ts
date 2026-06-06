import {
    ActiveSessionService
}
    from "@/lib/services/ActiveSessionService";

export class GetActiveSessionsUseCase {

    private service =
        new ActiveSessionService();

    async execute(
        userId: string,
        loginSessionId: string
    ) {

        return await this.service
            .getSessions(
                userId,
                loginSessionId
            );
    }
}