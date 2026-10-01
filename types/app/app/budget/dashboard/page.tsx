import {
  SimpleKpiCard,
  BudgetDistributionChart,
  MonthlyBudgetTrend,
  BudgetKpiCard,
  RecentBudgetActivities,
} from "@/components/budget";

export default function BudgetDashboard() {
    return (
        <div className="p-6">
            <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            <SimpleKpiCard showIcon={false} isCurrency={true} value={1000000} title="Total Budget" description="2026 Budget" />
            <SimpleKpiCard showIcon={false} isCurrency={true} value={950000} title="Allocated Budget" description="amount allocated " />
            <SimpleKpiCard showIcon={false} isCurrency={true} value={620000} title="Committed Budget" description="amount utilized" />

            <div className="col-span-2 row-span-3 h-full flex flex-col gap-4">
                <BudgetDistributionChart />
                <BudgetKpiCard reserved={65.893} consumed={22} />
            </div>
            <div className="col-span-3 row-span-2">
                <MonthlyBudgetTrend />
            </div>
            <div className="col-span-3 row-span-2 h-full flex w-full">
                <RecentBudgetActivities />
            </div>
            <div className="row-span-2 flex flex-col gap-4">
                <SimpleKpiCard showIcon={false} isCurrency={true} value={330000} title="Available Budget" description="Remaining Balance" />
                <SimpleKpiCard showIcon={false} value={14} title="Active Departments" description="Active department count" />
            </div>
            <div className="row-span-2 flex flex-col gap-4">
                <SimpleKpiCard showIcon={false} isCurrency={true} value={120000} title="Budget supplements" description="Additional Funding" />
                <SimpleKpiCard showIcon={false} value={27} title="Pending Approvals" description="Requests awaiting review" />
            </div>
            </div>
        </div>
    )
}