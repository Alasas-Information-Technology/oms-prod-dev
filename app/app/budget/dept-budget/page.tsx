"use client";

import { useState } from "react";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { DepartmentBudgetBarChart } from "@/components/oms/budget-bar-chart";
import { DataTable } from "@/components/oms/DataTable";
import { departmentBudgets } from "@/components/oms/mock-data";
import { departmentBudgetColumns } from "@/components/oms/table-config";
import { DepartmentFilter, YearFilter } from "@/components/oms/table-filters";

export default function DeptBudget() {
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");

  const filteredData = departmentBudgets.filter((item) => {
    const matchesDepartment = department === "all" || item.department === department;
    const matchesYear = year === "all" || String(item.year) === year;
    return matchesDepartment && matchesYear;
  });

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <div className="row-span-2 flex flex-col gap-4">
        <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
        <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
      </div>

      <div className="row-span-2 flex flex-col gap-4">
        <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />
        <SimpleKpiCard className="h-[128px]" icon="material-symbols:savings-outline" value={1400000} title="Available Budget" description="Remaining balance" />
      </div>

      <div className="md:col-span-2 row-span-2">
        <DepartmentBudgetBarChart />
      </div>

      <div className="md:col-span-4 row-span-7">
        <DataTable columns={departmentBudgetColumns as any} data={filteredData as any} keyField="id" enableSearch enableExport toolbarActions={
          <div className="flex items-center gap-2">
            <DepartmentFilter value={department} onChange={setDepartment} />
            <YearFilter value={year} onChange={setYear} />
          </div>
        } />
      </div>
    </div>
  );
}