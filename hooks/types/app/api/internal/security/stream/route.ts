import { NextRequest } from "next/server";
import { proxySSEToBackend } from "@/lib/api/backend-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    return proxySSEToBackend(request, "/api/v1/internal/security/stream");
}
