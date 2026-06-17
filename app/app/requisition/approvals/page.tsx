import { pendingApprovalColumns } from "@/components/oms/table-config"
import { pendingApprovals } from "@/components/oms/mock-data"
import { SimpleKpiCard } from "@/components/oms/simple-kpi"
import { DataTable } from "@/components/oms/DataTable"



export default function Pending () {
  return (
    <div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:approval-outline" value={8} title="Pending Approvals" description="Awaiting your action" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:schedule-outline" value={3} title="Urgent Requests" description="Older than 3 days" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={12} title="Approved This Month" description="Completed approvals" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:warning-outline" value={2} title="Clarifications" description="Returned for info" />


            <div className="md:col-span-4">
                <DataTable
                columns={pendingApprovalColumns}
                data={pendingApprovals}
                keyField="id"
                enableExport
                enableSearch
                />


            </div>


        </div>

    </div>
  

)}