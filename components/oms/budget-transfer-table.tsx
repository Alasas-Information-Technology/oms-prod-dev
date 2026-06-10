"use client";

import { useState } from "react";
import { Search, Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const transfers = [
  { number: "TRF-2026-001", source: "IT", target: "Operations", amount: "AED 100,000", year: "2026", status: "Approved" },
  { number: "TRF-2026-002", source: "Finance", target: "HR", amount: "AED 75,000", year: "2026", status: "Pending Approval" },
  { number: "TRF-2026-003", source: "Procurement", target: "IT", amount: "AED 120,000", year: "2026", status: "Approved" },
  { number: "TRF-2026-004", source: "Operations", target: "Finance", amount: "AED 50,000", year: "2026", status: "Rejected" },
  { number: "TRF-2026-005", source: "HR", target: "Operations", amount: "AED 90,000", year: "2026", status: "Draft" },
  { number: "TRF-2025-006", source: "IT", target: "Finance", amount: "AED 60,000", year: "2025", status: "Approved" },
  { number: "TRF-2025-007", source: "Operations", target: "Procurement", amount: "AED 130,000", year: "2025", status: "Pending Approval" },
  { number: "TRF-2025-008", source: "Finance", target: "IT", amount: "AED 40,000", year: "2025", status: "Rejected" },
  { number: "TRF-2024-009", source: "HR", target: "Finance", amount: "AED 35,000", year: "2024", status: "Draft" },
  { number: "TRF-2024-010", source: "Procurement", target: "Operations", amount: "AED 95,000", year: "2024", status: "Approved" },
];

function getStatusClass(status: string) {
  if (status === "Approved") return "bg-green-100 text-green-700 border-green-200";
  if (status === "Pending Approval") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (status === "Draft") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export function BudgetTransferTable() {
  const [source, setSource] = useState("all");
  const [target, setTarget] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredData = transfers.filter((item) => {
    const matchesSource = source === "all" || item.source === source;
    const matchesTarget = target === "all" || item.target === target;
    const matchesYear = year === "all" || item.year === year;
    const matchesStatus = status === "all" || item.status === status;
    const matchesSearch = item.number.toLowerCase().includes(search.toLowerCase());

    return matchesSource && matchesTarget && matchesYear && matchesStatus && matchesSearch;
  });

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source Dept" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Procurement">Procurement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Target Dept" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Procurement">Procurement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2026">FY 2026</SelectItem>
            <SelectItem value="2025">FY 2025</SelectItem>
            <SelectItem value="2024">FY 2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Pending Approval">Pending Approval</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transfer number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Button>
          <Plus className="h-4 w-4" />
          Create Transfer
        </Button>
      </div>

      <div className="h-[600px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>Transfer #</TableHead>
              <TableHead>Source Department</TableHead>
              <TableHead>Target Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.number}>
                <TableCell>{item.number}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>{item.target}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusClass(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}