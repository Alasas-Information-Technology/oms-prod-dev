"use client";

import { useState } from "react";
import { DataTable } from "@/components/oms/DataTable";
import { userInformation } from "@/components/oms/mock-data";
import { userInformationColumns } from "@/components/oms/table-config";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { Button } from "@/components/ui/button";
import { DepartmentFilter, StatusFilter } from "@/components/oms/table-filters";
import { UserIssueWidget } from "@/components/oms/user-issue-widget";
import { CreateProfileForm } from "@/components/oms/create-profile-form";

export default function UserInformation() {
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [openCreateProfile, setOpenCreateProfile] = useState(false);

  const filteredData = userInformation.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:groups-outline" value={124} title="Online Users" description="Total working accounts" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:badge-outline" value={96} title="Internal Active Users" description="Accounts currently live" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:business-center-outline" value={22} title="External Active Users" description="Accounts currently live" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:error-outline" value={7} title="Locked Accounts" description="Requires admin unlock" />

      <div className="md:col-span-4">
        <UserIssueWidget />
      </div>

      <div className="md:col-span-4">
        <DataTable
          columns={userInformationColumns as any}
          data={filteredData as any}
          keyField="employeeId"
          enableSearch
          enableExport
          globalFilterFields={["employeeId", "employeeName", "department", "role", "email"]}
          toolbarActions={
            <div className="flex items-center gap-2">
              <DepartmentFilter value={department} onChange={setDepartment} />
              <StatusFilter value={status} onChange={setStatus} options={["Active", "Issue"]} />
              <Button variant="outline">Edit User</Button>
              <Button onClick={() => setOpenCreateProfile(true)}>Add User</Button>
            </div>
          }
        />
      </div>

      <CreateProfileForm open={openCreateProfile} onClose={() => setOpenCreateProfile(false)} />
    </div>
  );
}