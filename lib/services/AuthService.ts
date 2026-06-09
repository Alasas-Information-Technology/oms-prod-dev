import jwt from "jsonwebtoken";

import { AuthRepository } from "@/lib/repositories/AuthRepository";

import { SessionService } from "./SessionService";

import {
    JwtPayload,
    UserSession
} from "@/lib/types/auth.types";
import { getDb } from "../db";

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

    async login(
        username: string,
        password: string
    ) {

        // TEMP
        // replace later with AD

        const user =
            await this.authRepository
                .getUserByUsername(
                    username
                );

        if (!user) {
            throw new Error(
                "Invalid username"
            );
        }

        const loginSessionId =
            await this.sessionService
                .createSession(
                    user.UserID
                );

        const session =
            await this.getUserSession(
                user.UserID
            );

        session.loginSessionId =
            loginSessionId;

        const token =
            jwt.sign(
                {
                    userId: session.userId,
                    loginSessionId,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: "1d",
                    issuer: process.env.JWT_ISSUER,
                    audience: process.env.JWT_AUDIENCE,
                }
            );

        return {
            accessToken: token,
            session,
        };
    }

    async validateFingerprint(
        loginSessionId: string,
        deviceId: string
    ): Promise<boolean> {

        const db = await getDb();

        const result = await db
            .request()
            .input(
                "LoginSessionID",
                loginSessionId
            )
            .query(`
            SELECT
                DeviceFingerprint
            FROM auth.LoginSessions
            WHERE LoginSessionID =
                @LoginSessionID
            AND IsActive = 1
        `);


        if (
            result.recordset.length === 0
        ) {
            return false;
        }

        const storedFingerprint =
            result.recordset[0]
                .DeviceFingerprint;

        const currentFingerprint =
            `${deviceId}`;

        return (
            storedFingerprint.toUpperCase() ===
            currentFingerprint.toUpperCase()
        );
    }

}