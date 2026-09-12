import { NextRequest, NextResponse } from "next/server";
import { getCandidatePortalData } from "@/src/lib/demo-data/queries";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { token } = await params;

  if (!token || typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      {
        valid: false,
        code: "INVALID_TOKEN",
        message: "This link is no longer valid. Contact your onboarding coordinator for a new one.",
      },
      { status: 400 }
    );
  }

  const portalData = getCandidatePortalData(token.trim());

  if (!portalData || !portalData.valid) {
    return NextResponse.json(
      {
        valid: false,
        code: "INVALID_TOKEN",
        message: "This link is no longer valid. Contact your onboarding coordinator for a new one.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(portalData, { status: 200 });
}
