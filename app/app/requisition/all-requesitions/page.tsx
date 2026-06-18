"use client";

import { useState } from "react";
import { allRequisitionColumns } from "@/components/oms/table-config";
import { allRequisitions } from "@/components/oms/mock-data";
import { DataTable } from "@/components/oms/DataTable";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";
import { CreateRequisitionForm } from "@/components/oms/create-requisition-forms";

export default function AllRequests() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [openCreateForm, setOpenCreateForm] = useState(false);

  const filteredData = allRequisitions.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <>
      <DataTable columns={allRequisitionColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport toolbarActions={
        <div className="flex items-center gap-2">
          <DepartmentFilter value={department} onChange={setDepartment} />
          <StatusFilter value={status} onChange={setStatus} options={["Approved", "Pending", "Pending Approval", "Rejected", "Draft", "Clarification Required"]} />
          <Button onClick={() => setOpenCreateForm(true)}>Create Requisition</Button>
        </div>
      } />

      <CreateRequisitionForm open={openCreateForm} onClose={() => setOpenCreateForm(false)} />
    </>
  );
}