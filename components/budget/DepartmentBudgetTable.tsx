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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const departmentBudgets = [
  { department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },
  { department: "Marketing", year: "2026", allocated: "AED 400,000", committed: "AED 220,000", available: "AED 180,000", utilization: "55%" },
  { department: "Facilities", year: "2026", allocated: "AED 900,000", committed: "AED 700,000", available: "AED 200,000", utilization: "78%" },
];

export function DepartmentBudgetTable() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("2026");

  const filteredData = departmentBudgets.filter(
    (item) =>
      item.department.toLowerCase().includes(search.toLowerCase()) &&
      (year === "all" || item.year === year)
  );

  return (
    <div className="rounded-md border bg-background p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-lg">Department Budgets</h3>
          <p className="text-sm text-muted-foreground">
            Overview of department budget allocations and utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search department..."
              className="pl-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead>Committed</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Utilization</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.department}</TableCell>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.allocated}</TableCell>
              <TableCell>{row.committed}</TableCell>
              <TableCell>{row.available}</TableCell>
              <TableCell className="text-right">{row.utilization}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
