
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { transfers } from "@/components/oms/mock-data";
import { transferColumns } from "@/components/oms/table-config";
export default function BudgetTransfer() {
    return (
        <div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />
                <div className="md:col-span-3">
                    <DataTable
                        columns={transferColumns}
                        data={transfers}
                        keyField="id"
                        enableSearch
                        enableExport
                        globalFilterFields={["id", "source", "target"]}
                    />

                </div>
            </div>
        </div>
    )
}