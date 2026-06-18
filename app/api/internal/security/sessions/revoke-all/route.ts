import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/authorization";
import { SessionService } from "@/lib/services/SessionService";

export async function POST(request: NextRequest) {
    try {
        await authorize(request, ["SECURITY.ADMIN"]);

        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const sessionService = new SessionService();
        await sessionService.revokeAllSessionsSystemWide(userId);

        return NextResponse.json({ success: true, message: "Successfully revoked all sessions." });
    } catch (error: any) {
        console.error("Failed to force logout all users:", error);
        return NextResponse.json(
            { message: error.message || "Failed to force logout all users." },
            { status: error.status || 500 }
        );
    }
}
