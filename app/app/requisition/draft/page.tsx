"use client";

import { useState } from "react";
import { draftColumns } from "@/components/oms/table-config";
import { draftRequisitions } from "@/components/oms/mock-data";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DataTable } from "@/components/oms/DataTable";
import { StatusFilter, DepartmentFilter } from "@/components/oms/table-filters";
import { Button } from "@/components/ui/button";
import { CreateRequisitionForm } from "@/components/oms/create-requisition-forms";

export default function Drafts() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [openCreateForm, setOpenCreateForm] = useState(false);

  const filteredData = draftRequisitions.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:draft-outline" value={12} title="Total Drafts" description="Saved requisitions" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:edit-document-outline" value={5} title="Modified Today" description="Recently updated" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:task-alt-outline" value={7} title="Ready To Submit" description="Complete drafts" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:warning-outline" value={5} title="Incomplete" description="Missing information" />

      <div className="md:col-span-4">
        <DataTable columns={draftColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <StatusFilter value={status} onChange={setStatus} options={["Ready", "Incomplete"]} />
            <Button onClick={() => setOpenCreateForm(true)}>Create Requisition</Button>
          </div>
        } />
      </div>

      <CreateRequisitionForm open={openCreateForm} onClose={() => setOpenCreateForm(false)} />
    </div>
  );
}