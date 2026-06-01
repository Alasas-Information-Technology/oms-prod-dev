import jwt from "jsonwebtoken";

import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { SessionService }
    from "./SessionService";

import {
    JwtPayload,
    UserSession
} from "@/lib/types/auth.types";

export class AuthService {

    private authRepository =
        new AuthRepository();

    private sessionService =
        new SessionService();

    async validateToken(
        token: string
    ): Promise<UserSession> {

        const payload =
            jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as JwtPayload;

        const validSession =
            await this.sessionService
                .validateSession(
                    payload.loginSessionId
                );

        if (!validSession) {
            throw new Error(
                "Session expired"
            );
        }

        const user =
            await this.authRepository
                .getUserSessionData(
                    payload.userId
                );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        return {
            userId: user.userId,

            username: user.username,

            email: user.email,

            userType: user.userType,

            roles: user.roles,

            permissions: user.permissions,

            scopes: user.scopes,

            loginSessionId:
                payload.loginSessionId,
        };
    }

    async getUserSession(
        userId: string
    ): Promise<UserSession> {

        const user =
            await this.authRepository
                .getUserSessionData(
                    userId
                );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        return {
            userId: user.userId,

            username: user.username,

            email: user.email,

            userType: user.userType,

            roles: user.roles,

            permissions: user.permissions,

            scopes: user.scopes,

            loginSessionId: "",
        };
    }
}