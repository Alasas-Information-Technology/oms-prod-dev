"use client";

import { useState } from "react";
import { clarificationColumns } from "@/components/oms/table-config";
import { clarificationRequests } from "@/components/oms/mock-data";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";

export default function Clarifications() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");

  const filteredData = clarificationRequests.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:help-outline" value={8} title="Returned Requests" description="Need clarification" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:schedule-outline" value={5} title="Pending Response" description="Awaiting update" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={12} title="Resolved" description="Clarifications closed" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:timer-outline" value={3} title="Avg Response Days" description="Resolution time" />

      <div className="md:col-span-4">
        <DataTable columns={clarificationColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport selectable toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <StatusFilter value={status} onChange={setStatus} options={["Pending Response", "Resolved"]} />
            <Button>Respond</Button>
          </div>
        } />
      </div>
    </div>
  );
}