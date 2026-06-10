import { UserSession } from "@/lib/types/auth.types";
import jwt from "jsonwebtoken";

import { AuthRepository } from "@/lib/repositories/AuthRepository";

import { AuthService } from "@/lib/services/AuthService";

import { SessionService } from "@/lib/services/SessionService";

import {
    detectBrowser
} from "@/lib/utils/browserDetector";

import {
    detectDeviceType
} from "@/lib/utils/deviceDetector";

import {
    FailedLoginService
} from "@/lib/services/FailedLoginService";
import { RateLimitService } from "../services/RateLimitService";
import { RefreshTokenService } from "../services/RefreshTokenService";
import { SECURITY } from "@/lib/constants/security";
import { SecurityEventService } from "../services/SecurityEventService";
import { SECURITY_EVENTS } from "../constants/securityEvents";

export interface LoginResult {
    accessToken: string;

    refreshToken: string;

    session: UserSession;
}


export class LoginUseCase {

    private authRepository =
        new AuthRepository();

    private authService =
        new AuthService();

    private sessionService =
        new SessionService();

    private failedLoginService =
        new FailedLoginService();

    private rateLimitService =
        new RateLimitService();

    private refreshTokenService =
        new RefreshTokenService();

    private securityEventService =
        new SecurityEventService();

    async execute(
        username: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
        deviceFingerprint?: string

    ): Promise<LoginResult> {

        const deviceType =
            detectDeviceType(
                userAgent ?? ""
            );

        const browserName =
            detectBrowser(
                userAgent ?? ""
            );

        await this.rateLimitService
            .validate(
                username,
                ipAddress ?? ""
            );

        await this.rateLimitService
            .track(
                username,
                ipAddress ?? ""
            );





        try {

            /**
             * Sprint 1
             * Local OMS Authentication
             *
             * Sprint 2
             * Azure AD Validation
             */

            const user =
                await this.authRepository
                    .getUserByUsername(
                        username
                    );

            if (!user) {

                await this.authRepository
                    .createLoginHistory({
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        loginResult: "FAILED",
                        failureReason:
                            "INVALID_CREDENTIALS"
                    });

                await this.authRepository
                    .createFailedLoginAttempt({
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        failureReason:
                            "INVALID_USERNAME",
                    });

                await this.securityEventService.log(
                    SECURITY_EVENTS.LOGIN_FAILURE,
                    {
                        description: "INVALID_USERNAME",
                        ipAddress,
                        userAgent,
                    }
                );

                throw new Error(
                    "Invalid username or password"
                );
            }

            // ACCOUNT LOCKOUT CHECK
            const isLocked =
                await this.failedLoginService
                    .isLocked(
                        username
                    );

            if (isLocked) {

                await this.authRepository
                    .createFailedLoginAttempt({
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        failureReason:
                            "ACCOUNT_LOCKED",
                    });

                await this.authRepository
                    .createLoginHistory({
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        loginResult: "FAILED",
                        failureReason:
                            "ACCOUNT_LOCKED"
                    });


                // LOGS SECURITY EVENT
                await this.securityEventService.log(
                    SECURITY_EVENTS.ACCOUNT_LOCKED,
                    {
                        userId:
                            user.UserID,
                        ipAddress,
                        userAgent,
                    }
                );


                throw new Error(
                    "Invalid username or password"
                );
            }

            if (!user.IsActive) {

                await this.authRepository
                    .createLoginHistory({
                        userId: user.UserID,
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        loginResult: "FAILED",
                        failureReason:
                            "ACCOUNT_INACTIVE"
                    });
                throw new Error(
                    "Invalid username or password"
                );
            }

            const passwordValid =
                await this.authRepository
                    .validatePassword(
                        user.UserID,
                        password
                    );

            if (!passwordValid) {

                await this.failedLoginService
                    .registerFailure(
                        user.UserID,
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        "INVALID_PASSWORD"
                    );

                await this.authRepository
                    .createLoginHistory({
                        userId: user.UserID,
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        loginResult: "FAILED",
                        failureReason:
                            "INVALID_PASSWORD"
                    });

                await this.securityEventService.log(
                    SECURITY_EVENTS.LOGIN_FAILURE,
                    {
                        userId: user.UserID,
                        description:
                            "INVALID_PASSWORD",

                        ipAddress,

                        userAgent,
                    }
                );


                throw new Error(
                    "Invalid username or password"
                );
            }

            await this.failedLoginService
                .registerSuccess(
                    user.UserID
                );

            const loginSessionId =
                await this.sessionService
                    .createSession(
                        user.UserID,
                        ipAddress,
                        userAgent,
                        browserName,
                        deviceType,
                        deviceFingerprint
                    );

            const session =
                await this.authService
                    .getUserSession(
                        user.UserID
                    );

            session.loginSessionId =
                loginSessionId;

            const accessToken =
                jwt.sign(
                    {
                        userId:
                            session.userId,

                        loginSessionId:
                            loginSessionId,
                    },
                    process.env.JWT_SECRET!,
                    {
                        expiresIn: SECURITY.ACCESS_TOKEN_EXPIRY as any,
                        issuer: process.env.JWT_ISSUER || "OMS",
                        audience: process.env.JWT_AUDIENCE || "OMS_USERS",
                    }
                );
            const refreshToken =
                this.refreshTokenService.generate();

            const refreshHash =
                this.refreshTokenService.hash(
                    refreshToken
                );

            await this.sessionService
                .updateRefreshToken(
                    loginSessionId,
                    refreshHash
                );


            await this.authRepository
                .createLoginHistory({
                    userId: user.UserID,

                    username,

                    ipAddress,

                    userAgent,

                    loginSessionId,

                    deviceType,

                    browserName,

                    isSSOLogin: false,

                    loginResult: "SUCCESS"
                });


            // LOGS SECURITY EVENT
            await this.securityEventService.log(
                SECURITY_EVENTS.LOGIN_SUCCESS,
                {
                    userId:
                        user.UserID,
                    loginSessionId:
                        loginSessionId,
                    description: `Successfully logged in from ${userAgent} with IP ${ipAddress}`,
                }
            );

            return {
                accessToken,
                refreshToken,
                session,
            };

        } catch (error: unknown) {
            const err = error as Error;

            if (
                err.name ===
                "RateLimitExceededError"
            ) {
                throw err;
            }

            if (
                err.message !==
                "Invalid username or password"
            ) {

                await this.authRepository
                    .createLoginHistory({
                        username,
                        ipAddress,
                        userAgent,
                        deviceType,
                        browserName,
                        isSSOLogin: false,
                        loginResult: "FAILED",
                        failureReason:
                            "SYSTEM_ERROR"
                    });
            }

            throw error;
        }
    }
}
