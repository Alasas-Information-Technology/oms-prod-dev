import crypto from "crypto";

export class RefreshTokenService {

    generate(): string {

        return crypto
            .randomBytes(64)
            .toString("hex");
    }

    hash(
        token: string
    ): string {

        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    }

    compare(
        token: string,
        storedHash: string
    ): boolean {

        const hash =
            this.hash(token);

        return hash === storedHash;
    }
}