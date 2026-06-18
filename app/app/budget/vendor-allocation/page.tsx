"use client";

import { useState } from "react";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { vendorAllocations } from "@/components/oms/mock-data";
import { vendorAllocationColumns } from "@/components/oms/table-config";
import { Button } from "@/components/ui/button";
import { DepartmentFilter } from "@/components/oms/table-filters";

export default function VendorAllocation() {
  const [department, setDepartment] = useState("all");

  const filteredData = vendorAllocations.filter((item) => department === "all" || item.department === department);

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />

      <div className="md:col-span-3">
        <DataTable columns={vendorAllocationColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport globalFilterFields={["vendor", "department"]} toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <Button variant="outline">Edit Allocation</Button>
            <Button>Create Allocation</Button>
          </div>
        } />
      </div>
    </div>
  );
}









