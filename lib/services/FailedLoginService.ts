import { AuthRepository }
    from "@/lib/repositories/AuthRepository";

import { SECURITY }
    from "@/lib/constants/security";

export class FailedLoginService {

    private authRepository =
        new AuthRepository();

    private readonly MAX_FAILED_ATTEMPTS =
        SECURITY.MAX_FAILED_ATTEMPTS;

    private readonly LOCKOUT_MINUTES =
        SECURITY.LOCKOUT_MINUTES;

    async isLocked(
        username: string
    ): Promise<boolean> {

        const securityInfo =
            await this.authRepository
                .getUserSecurityInfo(
                    username
                );

        if (!securityInfo) {
            return false;
        }

        if (!securityInfo.lockedUntil) {
            return false;
        }

        return (
            new Date(
                securityInfo.lockedUntil
            ) > new Date()
        );
    }

    async registerFailure(
        userId: string,
        username: string,
        ipAddress?: string,
        userAgent?: string,
        deviceType?: string,
        browserName?: string,
        failureReason?: string
    ): Promise<void> {

        await this.authRepository
            .createFailedLoginAttempt({
                userId,
                username,
                ipAddress,
                userAgent,
                deviceType,
                browserName,
                isSSOLogin: false,
                failureReason,
            });

        await this.authRepository
            .recordFailedLogin(
                userId
            );

        const failedCount =
            await this.authRepository
                .getFailedLoginCount(
                    userId
                );

        if (
            failedCount >=
            this.MAX_FAILED_ATTEMPTS
        ) {

            await this.authRepository
                .lockUser(
                    userId,
                    this.LOCKOUT_MINUTES
                );
        }
    }

    async registerSuccess(
        userId: string,
    ): Promise<void> {

        //-------------------------------------------------
        // Reset User State
        //-------------------------------------------------

        await this.authRepository
            .resetFailedLogin(
                userId
            );
    }

    async unlockUser(
        userId: string
    ): Promise<void> {

        await this.authRepository
            .unlockUser(
                userId
            );
    }

    async getSecurityInfo(
        username: string
    ) {

        return await this.authRepository
            .getUserSecurityInfo(
                username
            );
    }
}