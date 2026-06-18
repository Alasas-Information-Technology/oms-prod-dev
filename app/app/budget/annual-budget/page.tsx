"use client";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { AnnualBudgetTrend } from "@/components/oms/annual-budget-linechart";
import { DataTable } from "@/components/oms/DataTable";
import { annualBudgets } from "@/components/oms/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusFilter, YearFilter } from "@/components/oms/table-filters";
import { annualBudgetColumns } from "@/components/oms/table-config";
export default function AnnualBudget() {
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");
  const filteredData = annualBudgets.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesYear = year === "all" || String(item.year) === year;
    return matchesStatus && matchesYear;
  });

  return (
    <div>
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
          <AnnualBudgetTrend />

        </div>
        <div className="md:col-span-4 row-span-7">
          <DataTable
            columns={annualBudgetColumns as any}
            data={filteredData as any}
            keyField="id"
            enableSearch
            enableExport
            toolbarActions={
              <div className="flex items-center gap-2">
                <YearFilter value={year} onChange={setYear} />
                <StatusFilter value={status} onChange={setStatus} options={["Approved", "Draft", "Closed"]} />
                <Button variant="outline">Edit Budget</Button>
                <Button>Create Budget</Button>
              </div>
            }
          />

        </div>

      </div>
    </div>
  )
}