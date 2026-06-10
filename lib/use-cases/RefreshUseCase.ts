import jwt from "jsonwebtoken";

import {
    AuthService
} from "@/lib/services/AuthService";

import {
    SessionService
} from "@/lib/services/SessionService";

import {
    RefreshTokenService
} from "@/lib/services/RefreshTokenService";

import { SECURITY } from "@/lib/constants/security";
import { SecurityEventService } from "@/lib/services/SecurityEventService";
import { SECURITY_EVENTS } from "@/lib/constants/securityEvents";

/**
 * RefreshUseCase
 *
 * Handles refresh token validation, rotation, and replay detection.
 * This is the ONLY place in the system that issues new tokens after login.
 *
 * Security features:
 * - Refresh token rotation on every use
 * - Replay detection: reuse of a rotated token revokes the entire session
 * - Session validation before issuing new tokens
 */
export class RefreshUseCase {

    private authService =
        new AuthService();

    private sessionService =
        new SessionService();

    private refreshTokenService =
        new RefreshTokenService();

    private securityEventService =
        new SecurityEventService();

    async execute(
        refreshToken: string,
        ipAddress?: string,
        userAgent?: string
    ) {

        // 1. Hash the incoming refresh token
        const refreshHash =
            this.refreshTokenService
                .hash(refreshToken);

        // 2. Find ANY session matching this hash (including revoked ones)
        //    This is critical for replay detection.
        const session =
            await this.sessionService
                .findSessionByRefreshTokenHash(
                    refreshHash
                );

        // 3. No session found — invalid token
        if (!session) {
            console.warn(
                "[SECURITY] Refresh attempt with unknown token hash"
            );
            throw new Error(
                "Invalid refresh token"
            );
        }

        // 4. REPLAY DETECTION
        //    If the refresh token was already rotated (revoked), this is a replay attack.
        //    An attacker is reusing a token that was already consumed.
        //    Immediately revoke the entire session to protect the user.
        if (session.RefreshTokenRevokedAt !== null) {
            console.error(
                `[SECURITY] REFRESH TOKEN REPLAY DETECTED — Session: ${session.LoginSessionID}, User: ${session.UserID}. Revoking entire session.`
            );

            await this.sessionService
                .revokeSessionFull(
                    session.LoginSessionID
                );

            await this.securityEventService.log(
                SECURITY_EVENTS.REFRESH_TOKEN_REPLAY,
                {
                    userId: session.UserID,
                    loginSessionId: session.LoginSessionID,
                    description: "Refresh token replay attack detected",
                    ipAddress,
                    userAgent
                }
            );

            throw new Error(
                "REFRESH_TOKEN_REPLAY"
            );
        }

        // 5. Validate session is still active
        if (!session.IsActive) {
            console.warn(
                `[SECURITY] Refresh attempt on inactive session: ${session.LoginSessionID}`
            );
            throw new Error(
                "Session is no longer active"
            );
        }

        // 6. Validate session has not been revoked
        if (session.RevokedAt !== null) {
            console.warn(
                `[SECURITY] Refresh attempt on revoked session: ${session.LoginSessionID}`
            );
            throw new Error(
                "Session has been revoked"
            );
        }

        // 7. Validate session has not expired
        if (new Date(session.ExpiresAt) <= new Date()) {
            console.warn(
                `[SECURITY] Refresh attempt on expired session: ${session.LoginSessionID}`
            );

            await this.securityEventService.log(
                SECURITY_EVENTS.SESSION_EXPIRED,
                {
                    userId: session.UserID,
                    loginSessionId: session.LoginSessionID,
                    description: "Attempted to refresh an expired session",
                    ipAddress,
                    userAgent
                }
            );

            throw new Error(
                "Session has expired"
            );
        }

        // 8. Validate refresh token has not expired
        if (
            session.RefreshTokenExpiresAt &&
            new Date(session.RefreshTokenExpiresAt) <= new Date()
        ) {
            console.warn(
                `[SECURITY] Refresh attempt with expired refresh token: ${session.LoginSessionID}`
            );

            await this.securityEventService.log(
                SECURITY_EVENTS.TOKEN_EXPIRED,
                {
                    userId: session.UserID,
                    loginSessionId: session.LoginSessionID,
                    description: "Attempted to use an expired refresh token",
                    ipAddress,
                    userAgent
                }
            );

            throw new Error(
                "Refresh token has expired"
            );
        }

        // 9. Load fresh user session data (roles, permissions, scopes from DB)
        const userSession =
            await this.authService
                .getUserSession(
                    session.UserID
                );

        // 10. Generate new refresh token (rotation)
        const newRefreshToken =
            this.refreshTokenService
                .generate();

        const newRefreshHash =
            this.refreshTokenService
                .hash(newRefreshToken);

        // 11. Rotate: atomically update the hash in the session
        //     The old refresh token hash is now orphaned and can never match again.
        //     If someone tries to reuse the OLD token, findSessionByRefreshTokenHash()
        //     will not find it (because the hash column now holds the NEW hash).
        //     However, we also revoke the old token explicitly for defense-in-depth.
        await this.sessionService
            .revokeRefreshToken(
                session.LoginSessionID,
                ipAddress,
                userAgent
            );

        await this.sessionService
            .rotateRefreshToken(
                session.LoginSessionID,
                newRefreshHash,
                ipAddress,
                userAgent
            );

        // 12. Update last activity timestamp
        await this.sessionService
            .updateLastActivity(
                session.LoginSessionID
            );

        // 13. Generate new JWT access token
        const accessToken =
            jwt.sign(
                {
                    userId:
                        userSession.userId,

                    loginSessionId:
                        session.LoginSessionID,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: SECURITY.ACCESS_TOKEN_EXPIRY as any,
                    issuer: process.env.JWT_ISSUER || "OMS",
                    audience: process.env.JWT_AUDIENCE || "OMS_USERS",
                }
            );

        console.info(
            `[AUTH] Token refresh successful — Session: ${session.LoginSessionID}`
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
}