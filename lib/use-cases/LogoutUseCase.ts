import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { SessionService }
    from "@/lib/services/SessionService";

/**
 * LogoutUseCase
 *
 * Handles session revocation, refresh token revocation, and logout history.
 * Reads loginSessionId and userId from middleware-injected headers
 * (already validated by middleware) instead of re-verifying the JWT.
 */
export class LogoutUseCase {

    private authRepository =
        new AuthRepository();

    private sessionService =
        new SessionService();

    async execute(
        loginSessionId: string,
        userId: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<void> {

        // Revoke the session
        await this.sessionService
            .revokeSession(
                loginSessionId
            );

        // Revoke the refresh token
        await this.sessionService
            .revokeRefreshToken(
                loginSessionId
            );

        // Record logout history
        const user =
            await this.authRepository
                .getUserSessionData(
                    userId
                );

        if (user) {

            await this.authRepository
                .createLogoutHistory({

                    loginSessionId,

                    userId,

                    username:
                        user.username,

                    ipAddress,

                    userAgent,

                    logoutReason:
                        "USER_LOGOUT"
                });
        }

        console.info(
            `[AUTH] User logout — Session: ${loginSessionId}`
        );
    }
}