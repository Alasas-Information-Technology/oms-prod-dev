import * as React from "react";
import type { Metadata } from "next";
import { getCandidatePortalData } from "@/src/lib/demo-data/queries";
import { CandidatePortalWorkspace } from "@/components/oms/candidate-portal/CandidatePortalWorkspace";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = getCandidatePortalData(token);

  if (!data || !data.valid) {
    return {
      title: "Access Link Inactive | DIEZ OMS",
      description: "Candidate onboarding access link is no longer valid.",
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `Your Joining Readiness · ${data.onboardingCase} | DIEZ OMS`,
    description: `Joining readiness portal for ${data.position}`,
    robots: "noindex, nofollow",
  };
}

export default async function CandidatePortalPage({ params }: PageProps) {
  const { token } = await params;
  const data = getCandidatePortalData(token);

  return <CandidatePortalWorkspace token={token} initialData={data} />;
}
