import { getDb }
    from "@/lib/db";

export class RateLimitRepository {

    async recordRequest(
        username?: string,
        ipAddress?: string,
        endpoint?: string
    ): Promise<void> {

        const db = await getDb();

        await db
            .request()
            .input(
                "Username",
                username ?? null
            )
            .input(
                "IPAddress",
                ipAddress ?? ""
            )
            .input(
                "Endpoint",
                endpoint ?? ""
            )
            .query(`
                INSERT INTO
                auth.RateLimitEvents
                (
                    Username,
                    IPAddress,
                    Endpoint
                )
                VALUES
                (
                    @Username,
                    @IPAddress,
                    @Endpoint
                )
            `);
    }

    async getIpRequestCount(
        ipAddress: string,
        minutes: number
    ): Promise<number> {

        const db = await getDb();

        const result = await db
            .request()
            .input(
                "IPAddress",
                ipAddress
            )
            .input(
                "Minutes",
                minutes
            )
            .query(`
                SELECT
                    COUNT(*) AS Total
                FROM auth.RateLimitEvents
                WHERE IPAddress =
                    @IPAddress
                AND CreatedAt >
                    DATEADD(
                        MINUTE,
                        -@Minutes,
                        SYSUTCDATETIME()
                    )
            `);

        return result
            .recordset[0]
            .Total;
    }

    async getUsernameRequestCount(
        username: string,
        minutes: number
    ): Promise<number> {

        const db = await getDb();

        const result = await db
            .request()
            .input(
                "Username",
                username
            )
            .input(
                "Minutes",
                minutes
            )
            .query(`
                SELECT
                    COUNT(*) AS Total
                FROM auth.RateLimitEvents
                WHERE Username =
                    @Username
                AND CreatedAt >
                    DATEADD(
                        MINUTE,
                        -@Minutes,
                        SYSUTCDATETIME()
                    )
            `);

        return result
            .recordset[0]
            .Total;
    }
}