import { SessionRepository }
    from "@/lib/repositories/SessionRepository";

export class ActiveSessionService {

    private repository =
        new SessionRepository();

    async getSessions(
        userId: string,
        currentSessionId: string
    ) {

        const sessions =
            await this.repository
                .getUserSessions(
                    userId
                );

        return sessions.map(
            session => ({
                loginSessionId:
                    session.LoginSessionID,

                ipAddress:
                    session.IPAddress,

                browserName:
                    session.BrowserName,

                deviceType:
                    session.DeviceType,

                createdAt:
                    session.LoginAt,

                lastActivityAt:
                    session.LastActivityAt,

                expiresAt:
                    session.ExpiresAt,

                isCurrentSession:
                    session.LoginSessionID ===
                    currentSessionId
            })
        );
    }
}