import jwt from "jsonwebtoken";

import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { SessionService }
    from "@/lib/services/SessionService";

export class LogoutUseCase {

    private authRepository =
        new AuthRepository();

    private sessionService =
        new SessionService();

    async execute(
        token: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<void> {

        const payload =
            jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as any;

        await this.sessionService
            .revokeSession(
                payload.loginSessionId
            );

        const user =
            await this.authRepository
                .getUserSessionData(
                    payload.userId
                );

        if (user) {

            await this.authRepository
                .createLogoutHistory({

                    loginSessionId:
                        payload.loginSessionId,

                    userId:
                        payload.userId,

                    username:
                        user.username,

                    ipAddress,

                    userAgent,

                    logoutReason:
                        "USER_LOGOUT"
                });
        }
    }
}