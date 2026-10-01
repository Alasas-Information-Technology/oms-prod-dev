import { Suspense } from "react";
import { HrReviewWorkspace } from "@/components/oms/hr-review";
import { Skeleton } from "@/components/ui/skeleton";

export default function HrReviewPage() {
  return (
    <div className="min-w-0 p-4 sm:p-6">
      <Suspense fallback={<Skeleton className="h-[800px] w-full rounded-xl" />}>
        <HrReviewWorkspace />
      </Suspense>
    </div>
  );
}