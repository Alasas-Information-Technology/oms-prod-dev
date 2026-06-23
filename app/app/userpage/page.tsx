"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/oms/DataTable";
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
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:4000/api/authorization/users");
    const result = await response.json();

    if (result.success) {
      setUsers(result.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredData = users.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment = department === "all" || item.department === department;
    return matchesStatus && matchesDepartment;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:groups-outline" value={users.length} title="Online Users" description="Total working accounts" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:badge-outline" value={users.filter((u) => u.userType === "INTERNAL").length} title="Internal Active Users" description="Accounts currently live" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:business-center-outline" value={users.filter((u) => u.userType === "EXTERNAL" || u.userType === "VENDOR").length} title="External Active Users" description="Accounts currently live" />
      <SimpleKpiCard className="h-[128px]" icon="material-symbols:error-outline" value={users.filter((u) => u.status !== "Active").length} title="Locked Accounts" description="Requires admin unlock" />

      <div className="md:col-span-4">
        <UserIssueWidget />
      </div>

      <div className="md:col-span-4">
        <DataTable
          columns={userInformationColumns as any}
          data={filteredData as any}
          keyField="userId"
          enableSearch
          enableExport
          globalFilterFields={["employeeId", "employeeName", "department", "role", "email"]}
          toolbarActions={
            <div className="flex items-center gap-2">
              <DepartmentFilter value={department} onChange={setDepartment} />
              <StatusFilter value={status} onChange={setStatus} options={["Active", "Inactive"]} />
              <Button variant="outline">Edit User</Button>
              <Button onClick={() => setOpenCreateProfile(true)}>Add User</Button>
            </div>
          }
        />
      </div>

      <CreateProfileForm
        open={openCreateProfile}
        onClose={() => {
          setOpenCreateProfile(false);
          fetchUsers();
        }}
      />
    </div>
  );
}