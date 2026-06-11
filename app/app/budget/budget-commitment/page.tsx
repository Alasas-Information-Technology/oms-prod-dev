import { DataTable } from "@/components/oms/DataTable";
import { commitments } from "@/components/oms/mock-data";
import { commitmentColumns } from "@/components/oms/table-config";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
export default function BudgetCommitments() {
    return (
        <div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:savings-outline" value={1400000} title="Available Budget" description="Remaining balance" />
                <div className="md:col-span-4">
                    <DataTable
                        columns={commitmentColumns}
                        data={commitments}
                        keyField="id"
                        enableSearch
                        enableExport
                        globalFilterFields={["id", "request", "department", "vendor"]}
                    />

                </div>
            </div>
        </div>
    )
}