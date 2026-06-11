"use client";

import { useState } from "react";
import { Search, Plus, Pencil } from "lucide-react";

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

import { Badge } from "@/components/ui/badge";

const vendorAllocations = [
    { department: "IT", vendor: "ABC Technologies", allocated: "AED 600,000", committed: "AED 540,000", available: "AED 60,000", utilization: "96%" },
    { department: "IT", vendor: "XYZ Solutions", allocated: "AED 400,000", committed: "AED 360,000", available: "AED 40,000", utilization: "90%" },
    { department: "IT", vendor: "Cloud Services UAE", allocated: "AED 250,000", committed: "AED 100,000", available: "AED 150,000", utilization: "40%" },
    { department: "IT", vendor: "DataCore Solutions", allocated: "AED 350,000", committed: "AED 315,000", available: "AED 35,000", utilization: "90%" },
    { department: "IT", vendor: "CyberShield Security", allocated: "AED 500,000", committed: "AED 425,000", available: "AED 75,000", utilization: "85%" },
    { department: "Operations", vendor: "Global Systems", allocated: "AED 500,000", committed: "AED 250,000", available: "AED 250,000", utilization: "50%" },
    { department: "Operations", vendor: "Logistics Hub", allocated: "AED 450,000", committed: "AED 405,000", available: "AED 45,000", utilization: "90%" },
    { department: "Operations", vendor: "Rapid Transport LLC", allocated: "AED 380,000", committed: "AED 228,000", available: "AED 152,000", utilization: "60%" },
    { department: "Operations", vendor: "Supply Chain Experts", allocated: "AED 420,000", committed: "AED 357,000", available: "AED 63,000", utilization: "85%" },
    { department: "Operations", vendor: "Fleet Services UAE", allocated: "AED 300,000", committed: "AED 120,000", available: "AED 180,000", utilization: "40%" },
    { department: "HR", vendor: "People First LLC", allocated: "AED 200,000", committed: "AED 180,000", available: "AED 20,000", utilization: "90%" },
    { department: "HR", vendor: "Workforce Partners", allocated: "AED 180,000", committed: "AED 72,000", available: "AED 108,000", utilization: "40%" },
    { department: "HR", vendor: "TalentConnect", allocated: "AED 220,000", committed: "AED 132,000", available: "AED 88,000", utilization: "60%" },
    { department: "HR", vendor: "RecruitPro Services", allocated: "AED 260,000", committed: "AED 234,000", available: "AED 26,000", utilization: "90%" },
    { department: "HR", vendor: "Training Academy", allocated: "AED 150,000", committed: "AED 60,000", available: "AED 90,000", utilization: "40%" },
    { department: "Finance", vendor: "FinTech Partners", allocated: "AED 300,000", committed: "AED 255,000", available: "AED 45,000", utilization: "85%" },
    { department: "Finance", vendor: "AuditPro Services", allocated: "AED 220,000", committed: "AED 88,000", available: "AED 132,000", utilization: "40%" },
    { department: "Finance", vendor: "Tax Advisory Group", allocated: "AED 280,000", committed: "AED 168,000", available: "AED 112,000", utilization: "60%" },
    { department: "Finance", vendor: "Capital Consultants", allocated: "AED 340,000", committed: "AED 306,000", available: "AED 34,000", utilization: "90%" },
    { department: "Finance", vendor: "Risk Analytics UAE", allocated: "AED 250,000", committed: "AED 100,000", available: "AED 150,000", utilization: "40%" },
    { department: "Procurement", vendor: "Prime Supplies", allocated: "AED 420,000", committed: "AED 378,000", available: "AED 42,000", utilization: "90%" },
    { department: "Procurement", vendor: "VendorLink Trading", allocated: "AED 360,000", committed: "AED 144,000", available: "AED 216,000", utilization: "40%" },
    { department: "Procurement", vendor: "Mega Industrial Supply", allocated: "AED 550,000", committed: "AED 495,000", available: "AED 55,000", utilization: "90%" },
    { department: "Procurement", vendor: "Smart Procurement LLC", allocated: "AED 290,000", committed: "AED 174,000", available: "AED 116,000", utilization: "60%" },
    { department: "Procurement", vendor: "Global Materials Co.", allocated: "AED 470,000", committed: "AED 188,000", available: "AED 282,000", utilization: "40%" },
];

export function VendorAllocationTable() {
    const [department, setDepartment] = useState("all");
    const [search, setSearch] = useState("");

    const filteredData = vendorAllocations.filter((item) => {
        const matchesDepartment = department === "all" || item.department === department;
        const matchesSearch = item.vendor.toLowerCase().includes(search.toLowerCase());

        return matchesDepartment && matchesSearch;
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
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendor..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Button variant="outline">
                    <Pencil className="h-4 w-4" />
                    Edit Allocation
                </Button>

                <Button>
                    <Plus className="h-4 w-4" />
                    Create Allocation
                </Button>
            </div>

            <div className="h-[600px] overflow-y-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead>Vendor Name</TableHead>
                            <TableHead>Allocated Amount</TableHead>
                            <TableHead>Committed Amount</TableHead>
                            <TableHead>Available Amount</TableHead>
                            <TableHead>Utilization %</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={`${item.vendor}-${index}`}>
                                <TableCell>{item.vendor}</TableCell>
                                <TableCell>{item.allocated}</TableCell>
                                <TableCell>{item.committed}</TableCell>
                                <TableCell>{item.available}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            parseInt(item.utilization) >= 80
                                                ? "bg-red-100 text-red-700 border-red-200"
                                                : "bg-green-100 text-green-700 border-green-200"
                                        }
                                    >
                                        {item.utilization}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}