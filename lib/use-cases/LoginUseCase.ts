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

export interface LoginResult {
    accessToken: string;
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

    async execute(
        username: string,
        password: string,
        ipAddress?: string,
        userAgent?: string
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

            throw new Error(
                "Invalid username or password"
            );
        }


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
                        user.UserID
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
                        expiresIn: "1d",
                        issuer: "OMS",
                        audience: "OMS_USERS",
                    }
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

            return {
                accessToken,
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
