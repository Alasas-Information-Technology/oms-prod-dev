"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function SectionsRedirectPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/app/administration/master-data/organization?view=grouped&type=4");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-muted-foreground">
      Redirecting to Organization Grouped Directory...
    </div>
  );
}
