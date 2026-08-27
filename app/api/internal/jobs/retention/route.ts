import { proxyToBackend } from "@/lib/api/backend-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    return proxyToBackend(request, "/api/v1/internal/jobs/retention");
}
