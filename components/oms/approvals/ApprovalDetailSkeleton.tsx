"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ApprovalDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className="w-full py-6">
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              {i !== 5 && <Skeleton className="h-[2px] w-12" />}
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Body Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* Left Column (Main Subject Details) */}
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        
        {/* Right Column (Decision & Impact) */}
        <div className="space-y-6">
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
