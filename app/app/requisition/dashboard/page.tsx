import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { requestionRequests } from "@/components/oms/mock-data";
import { requisitionColumns } from "@/components/oms/table-config";
import { RequestionSpendChart } from "@/components/oms/requisition-spend-chart";
import { RequesitionOverviewWidget } from "@/components/oms/requestion-overview-widget";

export default function procurementDashboard () {
  return (
    <div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={8400000} title="Total Procurement Value" description="All procurement requests" />
          <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={94} title="Approved Requests" description="Successfully approved" />
          <SimpleKpiCard className="h-[128px]" icon="material-symbols:pending-actions" value={18} title="Pending Requests" description="Awaiting approval" />
          <SimpleKpiCard className="h-[128px]" icon="material-symbols:storefront-outline" value={32} title="Active Vendors" description="Approved suppliers" />


        <div className="md:col-span-3 row-span-2">
         <RequestionSpendChart/>
        </div>

        <div className="md:col-span-1 row-span-2">
            <RequesitionOverviewWidget/>
        </div>

        <div className="md:col-span-4 row-span-7">
          <DataTable 
          columns={requisitionColumns}
            data={requestionRequests}
            keyField="id"
            enableSearch
            enableExport
          />

        </div>

      </div>
    </div>
  )
}