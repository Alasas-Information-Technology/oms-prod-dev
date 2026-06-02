import jwt from "jsonwebtoken";

import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { AuthService }
    from "@/lib/services/AuthService";

import { SessionService }
    from "@/lib/services/SessionService";

import {
    detectBrowser
} from "@/lib/utils/browserDetector";

import {
    detectDeviceType
} from "@/lib/utils/deviceDetector";

export interface LoginResult {
    accessToken: string;
    session: any;
}

export class LoginUseCase {

    private authRepository =
        new AuthRepository();

    private authService =
        new AuthService();

    private sessionService =
        new SessionService();

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
                            "User not found"
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
                            "Account inactive"
                    });

                throw new Error(
                    "Account inactive"
                );
            }

            /**
             * TODO:
             * Sprint 2
             * Validate Password / Azure AD
             */

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

        } catch (error: any) {

            /**
             * Unexpected Error Logging
             */

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
                        error.message
                });

            throw error;
        }
    }
}