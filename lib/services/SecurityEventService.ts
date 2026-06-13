import { AuthRepository }
    from "@/lib/repositories/AuthRepository";
import { securityEventBus } from "@/lib/events/securityEventBus";

export class SecurityEventService {

    private authRepository =
        new AuthRepository();

    async log(
        eventType: string,
        options?: {
            userId?: string;
            loginSessionId?: string;
            description?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ) {

        await this.authRepository
            .createSecurityEvent({
                userId:
                    options?.userId,

                loginSessionId:
                    options?.loginSessionId,

                eventType,

                eventDescription:
                    options?.description,

                ipAddress:
                    options?.ipAddress,

                userAgent:
                    options?.userAgent,
            });

        securityEventBus.emit("security-event");
    }
}