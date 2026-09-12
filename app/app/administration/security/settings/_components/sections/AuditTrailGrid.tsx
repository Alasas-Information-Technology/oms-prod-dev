"use client";

import * as React from "react";
import {
  Search,
  Download,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuditLogEntry {
  id: number;
  changedBy: string;
  role: string;
  setting: string;
  category: "AUTHENTICATION" | "SESSION" | "PROTECTION" | "RETENTION";
  oldVal: string;
  newVal: string;
  date: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 1,
    changedBy: "khalid.admin@diez.ae",
    role: "Security Administrator",
    setting: "Maximum Concurrent Sessions",
    category: "SESSION",
    oldVal: "3",
    newVal: "5",
    date: "2026-08-27 14:30:00",
    ipAddress: "192.168.10.45",
  },
  {
    id: 2,
    changedBy: "fatima.sec@diez.ae",
    role: "SOC Lead",
    setting: "Access Token Lifetime",
    category: "AUTHENTICATION",
    oldVal: "15 mins",
    newVal: "30 mins",
    date: "2026-08-26 09:15:22",
    ipAddress: "192.168.10.88",
  },
  {
    id: 3,
    changedBy: "system.orchestrator@diez.ae",
    role: "Automated Policy Engine",
    setting: "Enable Replay Detection",
    category: "PROTECTION",
    oldVal: "Disabled",
    newVal: "Enforced",
    date: "2026-08-25 18:00:00",
    ipAddress: "127.0.0.1",
  },
  {
    id: 4,
    changedBy: "khalid.admin@diez.ae",
    role: "Security Administrator",
    setting: "Lockout Duration",
    category: "AUTHENTICATION",
    oldVal: "15 mins",
    newVal: "30 mins",
    date: "2026-08-24 11:45:10",
    ipAddress: "192.168.10.45",
  },
  {
    id: 5,
    changedBy: "fatima.sec@diez.ae",
    role: "SOC Lead",
    setting: "Security Events Retention",
    category: "RETENTION",
    oldVal: "180 days",
    newVal: "365 days",
    date: "2026-08-22 16:20:00",
    ipAddress: "192.168.10.88",
  },
];

export function AuditTrailGrid() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const filteredLogs = React.useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter((log) => {
      const matchesSearch =
        log.changedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.setting.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || log.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleExportCsv = () => {
    const headers = "ID,Changed By,Role,Setting,Category,Old Value,New Value,Timestamp,IP Address\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.changedBy}","${l.role}","${l.setting}","${l.category}","${l.oldVal}","${l.newVal}","${l.date}","${l.ipAddress}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security-settings-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit trail exported successfully as CSV.");
  };

  return (
    <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <History className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold font-display">
                Policy Modification Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Tamper-evident chronological log of security parameter updates.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 px-3 text-xs gap-1.5 rounded-md font-semibold cursor-pointer"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search admin, setting, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs rounded-md"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {["ALL", "AUTHENTICATION", "SESSION", "PROTECTION", "RETENTION"].map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={selectedCategory === cat ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="h-7 px-2.5 text-[10px] font-semibold rounded-lg"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="rounded-md border border-border/70 overflow-hidden bg-background/50">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Administrator</TableHead>
                <TableHead className="text-xs font-semibold">Security Setting</TableHead>
                <TableHead className="text-xs font-semibold">Previous</TableHead>
                <TableHead className="text-xs font-semibold">Applied</TableHead>
                <TableHead className="text-xs font-semibold text-right">Origin IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No matching audit trail records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.date}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-foreground block">
                          {log.changedBy}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{log.role}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {log.setting}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                      >
                        {log.oldVal}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      >
                        {log.newVal}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredLogs.length} logged modifications</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 w-7 p-0 rounded-lg">
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="font-mono text-[11px] px-1.5">1 / 1</span>
            <Button variant="outline" size="sm" disabled className="h-7 w-7 p-0 rounded-lg">
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
