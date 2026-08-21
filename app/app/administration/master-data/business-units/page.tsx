"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function BusinessUnitsRedirectPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/app/administration/master-data/organization?view=grouped&type=2");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-muted-foreground">
      Redirecting to Organisation Grouped Directory...
    </div>
  );
}
