import { NextRequest, NextResponse } from "next/server";
import { buildBackendHeaders } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
    const queryString = request.nextUrl.search;
    const targetUrl = `${BACKEND_BASE_URL}/api/v1/organization/units/export${queryString}`;
    const headers = buildBackendHeaders(request);

    try {
        const backendResponse = await fetch(targetUrl, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!backendResponse.ok) {
            try {
                const errorData = await backendResponse.json();
                return NextResponse.json(
                    errorData?.error || errorData || { message: "Export failed" },
                    { status: backendResponse.status }
                );
            } catch {
                const errorText = await backendResponse.text();
                return new NextResponse(errorText || "Export failed", {
                    status: backendResponse.status,
                });
            }
        }

        const contentType = backendResponse.headers.get("content-type") || "";

        // If JSON response (e.g. 202 Accepted with queued jobId)
        if (contentType.includes("application/json")) {
            const data = await backendResponse.json();
            const payload = data && data.success && data.data ? data.data : data;
            return NextResponse.json(payload, { status: backendResponse.status });
        }

        // Stream binary Excel file (.xlsx)
        const arrayBuffer = await backendResponse.arrayBuffer();
        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", contentType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const contentDisposition = backendResponse.headers.get("content-disposition");
        if (contentDisposition) {
            responseHeaders.set("Content-Disposition", contentDisposition);
        }

        return new NextResponse(arrayBuffer, {
            status: backendResponse.status,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error(`[export-proxy] Error proxying export request:`, error);
        return NextResponse.json(
            { message: "Failed to stream export from backend", error: error?.message },
            { status: 502 }
        );
    }
}
