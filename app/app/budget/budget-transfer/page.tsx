"use client";

import { useState } from "react";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { transfers } from "@/components/oms/mock-data";
import { transferColumns } from "@/components/oms/table-config";
import { Button } from "@/components/ui/button";
import { StatusFilter, DepartmentFilter } from "@/components/oms/table-filters";

export default function BudgetTransfer() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");

  const filteredData = transfers.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.source === department || item.target === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />

      <div className="md:col-span-3">
        <DataTable columns={transferColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport globalFilterFields={["id", "source", "target"]} toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <StatusFilter value={status} onChange={setStatus} options={["Draft", "Pending Approval", "Approved", "Rejected"]} />
            <Button>Create Transfer</Button>
          </div>
        } />
      </div>
    </div>
  );
}