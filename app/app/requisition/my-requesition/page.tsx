"use client";

import { useState } from "react";
import { myRequisitionColumns } from "@/components/oms/table-config";
import { myRequisitions } from "@/components/oms/mock-data";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";

export default function MyRequesition() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");

  const filteredData = myRequisitions.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:description-outline" value={24} title="Total Requests" description="My requisitions" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:pending-actions" value={6} title="Pending Approval" description="Awaiting review" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={15} title="Approved" description="Successfully approved" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:draft-outline" value={3} title="Drafts" description="Not yet submitted" />

      <div className="md:col-span-4">
        <DataTable columns={myRequisitionColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <StatusFilter value={status} onChange={setStatus} options={["Approved", "Pending", "Rejected", "Draft"]} />
            <Button>Create Requisition</Button>
          </div>
        } />
      </div>
    </div>
  );
}