"use client";

import { useState } from "react";
import { pendingApprovalColumns } from "@/components/oms/table-config";
import { pendingApprovals } from "@/components/oms/mock-data";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";
import { MostUrgentApprovalWidget } from "@/components/oms/most-urgent-approval-widget";
import { CompactKpiCard } from "@/components/oms/compact-kpi-card";

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
      <div className="grid grid-cols-2 gap-3 md:col-span-1 h-[220px]">
        <CompactKpiCard title="Pending Approvals" value={8} />
        <CompactKpiCard title="Urgent Requests" value={3} />
        <CompactKpiCard title="Approved This Month" value={12} />
        <CompactKpiCard title="Clarifications" value={2} />
      </div>
      <div className="md:col-span-3 h-[220px]">
        <MostUrgentApprovalWidget />
      </div>

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