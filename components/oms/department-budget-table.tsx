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

  { department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },

  { department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },
  { department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },

  { department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },
];

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

      <div className="max-h-[500px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Budget Year</TableHead>
              <TableHead>Allocated Amount</TableHead>
              <TableHead>Committed Amount</TableHead>
              <TableHead>Available Amount</TableHead>
              <TableHead>Utilization</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={`${item.department}-${index}`}>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.allocated}</TableCell>
                <TableCell>{item.committed}</TableCell>
                <TableCell>{item.available}</TableCell>
                <TableCell>{item.utilization}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}