import { NextRequest } from "next/server";
import { SecurityRepository } from "@/lib/repositories/SecurityRepository";
import { GetSecurityDashboardDataUseCase } from "@/lib/use-cases/security-dashboard/GetSecurityDashboardDataUseCase";
import {
    GetFailedLoginsUseCase,
    SecurityEventsByTypeUseCase,
    SessionsByDeviceUseCase,
    SessionsByRoleUseCase,
    LoginTrendUseCase,
    ReplayEventsUseCase,
    LockedAccountsUseCase,
    SessionsCreatedPerDayUseCase
} from "@/lib/use-cases/security-dashboard/chartsUseCase";
import { authorize } from "@/lib/auth/authorization";
import { securityEventBus } from "@/lib/events/securityEventBus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {

    try {
        await authorize(request, ["SECURITY.DASHBOARD.VIEW"]);
    } catch (error) {
        return new Response("Unauthorized", { status: 401 });
    }

    const repository = new SecurityRepository();

    const getDashboardData = new GetSecurityDashboardDataUseCase(repository);
    const getFailedLogins = new GetFailedLoginsUseCase(repository);
    const getSecurityEventsByType = new SecurityEventsByTypeUseCase(repository);
    const getSessionsByDevice = new SessionsByDeviceUseCase(repository);
    const getSessionsByRole = new SessionsByRoleUseCase(repository);
    const getLoginTrend = new LoginTrendUseCase(repository);
    const getReplayEvents = new ReplayEventsUseCase(repository);
    const getLockedAccounts = new LockedAccountsUseCase(repository);
    const getSessionsCreatedPerDay = new SessionsCreatedPerDayUseCase(repository);

    const encoder = new TextEncoder();

    const fetchAllData = async () => {
        const [
            dashboard,
            failedLogins,
            securityEventsByType,
            sessionsByDevice,
            sessionsByRole,
            loginTrend,
            replayEvents,
            lockedAccounts,
            sessionsCreatedPerDay
        ] = await Promise.all([
            getDashboardData.execute(),
            getFailedLogins.execute(),
            getSecurityEventsByType.execute(),
            getSessionsByDevice.execute(),
            getSessionsByRole.execute(),
            getLoginTrend.execute(),
            getReplayEvents.execute(),
            getLockedAccounts.execute(),
            getSessionsCreatedPerDay.execute()
        ]);

        return {
            dashboard,
            failedLogins,
            securityEventsByType,
            sessionsByDevice,
            sessionsByRole,
            loginTrend,
            replayEvents,
            lockedAccounts,
            sessionsCreatedPerDay
        };
    };

    let isClosed = false;
    let listener: (() => void) | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const responseStream = new ReadableStream({
        async start(controller) {
            let isFetching = false;
            let pendingFetch = false;

            const sendUpdate = async () => {
                if (isClosed) return;

                if (isFetching) {
                    pendingFetch = true;
                    return;
                }

                isFetching = true;
                try {
                    const data = await fetchAllData();
                    if (!isClosed) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    }
                } catch (err) {
                    console.error("SSE fetch error:", err);
                } finally {
                    isFetching = false;
                    if (pendingFetch && !isClosed) {
                        pendingFetch = false;
                        sendUpdate(); // run again to catch up
                    }
                }
            };

            // Send initial data immediately
            sendUpdate();

            // Setup event bus listener with 100ms debounce
            let timeoutId: NodeJS.Timeout | null = null;
            listener = () => {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    timeoutId = null;
                    sendUpdate();
                }, 100);
            };
            securityEventBus.on("security-event", listener);

            // Keep-alive/fallback interval (30 seconds)
            intervalId = setInterval(() => {
                sendUpdate();
            }, 30000);
        },
        cancel() {
            isClosed = true;
            if (listener) {
                securityEventBus.off("security-event", listener);
            }
            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    });

    return new Response(responseStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        },
    });
}
