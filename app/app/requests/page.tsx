import { Suspense } from "react";
import {
  RequestWorkspace,
} from "@/components/oms/requests";

export default function AllRequestsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading requests...</div>}>
      <RequestWorkspace mode="all" />
    </Suspense>
  );
}