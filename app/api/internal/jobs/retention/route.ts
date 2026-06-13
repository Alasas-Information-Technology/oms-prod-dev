import { NextRequest, NextResponse } from "next/server";
import { RetentionService } from "@/lib/services/RetentionService";

export async function POST(request: NextRequest) {
    try {
        // Simple security check to ensure this is called internally or via authorized CRON scheduler
        const authHeader = request.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const retentionService = new RetentionService();
        await retentionService.executeCleanup();

        return NextResponse.json({
            success: true,
            message: "Retention cleanup executed successfully."
        });

    } catch (error: any) {
        console.error("Failed to execute retention cleanup:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );
    }
}
