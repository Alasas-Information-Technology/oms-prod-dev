export interface ActiveSession {
    loginSessionId: string;

    ipAddress: string;

    browserName: string;

    deviceType: string;

    createdAt: Date;

    lastActivityAt: Date;

    expiresAt: Date;

    isCurrentSession: boolean;
}