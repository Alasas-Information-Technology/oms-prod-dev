"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

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

const annualBudgets = [
    { year: "2027", original: "AED 3,200,000", supplement: "AED 150,000", total: "AED 3,350,000", committed: "AED 2,450,000", available: "AED 900,000", status: "Open" },
    { year: "2028", original: "AED 2,900,000", supplement: "AED 100,000", total: "AED 3,000,000", committed: "AED 2,100,000", available: "AED 900,000", status: "Open" },
    { year: "2029", original: "AED 2,600,000", supplement: "AED 80,000", total: "AED 2,680,000", committed: "AED 1,900,000", available: "AED 780,000", status: "Open" },
    { year: "2026", original: "AED 5,000,000", supplement: "AED 500,000", total: "AED 5,500,000", committed: "AED 4,300,000", available: "AED 1,200,000", status: "Open" },
    { year: "2025", original: "AED 4,800,000", supplement: "AED 300,000", total: "AED 5,100,000", committed: "AED 3,900,000", available: "AED 1,200,000", status: "Closed" },
    { year: "2024", original: "AED 4,500,000", supplement: "AED 400,000", total: "AED 4,900,000", committed: "AED 3,600,000", available: "AED 1,300,000", status: "Closed" },
    { year: "2023", original: "AED 4,000,000", supplement: "AED 250,000", total: "AED 4,250,000", committed: "AED 3,100,000", available: "AED 1,150,000", status: "Closed" },
    { year: "2022", original: "AED 3,500,000", supplement: "AED 200,000", total: "AED 3,700,000", committed: "AED 2,800,000", available: "AED 900,000", status: "Closed" },
    { year: "2021", original: "AED 3,200,000", supplement: "AED 150,000", total: "AED 3,350,000", committed: "AED 2,450,000", available: "AED 900,000", status: "Closed" },
    { year: "2020", original: "AED 2,900,000", supplement: "AED 100,000", total: "AED 3,000,000", committed: "AED 2,100,000", available: "AED 900,000", status: "Closed" },
    { year: "2019", original: "AED 2,600,000", supplement: "AED 80,000", total: "AED 2,680,000", committed: "AED 1,900,000", available: "AED 780,000", status: "Closed" },
  
];

export function AnnualBudgetTable() {
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredData = annualBudgets.filter((item) => {
    const matchesYear = year === "all" || item.year === year;
    const matchesStatus =
      status === "all" || item.status.toLowerCase() === status;

    return matchesYear && matchesStatus;
  });

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Annual Budget List</h3>
          <p className="text-sm text-muted-foreground">
            Yearly budget records and financial status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Financial Year" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2026">FY 2026</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
              <SelectItem value="2024">FY 2024</SelectItem>
              <SelectItem value="2023">FY 2023</SelectItem>
              <SelectItem value="2022">FY 2022</SelectItem>
              <SelectItem value="2021">FY 2021</SelectItem>
              <SelectItem value="2020">FY 2020</SelectItem>
              <SelectItem value="2019">FY 2019</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Pencil className="h-4 w-4" />
            Edit Budget
          </Button>

          <Button>
            <Plus className="h-4 w-4" />
            Create Budget
          </Button>
        </div>
      </div>

      <div className="h-[420px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>Financial Year</TableHead>
              <TableHead>Original Budget</TableHead>
              <TableHead>Supplement Amount</TableHead>
              <TableHead>Total Budget</TableHead>
              <TableHead>Committed Amount</TableHead>
              <TableHead>Available Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.year}>
                <TableCell>FY {item.year}</TableCell>
                <TableCell>{item.original}</TableCell>
                <TableCell>{item.supplement}</TableCell>
                <TableCell>{item.total}</TableCell>
                <TableCell>{item.committed}</TableCell>
                <TableCell>{item.available}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}