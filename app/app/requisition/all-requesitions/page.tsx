import { allRequisitionColumns } from "@/components/oms/table-config"
import { allRequisitions  } from "@/components/oms/mock-data"
import { DataTable } from "@/components/oms/DataTable"

export default function allRequests () {
  return (
    <div>
        <div>
            <DataTable columns={allRequisitionColumns} data={allRequisitions} keyField="id" enableExport enableSearch />
        </div>
    </div>
)}