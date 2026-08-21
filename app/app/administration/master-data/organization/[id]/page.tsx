"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgUnitDetailView } from "@/components/organization/OrgUnitDetailView";

export default function OrgUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgUnitId = params.id as string;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Back Button Navigation (Preserves tree expansion state in sessionStorage) */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/app/administration/master-data/organization">
            <ArrowLeft className="h-4 w-4" />
            Back to Organization Explorer
          </Link>
        </Button>
      </div>

      {/* Main Unit Detail View with Tabs */}
      <OrgUnitDetailView
        unitId={orgUnitId}
        isPushedRoute={true}
        onNavigateUnit={(targetId) => {
          if (!targetId) {
            router.push("/app/administration/master-data/organization");
          } else {
            router.push(`/app/administration/master-data/organization/${targetId}`);
          }
        }}
      />
    </div>
  );
}
