import { draftColumns } from "@/components/oms/table-config"
import { draftRequisitions } from "@/components/oms/mock-data"
import { SimpleKpiCard } from "@/components/oms/simple-kpi"
import { DataTable } from "@/components/oms/DataTable"

export default function drafts () {
  return (
    <div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:draft-outline" value={12} title="Total Drafts" description="Saved requisitions" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:edit-document-outline" value={5} title="Modified Today" description="Recently updated" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:task-alt-outline" value={7} title="Ready To Submit" description="Complete drafts" />
            <SimpleKpiCard className="h-[128px]" icon="material-symbols:warning-outline" value={5} title="Incomplete" description="Missing information" />

            <div className="md:col-span-4">
                <DataTable columns={draftColumns} data={draftRequisitions} keyField="id" enableExport enableSearch />
            </div>

        </div>
    </div>
)}