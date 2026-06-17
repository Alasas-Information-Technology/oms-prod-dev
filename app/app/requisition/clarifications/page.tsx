import { clarificationColumns } from "@/components/oms/table-config"
import { clarificationRequests } from "@/components/oms/mock-data"
import { SimpleKpiCard } from "@/components/oms/simple-kpi"
import { DataTable } from "@/components/oms/DataTable"

export default function clarifications () {
  return (
    <div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:help-outline" value={8} title="Returned Requests" description="Need clarification" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:schedule-outline" value={5} title="Pending Response" description="Awaiting update" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={12} title="Resolved" description="Clarifications closed" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:timer-outline" value={3} title="Avg Response Days" description="Resolution time" />
                        
            <div className="md:col-span-4">
                <DataTable columns={clarificationColumns} data={clarificationRequests} keyField="id enableExport enableSearch" />
            </div>
            
        </div>
    </div>
)}