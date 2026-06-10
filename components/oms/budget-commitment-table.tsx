"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";

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

const commitments = [
    { number: "COM-2026-001", department: "IT", vendor: "ABC Technologies", request: "REQ-2026-045", year: "2026", original: "AED 250,000", released: "AED 50,000", active: "AED 200,000", status: "Active" },
    { number: "COM-2026-002", department: "Operations", vendor: "Global Systems", request: "REQ-2026-051", year: "2026", original: "AED 180,000", released: "AED 180,000", active: "AED 0", status: "Released" },
    { number: "COM-2026-003", department: "Finance", vendor: "AuditPro Services", request: "REQ-2026-060", year: "2026", original: "AED 100,000", released: "AED 0", active: "AED 100,000", status: "Cancelled" },
    { number: "COM-2025-004", department: "HR", vendor: "People First LLC", request: "REQ-2025-088", year: "2025", original: "AED 220,000", released: "AED 80,000", active: "AED 140,000", status: "Partially Released" },
    { number: "COM-2025-005", department: "Procurement", vendor: "Prime Supplies", request: "REQ-2025-091", year: "2025", original: "AED 300,000", released: "AED 0", active: "AED 300,000", status: "Expired" },
    { number: "COM-2026-006", department: "IT", vendor: "CyberShield Security", request: "REQ-2026-067", year: "2026", original: "AED 420,000", released: "AED 120,000", active: "AED 300,000", status: "Active" },
    { number: "COM-2026-007", department: "IT", vendor: "Cloud Services UAE", request: "REQ-2026-071", year: "2026", original: "AED 150,000", released: "AED 50,000", active: "AED 100,000", status: "Partially Released" },
    { number: "COM-2026-008", department: "IT", vendor: "DataCore Solutions", request: "REQ-2026-075", year: "2026", original: "AED 275,000", released: "AED 0", active: "AED 275,000", status: "Active" },
    { number: "COM-2026-009", department: "Operations", vendor: "Logistics Hub", request: "REQ-2026-081", year: "2026", original: "AED 360,000", released: "AED 160,000", active: "AED 200,000", status: "Partially Released" },
    { number: "COM-2026-010", department: "Operations", vendor: "Rapid Transport LLC", request: "REQ-2026-082", year: "2026", original: "AED 140,000", released: "AED 140,000", active: "AED 0", status: "Released" },
    { number: "COM-2026-011", department: "Operations", vendor: "Fleet Services UAE", request: "REQ-2026-083", year: "2026", original: "AED 450,000", released: "AED 0", active: "AED 450,000", status: "Active" },
    { number: "COM-2026-012", department: "HR", vendor: "TalentConnect", request: "REQ-2026-090", year: "2026", original: "AED 95,000", released: "AED 0", active: "AED 95,000", status: "Active" },
    { number: "COM-2026-013", department: "HR", vendor: "RecruitPro Services", request: "REQ-2026-092", year: "2026", original: "AED 180,000", released: "AED 40,000", active: "AED 140,000", status: "Partially Released" },
    { number: "COM-2026-014", department: "HR", vendor: "Training Academy", request: "REQ-2026-095", year: "2026", original: "AED 60,000", released: "AED 60,000", active: "AED 0", status: "Released" },
    { number: "COM-2026-015", department: "Finance", vendor: "FinTech Partners", request: "REQ-2026-100", year: "2026", original: "AED 320,000", released: "AED 0", active: "AED 320,000", status: "Active" },
    { number: "COM-2026-016", department: "Finance", vendor: "Tax Advisory Group", request: "REQ-2026-101", year: "2026", original: "AED 170,000", released: "AED 70,000", active: "AED 100,000", status: "Partially Released" },
    { number: "COM-2026-017", department: "Finance", vendor: "Capital Consultants", request: "REQ-2026-102", year: "2026", original: "AED 250,000", released: "AED 250,000", active: "AED 0", status: "Released" },
    { number: "COM-2026-018", department: "Procurement", vendor: "VendorLink Trading", request: "REQ-2026-110", year: "2026", original: "AED 410,000", released: "AED 0", active: "AED 410,000", status: "Active" },
    { number: "COM-2026-019", department: "Procurement", vendor: "Mega Industrial Supply", request: "REQ-2026-111", year: "2026", original: "AED 500,000", released: "AED 150,000", active: "AED 350,000", status: "Partially Released" },
    { number: "COM-2026-020", department: "Procurement", vendor: "Smart Procurement LLC", request: "REQ-2026-112", year: "2026", original: "AED 120,000", released: "AED 120,000", active: "AED 0", status: "Released" },
    { number: "COM-2025-021", department: "IT", vendor: "XYZ Solutions", request: "REQ-2025-120", year: "2025", original: "AED 290,000", released: "AED 290,000", active: "AED 0", status: "Expired" },
    { number: "COM-2025-022", department: "Finance", vendor: "Risk Analytics UAE", request: "REQ-2025-121", year: "2025", original: "AED 160,000", released: "AED 0", active: "AED 160,000", status: "Cancelled" },
    { number: "COM-2025-023", department: "Operations", vendor: "Supply Chain Experts", request: "REQ-2025-122", year: "2025", original: "AED 210,000", released: "AED 210,000", active: "AED 0", status: "Expired" },
    { number: "COM-2025-024", department: "HR", vendor: "Workforce Partners", request: "REQ-2025-123", year: "2025", original: "AED 130,000", released: "AED 30,000", active: "AED 100,000", status: "Partially Released" },
    { number: "COM-2025-025", department: "Procurement", vendor: "Global Materials Co.", request: "REQ-2025-124", year: "2025", original: "AED 280,000", released: "AED 0", active: "AED 280,000", status: "Active" },
];

function getStatusClass(status: string) {
    if (status === "Active") return "bg-green-100 text-green-700 border-green-200";
    if (status === "Partially Released") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (status === "Released") return "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "Expired") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200";
}

export function BudgetCommitmentsTable() {
    const [department, setDepartment] = useState("all");
    const [vendor, setVendor] = useState("all");
    const [year, setYear] = useState("all");
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");

    const filteredData = commitments.filter((item) => {
        const matchesDepartment = department === "all" || item.department === department;
        const matchesVendor = vendor === "all" || item.vendor === vendor;
        const matchesYear = year === "all" || item.year === year;
        const matchesStatus = status === "all" || item.status === status;
        const matchesSearch =
            item.number.toLowerCase().includes(search.toLowerCase()) ||
            item.request.toLowerCase().includes(search.toLowerCase());

        return matchesDepartment && matchesVendor && matchesYear && matchesStatus && matchesSearch;
    });

    return (
        <div className="rounded-xl border bg-background p-4 shadow-sm">
            <div className="mb-4 grid grid-cols-5 gap-3">
                <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
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

                <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger>
                        <SelectValue placeholder="Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        <SelectItem value="ABC Technologies">ABC Technologies</SelectItem>
                        <SelectItem value="Global Systems">Global Systems</SelectItem>
                        <SelectItem value="AuditPro Services">AuditPro Services</SelectItem>
                        <SelectItem value="People First LLC">People First LLC</SelectItem>
                        <SelectItem value="Prime Supplies">Prime Supplies</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2026">FY 2026</SelectItem>
                        <SelectItem value="2025">FY 2025</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Partially Released">Partially Released</SelectItem>
                        <SelectItem value="Released">Released</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search commitment/request..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="h-[600px] overflow-y-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead>Commitment #</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Source Request</TableHead>
                            <TableHead>Original Amount</TableHead>
                            <TableHead>Released Amount</TableHead>
                            <TableHead>Active Amount</TableHead>
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
                                <TableCell>{item.request}</TableCell>
                                <TableCell>{item.original}</TableCell>
                                <TableCell>{item.released}</TableCell>
                                <TableCell>{item.active}</TableCell>
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