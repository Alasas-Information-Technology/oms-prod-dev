"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageBarActions, usePageBar } from "@/components/ui/layouts/page-bar-context";
import {
  BudgetHeaderActions,
  BudgetKpiStrip,
  FundStateBar,
  BudgetFilterRow,
  BudgetFilterValues,
  BudgetLinesTable,
  BudgetRequestsSection,
  PeriodGovernancePanel,
  FundMovementsPanel,
  SafeguardsPanel,
  UploadBudgetDialog,
  ManagePeriodDialog,
  PeriodClosedNotice,
} from "@/components/budget";
import { useBudgetSummary, useBudgetPeriod, useBudgetLines } from "@/hooks/useBudget";
import { Skeleton } from "@/components/ui/skeleton";
import { IBudgetLineDto } from "@/lib/types/budget.types";

function BudgetControlCenterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCustomCrumbs } = usePageBar();

  // Period Selection State (governs the whole page per Part 2.3)
  const initialPeriod = searchParams.get("period") || "period-fy26";
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(initialPeriod);

  // Pagination & Sorting State for Budget Lines Table
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Single-Row Selection State (Drives Fund movements panel §2.1)
  const [selectedLineId, setSelectedLineId] = React.useState<string | null>("line-cs-dig-002");

  // Filter Row State initialized from URL search params
  const [filters, setFilters] = React.useState<BudgetFilterValues>({
    orgUnitId: searchParams.get("org") || undefined,
    businessUnitId: searchParams.get("bu") || undefined,
    departmentId: searchParams.get("dept") || undefined,
    search: searchParams.get("q") || searchParams.get("search") || undefined,
  });

  // Keep URL query params synchronized with active filters (Shareable & Back-button safe per Part 5.4)
  const updateUrlParams = React.useCallback(
    (newFilters: BudgetFilterValues, period: string) => {
      const params = new URLSearchParams();
      if (period && period !== "period-fy26") params.set("period", period);
      if (newFilters.orgUnitId) params.set("org", newFilters.orgUnitId);
      if (newFilters.businessUnitId) params.set("bu", newFilters.businessUnitId);
      if (newFilters.departmentId) params.set("dept", newFilters.departmentId);
      if (newFilters.search) params.set("q", newFilters.search);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = React.useCallback(
    (newFilters: BudgetFilterValues) => {
      setFilters(newFilters);
      setPage(1); // Reset to first page on filter change
      updateUrlParams(newFilters, selectedPeriod);
    },
    [selectedPeriod, updateUrlParams]
  );

  const handlePeriodChange = React.useCallback(
    (newPeriod: string) => {
      setSelectedPeriod(newPeriod);
      updateUrlParams(filters, newPeriod);
    },
    [filters, updateUrlParams]
  );

  // Modal Dialog States
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [managePeriodDialogOpen, setManagePeriodDialogOpen] = React.useState(false);

  // Set explicit Page Bar Breadcrumbs on mount
  React.useEffect(() => {
    setCustomCrumbs([
      { label: "Administration", href: "/app/administration" },
      { label: "Budget", href: "/app/budget" },
      { label: "Budget Control Center", isCurrent: true },
    ]);
    return () => setCustomCrumbs(null);
  }, [setCustomCrumbs]);

  // Fetch Scope-Filtered Budget Summary (Recalculates on filter change per Part 5.5)
  const { data: summaryData, isLoading: isSummaryLoading } = useBudgetSummary({
    periodId: selectedPeriod,
    orgUnitId: filters.orgUnitId,
    businessUnitId: filters.businessUnitId,
    departmentId: filters.departmentId,
    ...(filters.search ? { search: filters.search } : {}),
  } as any);

  // Fetch Paginated Budget Lines Table (Step 0 Framework per Part 3 & B4)
  const { data: linesData, isLoading: isLinesLoading } = useBudgetLines({
    periodId: selectedPeriod,
    orgUnitId: filters.orgUnitId,
    businessUnitId: filters.businessUnitId,
    departmentId: filters.departmentId,
    search: filters.search,
    page,
    limit: pageSize,
  });

  // Fetch Period Governance Data
  const { data: periodData, isLoading: isPeriodLoading } = useBudgetPeriod(selectedPeriod);

  const isClosed = periodData ? periodData.status === "CLOSED" : false;
  const periodCode = periodData?.code || "FY 2026";

  // Reconciled figure fallbacks if loading
  const totalFils = summaryData?.totalFils ?? BigInt("2480000000");
  const availableFils = summaryData?.availableFils ?? BigInt("1020000000");
  const reservedFils = summaryData?.reservedFils ?? BigInt("540000000");
  const lockedFils = summaryData?.lockedFils ?? BigInt("710000000");
  const consumedFils = summaryData?.consumedFils ?? BigInt("210000000");

  const selectedLine = linesData?.items.find((l) => l.id === selectedLineId);

  return (
    <div className="p-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Page Bar Portal Actions (Top 56px sticky bar per Part 3) ── */}
      <PageBarActions>
        <BudgetHeaderActions
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          periodData={periodData}
          onOpenUploadDialog={() => setUploadDialogOpen(true)}
          onOpenManagePeriodDialog={() => setManagePeriodDialogOpen(true)}
        />
      </PageBarActions>

      {/* ── Closed Period Informative Banner (Part 6) ── */}
      {isClosed && (
        <PeriodClosedNotice
          periodCode={periodCode}
          onRequestReopen={() => setManagePeriodDialogOpen(true)}
        />
      )}

      {/* ── 1. KPI Summary Cards Strip (5 Cards — Total distinct per Part 3 & 4) ── */}
      <BudgetKpiStrip
        summary={summaryData}
        isLoading={isSummaryLoading}
      />

      {/* ── 2. Fund State Stacked Bar with Interactive Legend (Part 3 & B2) ── */}
      <FundStateBar
        title={`${periodCode} Fund Distribution`}
        totalFils={totalFils}
        availableFils={availableFils}
        reservedFils={reservedFils}
        lockedFils={lockedFils}
        consumedFils={consumedFils}
      />

      {/* ── 3. Scope-Aware Cascading Filter Row (Org, BU, Dept, Search per Part 3 & 5) ── */}
      <BudgetFilterRow
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* ── 4. Main Control Center Grid (Part 3: 1fr 420px, responsive stack under 1280px) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Left Column: Budget Lines Table + Requests & Exceptions Section */}
        <div className="space-y-8 min-w-0">
          <BudgetLinesTable
            lines={linesData?.items || []}
            totalCount={linesData?.meta?.totalItems || 0}
            pageCount={linesData?.meta?.totalPages || 1}
            pageIndex={page - 1}
            pageSize={pageSize}
            isLoading={isLinesLoading}
            selectedLineId={selectedLineId}
            onSelectLine={(line: IBudgetLineDto) => setSelectedLineId(line.id)}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            onOpenUploadDialog={() => setUploadDialogOpen(true)}
          />

          <BudgetRequestsSection
            periodId={selectedPeriod}
            departmentId={filters.departmentId}
          />
        </div>

        {/* Right Column: Period Governance, Fund Movements (driven by selection), Safeguards */}
        <div className="space-y-6 min-w-0">
          <PeriodGovernancePanel
            periodData={periodData}
            isLoading={isPeriodLoading}
            onOpenManagePeriodDialog={() => setManagePeriodDialogOpen(true)}
          />

          <FundMovementsPanel
            selectedLineId={selectedLineId}
            selectedLineCode={selectedLine?.code}
            selectedLineName={selectedLine?.name}
            departmentId={filters.departmentId}
          />

          <SafeguardsPanel />
        </div>
      </div>

      {/* ── Dialog Modals ── */}
      <UploadBudgetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        periodCode={periodCode}
      />

      <ManagePeriodDialog
        open={managePeriodDialogOpen}
        onOpenChange={setManagePeriodDialogOpen}
        periodData={periodData}
      />
    </div>
  );
}

export default function BudgetControlCenterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      }
    >
      <BudgetControlCenterContent />
    </React.Suspense>
  );
}
