"use client";

import { useState } from "react";
import { DataTable } from "@/components/oms/DataTable";
import { supplements } from "@/components/oms/mock-data";
import { supplementColumns } from "@/components/oms/table-config";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { BudgetSupplementTrend } from "@/components/oms/budget-supply-linechart";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";

export default function BudgetSupply() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");

  const filteredData = supplements.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:savings-outline" value={1400000} title="Available Budget" description="Remaining balance" />

      <div className="md:col-span-4">
        <BudgetSupplementTrend />
      </div>

      <div className="md:col-span-4">
        <DataTable
          columns={supplementColumns as any}
          data={filteredData as any}
          keyField="id"
          enableSearch
          enableExport
          globalFilterFields={["id", "department", "vendor"]}
          toolbarActions={
            <div className="flex items-center gap-2">
              <DepartmentFilter value={department} onChange={setDepartment} />
              <StatusFilter value={status} onChange={setStatus} options={["Draft", "Pending Approval", "Approved", "Rejected"]} />
              <Button>Create Supplement</Button>
            </div>
          }
        />
      </div>
    </div>
  );
}