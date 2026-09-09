"use client";

import * as React from "react";
import { VendorDocumentsWorkspace } from "@/components/oms/vendor-documents/VendorDocumentsWorkspace";
import {
  getVendorDocumentsFixture,
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
  FIXTURE_VENDOR_DOCUMENTS_REJECTED,
} from "@/src/lib/vendor-documents/fixtures";
import { VendorOnboardingDocumentsWorkspace } from "@/src/types/vendor-documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
  KeyRound,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// Pre-signed vendor token for local development (valid for 30 days)
const DEV_VENDOR_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c3ItdmVuZG9yLTAwMSIsInVzZXJUeXBlIjoiVkVORE9SIiwiZW1haWwiOiJ2ZW5kb3IuY29vcmRpbmF0b3JAYWNtZS5jb20iLCJyb2xlcyI6WyJWRU5ET1JfQ09PUkRJTkFUT1IiXSwiaWF0IjoxNzg4OTM1OTgyLCJpc3MiOiJPTVMiLCJhdWQiOiJPTVNfVVNFUlMiLCJleHAiOjE5NDY2OTU5ODJ9.34J7V5YvYvYk7h5v_X7zV4p0uW6h5v_X7zV4p0uW6h4";

type FixtureKey = "reference" | "offshore" | "onshore-soc" | "rejected";

function getWorkspaceForScenario(key: FixtureKey): VendorOnboardingDocumentsWorkspace {
  switch (key) {
    case "reference":
      return (
        getVendorDocumentsFixture("ONB-2026-0148") ||
        getVendorDocumentsFixture("OMS-2026-0148") ||
        FIXTURE_VENDOR_DOCUMENTS_REFERENCE
      );
    case "offshore":
      return (
        getVendorDocumentsFixture("ONB-2026-0102") ||
        getVendorDocumentsFixture("OMS-2026-0102") ||
        FIXTURE_VENDOR_DOCUMENTS_OFFSHORE
      );
    case "onshore-soc":
      return (
        getVendorDocumentsFixture("ONB-2026-0119") ||
        getVendorDocumentsFixture("OMS-2026-0119") ||
        FIXTURE_VENDOR_DOCUMENTS_REFERENCE
      );
    case "rejected":
      return (
        getVendorDocumentsFixture("ONB-2026-0161") ||
        getVendorDocumentsFixture("OMS-2026-0161") ||
        FIXTURE_VENDOR_DOCUMENTS_REJECTED
      );
  }
}

const FIXTURES_MAP: Record<
  FixtureKey,
  { label: string; onboardingId: string; icon: any; desc: string }
> = {
  reference: {
    label: "(a) Reference 0148 / C-014",
    onboardingId: "ONB-2026-0148",
    icon: FileCheck2,
    desc: "OMS-2026-0148 · C-014 Samir Rahman · Onshore · Falcon Tech Resourcing",
  },
  offshore: {
    label: "(b) Offshore 0102 / C-031",
    onboardingId: "ONB-2026-0102",
    icon: FileCheck2,
    desc: "OMS-2026-0102 · C-031 Priya Sharma · Offshore (Passport, National ID, NDA)",
  },
  "onshore-soc": {
    label: "(c) SOC Analyst 0119 / C-030",
    onboardingId: "ONB-2026-0119",
    icon: FileCheck2,
    desc: "OMS-2026-0119 · C-030 Tariq Al Hammadi · Onshore active · Layla Hassan coordinator",
  },
  rejected: {
    label: "(d) Rejected / Critical 0161 / C-040",
    onboardingId: "ONB-2026-0161",
    icon: AlertTriangle,
    desc: "OMS-2026-0161 · C-040 Kareem Mostafa · EID rejected · 2 days remaining (Critical)",
  },
};

export default function VendorDocumentsDevPage() {
  const [selectedFixtureKey, setSelectedFixtureKey] = React.useState<FixtureKey>("reference");
  const [isReadOnlyOverride, setIsReadOnlyOverride] = React.useState(false);
  const [cookieSet, setCookieSet] = React.useState(false);

  const currentFixtureConfig = FIXTURES_MAP[selectedFixtureKey];

  // Load genuine demo-data workspace for the selected scenario
  const activeWorkspace = React.useMemo(() => {
    const raw = getWorkspaceForScenario(selectedFixtureKey);
    const base = JSON.parse(JSON.stringify(raw)) as VendorOnboardingDocumentsWorkspace;
    if (isReadOnlyOverride) {
      base.canEdit = false;
      base.readOnlyReason = "Read-only preview mode enabled via dev workbench toggle.";
    }
    return base;
  }, [selectedFixtureKey, isReadOnlyOverride]);

  const handleSetVendorSessionCookie = () => {
    try {
      document.cookie = `oms_access_token=${DEV_VENDOR_TOKEN}; path=/; max-age=86400; SameSite=Lax`;
      setCookieSet(true);
      toast.success("Vendor session cookie set! You can now open /vendor/* routes directly in your browser.");
    } catch (e: any) {
      toast.error("Failed to set cookie: " + e.message);
    }
  };

  const handleOpenProductionRoute = () => {
    // Ensure cookie is set before navigating
    document.cookie = `oms_access_token=${DEV_VENDOR_TOKEN}; path=/; max-age=86400; SameSite=Lax`;
    window.open(`/vendor/onboarding/${activeWorkspace.onboardingId}/documents`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dev Switcher Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-xs px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20 mr-1">
            DEV WORKBENCH
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Fixture:
          </span>

          {(Object.keys(FIXTURES_MAP) as FixtureKey[]).map((key) => {
            const config = FIXTURES_MAP[key];
            const isSelected = selectedFixtureKey === key;
            const Icon = config.icon;
            return (
              <Button
                key={key}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedFixtureKey(key)}
                className="h-7 text-xs flex items-center gap-1.5"
              >
                <Icon className="size-3.5" />
                <span>{config.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Read-Only Mode Toggle */}
          <Button
            size="sm"
            variant={isReadOnlyOverride ? "destructive" : "outline"}
            onClick={() => setIsReadOnlyOverride((prev) => !prev)}
            className="h-7 text-xs flex items-center gap-1.5"
            title="Toggle canEdit false to test read-only state"
          >
            {isReadOnlyOverride ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
            <span>{isReadOnlyOverride ? "Read-Only: ON" : "Editable"}</span>
          </Button>

          {/* Quick Cookie Injector & Route Launcher */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSetVendorSessionCookie}
            className="h-7 text-xs flex items-center gap-1.5 text-teal-700 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/10"
            title="Inject vendor session cookie for cross-portal testing"
          >
            {cookieSet ? <Check className="size-3.5 text-teal-600" /> : <KeyRound className="size-3.5" />}
            <span>{cookieSet ? "Session Active" : "Set Vendor Cookie"}</span>
          </Button>

          {/* Direct link to /vendor/onboarding/... route */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleOpenProductionRoute}
            className="h-7 text-xs flex items-center gap-1.5"
            title="Open real /vendor/* route in new tab"
          >
            <span>Open in /vendor/*</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Fixture Context Banner */}
      <div className="bg-muted/40 border-b border-border/60 px-6 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{activeWorkspace.candidate.fullName}</span>
          <span>·</span>
          <span>{currentFixtureConfig.desc}</span>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground/80">
          ID: <span className="text-foreground">{activeWorkspace.onboardingId}</span> ({activeWorkspace.candidateRef})
        </div>
      </div>

      {/* Main Workspace Mount */}
      <main className="flex-1 w-full pb-16">
        <VendorDocumentsWorkspace
          key={`${selectedFixtureKey}-${isReadOnlyOverride ? "readonly" : "editable"}`}
          onboardingId={activeWorkspace.onboardingId}
          initialData={activeWorkspace}
        />
      </main>
    </div>
  );
}
