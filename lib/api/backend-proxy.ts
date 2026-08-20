import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:4000";

/**
 * Builds standard forwardable headers from incoming Next.js request.
 */
export function buildBackendHeaders(request: NextRequest): Headers {
    const headers = new Headers();

    const token =
        request.cookies.get("oms_access_token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    } else if (request.headers.get("authorization")) {
        headers.set("Authorization", request.headers.get("authorization")!);
    }

    const forwardHeaders = [
        "cookie",
        "x-user-id",
        "x-email",
        "x-roles",
        "x-permissions",
        "x-scopes",
        "x-login-session-id",
        "x-correlation-id",
        "x-forwarded-for",
        "user-agent",
        "content-type",
    ];

    for (const headerName of forwardHeaders) {
        const val = request.headers.get(headerName);
        if (val) {
            headers.set(headerName, val);
        }
    }

    return headers;
}

/**
 * Proxies a Next.js API request to the NestJS backend and returns the unwrapped data payload.
 */
export async function proxyToBackend(
    request: NextRequest,
    backendPath: string,
    options?: { unwrapEnvelope?: boolean }
): Promise<NextResponse> {
    const unwrapEnvelope = options?.unwrapEnvelope ?? true;
    const queryString = request.nextUrl.search;
    const targetUrl = `${BACKEND_BASE_URL}${backendPath}${queryString}`;
    const headers = buildBackendHeaders(request);

    try {
        const fetchOptions: RequestInit = {
            method: request.method,
            headers,
            cache: "no-store",
        };

        if (request.method !== "GET" && request.method !== "HEAD") {
            try {
                fetchOptions.body = await request.text();
            } catch {
                // Ignore if body is empty or unavailable
            }
        }

        const backendResponse = await fetch(targetUrl, fetchOptions);

        // If backend returned non-OK status, forward the error
        if (!backendResponse.ok) {
            try {
                const errorData = await backendResponse.json();
                return NextResponse.json(
                    errorData?.error || errorData || { message: "Backend error" },
                    { status: backendResponse.status }
                );
            } catch {
                const errorText = await backendResponse.text();
                return new NextResponse(errorText || "Backend error", {
                    status: backendResponse.status,
                });
            }
        }

        const data = await backendResponse.json();

        // If data is enveloped ({ success: true, data: ..., meta: ... }), unwrap data for frontend
        if (unwrapEnvelope && data && typeof data === "object" && data.success === true && "data" in data) {
            return NextResponse.json(data.data);
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`[backend-proxy] Error proxying to ${targetUrl}:`, error);
        return NextResponse.json(
            { message: "Failed to communicate with backend service", error: error?.message },
            { status: 502 }
        );
    }
}

/**
 * Proxies an SSE stream to the NestJS backend.
 */
export async function proxySSEToBackend(
    request: NextRequest,
    backendPath: string
): Promise<Response> {
    const queryString = request.nextUrl.search;
    const targetUrl = `${BACKEND_BASE_URL}${backendPath}${queryString}`;
    const headers = buildBackendHeaders(request);

    try {
        const backendResponse = await fetch(targetUrl, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!backendResponse.ok || !backendResponse.body) {
            return new Response(
                backendResponse.statusText || "Failed to establish SSE stream",
                { status: backendResponse.status || 502 }
            );
        }

        return new Response(backendResponse.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error: any) {
        console.error(`[backend-proxy] SSE proxy error for ${targetUrl}:`, error);
        return new Response("Failed to connect to backend event stream", { status: 502 });
    }
}
