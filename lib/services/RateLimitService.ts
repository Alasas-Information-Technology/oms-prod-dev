import {
    RateLimitRepository
} from "@/lib/repositories/RateLimitRepository";

export class RateLimitExceededError
    extends Error {

    constructor() {
        super(
            "Too many login attempts. Please try again later."
        );
    }
}

export class RateLimitService {

    private repository =
        new RateLimitRepository();

    private readonly MAX_IP_ATTEMPTS = 10;

    private readonly MAX_USER_ATTEMPTS = 5;

    private readonly WINDOW_MINUTES = 5;

    async validate(
        username: string,
        ipAddress: string
    ): Promise<void> {

        const ipCount =
            await this.repository
                .getIpRequestCount(
                    ipAddress,
                    this.WINDOW_MINUTES
                );

        if (
            ipCount >=
            this.MAX_IP_ATTEMPTS
        ) {

            throw new RateLimitExceededError();
        }

        const userCount =
            await this.repository
                .getUsernameRequestCount(
                    username,
                    this.WINDOW_MINUTES
                );

        if (
            userCount >=
            this.MAX_USER_ATTEMPTS
        ) {

            throw new Error(
                "Too many requests"
            );
        }
    }

    async track(
        username: string,
        ipAddress: string
    ): Promise<void> {

        await this.repository
            .recordRequest(
                username,
                ipAddress,
                "/api/auth/login"
            );
    }
}