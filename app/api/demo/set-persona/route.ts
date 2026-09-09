import { NextRequest, NextResponse } from "next/server";
import { CAST } from "@/src/lib/demo-data/cast";
import { signPersonaToken } from "@/src/lib/demo-data/persona-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const personaId = body?.personaId;

    if (!personaId || !CAST[personaId]) {
      return NextResponse.json(
        { success: false, message: `Invalid personaId: ${personaId}` },
        { status: 400 }
      );
    }

    const person = CAST[personaId];
    const token = body?.token || (await signPersonaToken(person));

    const response = NextResponse.json({
      success: true,
      persona: person,
      token,
    });

    // Set cookie across the entire domain
    response.cookies.set("oms_access_token", token, {
      path: "/",
      maxAge: 2592000, // 30 days
      sameSite: "lax",
      httpOnly: false, // Accessible to client scripts and HTTP requests alike
    });

    return response;
  } catch (error: any) {
    console.error("[set-persona error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
