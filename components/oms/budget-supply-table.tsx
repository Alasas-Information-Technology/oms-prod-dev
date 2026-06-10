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

const supplements = [
  { number: "SUP-2026-001", department: "IT", vendor: "ABC Technologies", year: "2026", requested: "AED 150,000", approved: "AED 150,000", status: "Approved" },
  { number: "SUP-2026-002", department: "Finance", vendor: "AuditPro Services", year: "2026", requested: "AED 100,000", approved: "AED 0", status: "Pending Approval" },
  { number: "SUP-2026-003", department: "HR", vendor: "-", year: "2026", requested: "AED 80,000", approved: "AED 80,000", status: "Approved" },
  { number: "SUP-2026-004", department: "Operations", vendor: "Global Systems", year: "2026", requested: "AED 120,000", approved: "AED 0", status: "Rejected" },
  { number: "SUP-2026-005", department: "Procurement", vendor: "Prime Supplies", year: "2026", requested: "AED 200,000", approved: "AED 0", status: "Draft" },
  { number: "SUP-2025-006", department: "IT", vendor: "Cloud Services UAE", year: "2025", requested: "AED 90,000", approved: "AED 90,000", status: "Approved" },
  { number: "SUP-2025-007", department: "Finance", vendor: "Tax Advisory Group", year: "2025", requested: "AED 110,000", approved: "AED 110,000", status: "Approved" },
  { number: "SUP-2025-008", department: "HR", vendor: "-", year: "2025", requested: "AED 50,000", approved: "AED 0", status: "Rejected" },
  { number: "SUP-2025-009", department: "Operations", vendor: "Logistics Hub", year: "2025", requested: "AED 175,000", approved: "AED 0", status: "Pending Approval" },
  { number: "SUP-2025-010", department: "Procurement", vendor: "VendorLink Trading", year: "2025", requested: "AED 140,000", approved: "AED 140,000", status: "Approved" },
  { number: "SUP-2024-011", department: "IT", vendor: "CyberShield Security", year: "2024", requested: "AED 95,000", approved: "AED 0", status: "Draft" },
  { number: "SUP-2024-012", department: "Finance", vendor: "Capital Consultants", year: "2024", requested: "AED 160,000", approved: "AED 160,000", status: "Approved" },
  { number: "SUP-2024-013", department: "HR", vendor: "RecruitPro Services", year: "2024", requested: "AED 70,000", approved: "AED 70,000", status: "Approved" },
  { number: "SUP-2024-014", department: "Operations", vendor: "Fleet Services UAE", year: "2024", requested: "AED 180,000", approved: "AED 0", status: "Rejected" },
  { number: "SUP-2024-015", department: "Procurement", vendor: "Mega Industrial Supply", year: "2024", requested: "AED 250,000", approved: "AED 250,000", status: "Approved" },
];

function getStatusClass(status: string) {
  if (status === "Approved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "Pending Approval") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (status === "Draft") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-red-100 text-red-700 border-red-200";
}

export function BudgetSupplementTable() {
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredData = supplements.filter((item) => {
    const matchesDepartment =
      department === "all" || item.department === department;

    const matchesYear =
      year === "all" || item.year === year;

    const matchesStatus =
      status === "all" || item.status === status;

    const matchesSearch =
      item.number.toLowerCase().includes(search.toLowerCase());

    return (
      matchesDepartment &&
      matchesYear &&
      matchesStatus &&
      matchesSearch
    );
  });

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
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

          <Input
            placeholder="Search supplement number..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button>
          <Plus className="h-4 w-4" />
          Create Supplement
        </Button>
      </div>

      <div className="h-[600px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>Supplement #</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Requested Amount</TableHead>
              <TableHead>Approved Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.number}>
                <TableCell>{item.number}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell>{item.requested}</TableCell>
                <TableCell>{item.approved}</TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusClass(item.status)}
                  >
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