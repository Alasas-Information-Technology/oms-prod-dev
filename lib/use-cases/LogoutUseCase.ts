import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { SessionService }
    from "@/lib/services/SessionService";

import { SecurityEventService }
    from "@/lib/services/SecurityEventService";

import { SECURITY_EVENTS }
    from "@/lib/constants/securityEvents";

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

    private securityEventService =
        new SecurityEventService();

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

            await this.securityEventService.log(
                SECURITY_EVENTS.LOGOUT,
                {
                    userId,
                    loginSessionId,
                    ipAddress,
                    userAgent,
                    description: "User explicitly logged out"
                }
            );
        }

        console.info(
            `[AUTH] User logout — Session: ${loginSessionId}`
        );
    }
}