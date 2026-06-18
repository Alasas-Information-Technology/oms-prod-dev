"use client";

import { useState } from "react";
import { pendingApprovalColumns } from "@/components/oms/table-config";
import { pendingApprovals } from "@/components/oms/mock-data";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";

export default function Pending() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");

  const filteredData = pendingApprovals.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:approval-outline" value={8} title="Pending Approvals" description="Awaiting your action" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:schedule-outline" value={3} title="Urgent Requests" description="Older than 3 days" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:check-circle-outline" value={12} title="Approved This Month" description="Completed approvals" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:warning-outline" value={2} title="Clarifications" description="Returned for info" />

      <div className="md:col-span-4">
        <DataTable
          columns={pendingApprovalColumns as any}
          data={filteredData as any}
          keyField="id"
          enableSearch
          enableExport
          selectable
          toolbarActions={
            <div className="flex items-center gap-2">
              <DepartmentFilter value={department} onChange={setDepartment} />
              <StatusFilter value={status} onChange={setStatus} options={["Pending", "Clarification Required"]} />
              <Button>Approve Selected</Button>
              <Button variant="outline">Reject Selected</Button>
            </div>
          }
        />
      </div>
    </div>
  );
}