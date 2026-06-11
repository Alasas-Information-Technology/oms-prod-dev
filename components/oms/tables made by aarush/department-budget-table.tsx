"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DataTable } from "@/components/oms/DataTable";
import { departmentBudgets } from "@/components/oms/mock-data";

import { departmentBudgetColumns } from "../table-config";

export function DepartmentBudgetTable() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("2026");

  const filteredData = departmentBudgets.filter(
    (item) =>
      item.department.toLowerCase().includes(search.toLowerCase()) &&
      item.year === year
  );

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Department Budget List</h3>
          <p className="text-sm text-muted-foreground">
            Budget allocation and utilization by department
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search department..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="2024">FY 2024</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
              <SelectItem value="2026">FY 2026</SelectItem>
              <SelectItem value="2027">FY 2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={departmentBudgetColumns}
        data={filteredData}
        keyField="id"
      />
    </div>
  );
}