"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Plus,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageBar } from "@/components/ui/layouts/page-bar-context";
import { MOCK_REQUESTS } from "@/components/oms/requests/request.mock-data";
import { OmsRequest } from "@/components/oms/requests/request.types";
import { RequestStatusBadge } from "@/components/oms/requests/RequestStatusBadge";
import { formatAmount } from "@/lib/money";

export function SourcingWorkspace() {
  const router = useRouter();
  const { setCustomCrumbs } = usePageBar();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Sync breadcrumbs
  React.useEffect(() => {
    setCustomCrumbs([
      { label: "Procurement", href: "/app/procurement" },
      { label: "Sourcing", isCurrent: true },
    ]);
    return () => setCustomCrumbs(null);
  }, [setCustomCrumbs]);

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    return MOCK_REQUESTS.filter((req) => {
      const matchesSearch =
        req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.department.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "hr-approved") return req.actualStatus === "HR Approved" || req.currentStage === "Procurement";
      if (statusFilter === "in-progress") return req.statusGroup === "in-progress";

      return true;
    });
  }, [searchQuery, statusFilter]);

  const handleRowClick = (requestId: string) => {
    router.push(`/app/procurement/sourcing/${requestId}`);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 dark:bg-slate-950 p-6 space-y-6 select-none">
      {/* Top Title & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Procurement Sourcing Requisitions
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Select a requisition below to configure qualified vendor release, CV limits, and dispatch candidate sourcing requests.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by ID, position or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-[180px] bg-background border-border">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requisitions ({MOCK_REQUESTS.length})</SelectItem>
              <SelectItem value="hr-approved">Ready for Sourcing</SelectItem>
              <SelectItem value="in-progress">In-Progress</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-medium border-border"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Requisitions List Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[130px]">
                Requisition ID
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[200px]">
                Position Title
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center w-16">
                Qty
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[140px]">
                Department
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[150px]">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right min-w-[130px]">
                Budget
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right min-w-[160px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center py-8">
                  <p className="text-sm font-semibold text-foreground">No requisitions found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria or filters.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  onClick={() => router.push(`/app/procurement/sourcing/${request.requestId}`)}
                  className="border-border/40 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    <span
                      className="hover:underline hover:text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/app/procurement/sourcing/${request.requestId}`);
                      }}
                    >
                      {request.requestId}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-foreground">
                    {request.position}
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs">
                    {request.resources}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {request.department}
                  </TableCell>
                  <TableCell>
                    <RequestStatusBadge status={request.actualStatus} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold tabular-nums text-foreground">
                    AED {formatAmount(request.budget * 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/app/procurement/sourcing/${request.requestId}`);
                      }}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Source Candidates
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
