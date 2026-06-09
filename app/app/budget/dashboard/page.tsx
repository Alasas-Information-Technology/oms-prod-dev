import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { BudgetDistributionChart } from "@/components/oms/donought"
import { MonthlyBudgetTrend } from "@/components/oms/MonthlyBudgetTrend";
import { BudgetKpiCard } from "@/components/oms/budget-kpi";
import { RecentBudgetActivities } from "@/components/oms/BudgetTable";

export default function BudgetDashboard() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={1000000} title="Total Budget" description="2026 Budget" />
            <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={950000} title="Allocated Budget" description="amount allocated " />
            <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={620000} title="Committed Budget" description="amount utilized" />

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
                <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={330000} title="Available Budget" description="Remaining Balance" />
                <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={14} title="Active Departments" description="Additional Funding" />
            </div>
            <div className="row-span-2 flex flex-col gap-4">
                <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={120000} title="Budget supplements" description="Additional Funding" />
                <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={27} title="Committed Budget" description="Receiving Budget" />
            </div>


        </div>
    )
}