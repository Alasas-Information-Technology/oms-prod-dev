"use client";

import { useState } from "react";
import { useMyApprovals } from "@/hooks/useApprovals";
import { ApprovalsTabs, ApprovalsTab } from "./ApprovalsTabs";
import { ApprovalsTable } from "./ApprovalsTable";
import { Loader2 } from "lucide-react";

export function ApprovalsInbox() {
  const currentUserId = "u-101"; // Mock ID for Khalid Al Suwaidi

  const [activeTab, setActiveTab] = useState<ApprovalsTab>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useMyApprovals({
    type: activeTab,
    page,
    pageSize,
  });

  const handleTabChange = (newTab: ApprovalsTab) => {
    setActiveTab(newTab);
    setPage(1); // Reset to page 1 on tab change
  };

  const counts = data?.counts || {
    all: 0,
    requisition: 0,
    budget: 0,
    other: 0,
    breached: 0,
  };

  const totalCount = activeTab === "all" ? counts.all :
                     activeTab === "requisition" ? counts.requisition :
                     activeTab === "budget" ? counts.budget :
                     activeTab === "overdue" ? counts.breached : counts.other;

  const pageCount = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-6">
        <ApprovalsTabs
          value={activeTab}
          onValueChange={handleTabChange}
          counts={counts}
        />

        <div className="px-6">
          <ApprovalsTable
            data={data?.items || []}
            isLoading={isLoading}
            totalCount={totalCount}
            pageCount={pageCount}
            pageIndex={page - 1}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p + 1)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
