import { NextRequest, NextResponse } from "next/server";
import { CAST } from "@/src/lib/demo-data/cast";
import { signPersonaToken } from "@/src/lib/demo-data/persona-auth";

export const dynamic = "force-dynamic";

/**
 * RETIRED: Persona Switcher Cookie Injection Endpoint
 *
 * Superseded by docs/PORTAL-SEPARATION-AND-USERS.md Part 4 & 5.
 * Real authentication through /api/auth/login with seeded credentials (Demo@2026!)
 * is the single source of truth for user sessions.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "The persona switcher cookie injection mechanism has been retired per docs/PORTAL-SEPARATION-AND-USERS.md Part 5. Please authenticate via the real login page (/login) with seeded credentials.",
    },
    { status: 410 }
  );
}
