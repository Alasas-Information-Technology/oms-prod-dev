import { myRequisitionColumns } from "@/components/oms/table-config"
import { myRequisitions } from "@/components/oms/mock-data"
import { SimpleKpiCard } from "@/components/oms/simple-kpi"
import { DataTable } from "@/components/oms/DataTable"



export default function MyRequesition () {
  return (
    <div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:description-outline" value={24} title="Total Requests" description="My requisitions" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:pending-actions" value={6} title="Pending Approval" description="Awaiting review" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={15} title="Approved" description="Successfully approved" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:draft-outline" value={3} title="Drafts" description="Not yet submitted" />

            <div className="md:col-span-4">
                <DataTable
                columns={myRequisitionColumns}
                data={myRequisitions}
                keyField="id"
                enableExport
                enableSearch
                />


            </div>


        </div>

    </div>
  

)}