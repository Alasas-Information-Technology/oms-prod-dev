"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Info,
  MapPin,
  Briefcase,
  Layers,
  Coins,
  ArrowUpRight,
  X,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount } from "@/lib/money";
import { getVendorContracts } from "@/src/lib/demo-data";
import { VendorContract, RateCardTemplate } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorContractsWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type ContractFilter = "ALL" | "ACTIVE" | "EXPIRED";

export function VendorContractsWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorContractsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<ContractFilter>("ALL");
  const [selectedContract, setSelectedContract] = React.useState<VendorContract | null>(null);
  const [isDownloadToastOpen, setIsDownloadToastOpen] = React.useState(false);

  // Load contracts scoped strictly to this vendor
  const contracts = React.useMemo(() => getVendorContracts(vendorId), [vendorId]);

  // Metric counts
  const activeContractsCount = React.useMemo(
    () => contracts.filter((c) => c.status === "ACTIVE").length,
    [contracts]
  );
  const expiredContractsCount = React.useMemo(
    () => contracts.filter((c) => c.status === "EXPIRED").length,
    [contracts]
  );

  // Filtering
  const filteredContracts = React.useMemo(() => {
    return contracts.filter((contract) => {
      // Filter by tab
      if (activeFilter === "ACTIVE" && contract.status !== "ACTIVE") return false;
      if (activeFilter === "EXPIRED" && contract.status !== "EXPIRED") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = contract.contractCode.toLowerCase().includes(q);
        const matchesTitle = contract.title.toLowerCase().includes(q);
        const matchesTemplate = contract.template.toLowerCase().includes(q);
        const matchesPositions = contract.applicablePositions.some((pos) =>
          pos.toLowerCase().includes(q)
        );
        if (!matchesCode && !matchesTitle && !matchesTemplate && !matchesPositions) {
          return false;
        }
      }

      return true;
    });
  }, [contracts, activeFilter, searchQuery]);

  // Work Location Template formatter
  const formatTemplateLabel = (template: RateCardTemplate): string => {
    switch (template) {
      case "DIEZA_PREMISES":
        return "DIEZA Premises (Onsite)";
      case "UAE_REMOTE_WFH":
        return "UAE Remote (WFH)";
      case "UAE_REMOTE_OFFICE":
        return "UAE Remote (Vendor Office)";
      case "REMOTE_ABROAD":
        return "Remote (Abroad)";
      case "PRE_AGREED":
        return "Pre-Agreed Contracted Rate";
      default:
        return template;
    }
  };

  const handleDownload = (code: string) => {
    setIsDownloadToastOpen(true);
    setTimeout(() => setIsDownloadToastOpen(false), 3000);
  };

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Commercial & Procurement
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              Master Agreements
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Vendor Contracts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Active and historical master service agreements established between Falcon Tech Resourcing
            and Dubai Integrated Economic Zones Authority (DIEZ).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/vendor/rates">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-border/70 hover:bg-muted/40"
            >
              <Coins className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              View Rate Cards
            </Button>
          </Link>
          <Link href="/vendor/support">
            <Button
              size="sm"
              className="text-xs h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Contact Procurement
            </Button>
          </Link>
        </div>
      </div>

      {/* Procurement Origination Notice (Part 4.6 Read-Mostly Requirement) */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent text-xs text-foreground/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              Read-Mostly Master Data — Procurement Origination
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300">
                Domain 3 Governance
              </span>
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Contracts originate from and are legally managed by the DIEZ Procurement Division. Commercial terms,
              pre-agreed rate schedules, and validity dates are binding. Amendments or role scope additions require
              formal addenda through DIEZ Procurement.
            </p>
          </div>
        </div>
        <Link
          href="/vendor/support"
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          Request Addendum
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Agreements</span>
            <p className="text-2xl font-bold text-foreground">{contracts.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <FileText className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Active MSA
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeContractsCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Historical / Expired</span>
            <p className="text-2xl font-bold text-muted-foreground">
              {expiredContractsCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Pre-Agreed Rate Cap</span>
            <p className="text-lg font-bold tabular-nums text-foreground">
              AED {formatAmount(contracts[0]?.preAgreedMonthlyRate || 0)}
              <span className="text-[11px] font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Coins className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/60 w-fit">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              activeFilter === "ALL"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All Contracts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
              {contracts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("ACTIVE")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              activeFilter === "ACTIVE"
                ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Active Agreements</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {activeContractsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("EXPIRED")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              activeFilter === "EXPIRED"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Historical & Expired</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
              {expiredContractsCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, title, role..."
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Contracts List Grid */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <Card className="p-8 rounded-xl border border-dashed text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No contracts found</p>
            <p className="text-xs text-muted-foreground">
              No commercial agreements matched your filter criteria.
            </p>
          </Card>
        ) : (
          filteredContracts.map((contract) => {
            const isActive = contract.status === "ACTIVE";

            return (
              <Card
                key={contract.id}
                className={cn(
                  "p-5 sm:p-6 rounded-xl border transition-all duration-200 bg-card space-y-5",
                  isActive
                    ? "border-teal-500/30 hover:border-teal-500/50 hover:shadow-xs"
                    : "border-border/60 opacity-80 hover:opacity-100"
                )}
              >
                {/* Top Row: Code, Template, Status, Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-muted/80 text-foreground border border-border/70 tracking-wide">
                      {contract.contractCode}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium border-teal-500/30 text-teal-700 dark:text-teal-300 bg-teal-500/10 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      {formatTemplateLabel(contract.template)}
                    </Badge>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border">
                        EXPIRED
                      </span>
                    )}
                  </div>

                  {/* Validity Dates */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>
                      {contract.validFrom} &rarr; {contract.validTo}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Active Term
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Concluded
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Title & Pre-Agreed Rates */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {contract.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Procurement Origin: DIEZ Corporate Commercial Sourcing & Vendor Operations
                      </p>
                    </div>

                    {/* Applicable Positions */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        Pre-Approved Contracted Roles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {contract.applicablePositions.map((pos) => (
                          <span
                            key={pos}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/50"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pre-Agreed Commercial Rate Card (Minor units format via formatAmount) */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Pre-Agreed Contract Rate
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                        RFP Mode 3
                      </span>
                    </div>

                    <div className="pt-1 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Monthly Rate:</span>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          AED {formatAmount(contract.preAgreedMonthlyRate)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Daily Equivalent:</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          AED {formatAmount(contract.preAgreedDailyRate)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                      Directly resolvable in Candidate Submission (VP2) under "Pre-Agreed" mode.
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Governing Laws: Emirate of Dubai & DIEZ Free Zone Regulations</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(contract.contractCode)}
                      className="text-xs h-8 gap-1.5 border-border/70 hover:bg-muted/40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                      className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      View Contract Terms
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Contract Terms Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedContract && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted border text-foreground">
                    {selectedContract.contractCode}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs border-teal-500/30 text-teal-600 bg-teal-500/10"
                  >
                    {formatTemplateLabel(selectedContract.template)}
                  </Badge>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground pt-1">
                  {selectedContract.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official terms and conditions recorded with DIEZ Procurement Division.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs text-foreground/90">
                {/* Commercial Summary Box */}
                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>Approved Pre-Agreed Master Rates:</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      AED {formatAmount(selectedContract.preAgreedMonthlyRate)} / month
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Daily Rate (22 billable days/month):</span>
                    <span>
                      AED {formatAmount(selectedContract.preAgreedDailyRate)} / day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Term Validity:</span>
                    <span>
                      {selectedContract.validFrom} to {selectedContract.validTo}
                    </span>
                  </div>
                </div>

                {/* Key Legal Articles & Covenants */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                    Key Legal Provisions & Service Level Covenants
                  </h4>

                  <div className="space-y-2 text-[11px] leading-relaxed text-muted-foreground">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <strong className="text-foreground">Article 4 — Payment Terms:</strong> Net 30 days
                      following the receipt of a valid tax invoice and DIEZ hiring department monthly
                      timesheet approval. Payments are disbursed in UAE Dirhams (AED).
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <strong className="text-foreground">Article 7 — Intellectual Property:</strong> All
                      work products, software modifications, threat telemetry, and technical documentation
                      developed by deployed contractors vest unconditionally and exclusively in DIEZ.
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <strong className="text-foreground">Article 9 — Confidentiality & UAE Law:</strong> Strict
                      adherence to UAE Federal Decree Law No. 45/2021 regarding Personal Data Protection and
                      DIEZ Information Security Policies. Any data breach requires notification within 4 hours.
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <strong className="text-foreground">Article 12 — Candidate Submission SLA:</strong> Vendor
                      commits to a lead time of no greater than 14 business days from requisition publication
                      to candidate proposal.
                    </div>
                  </div>
                </div>

                {/* Covered Positions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                    Authorized Staffing Roles Under This Agreement
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContract.applicablePositions.map((pos) => (
                      <span
                        key={pos}
                        className="px-2.5 py-1 rounded bg-muted/60 text-foreground font-medium text-xs border border-border/60"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-3">
                <span className="text-[11px] text-muted-foreground">
                  Reference: DIEZ-PROC-MSA-SEC-42
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContract(null)}
                    className="text-xs h-8"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleDownload(selectedContract.contractCode);
                      setSelectedContract(null);
                    }}
                    className="text-xs h-8 gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Executed Copy
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Simulated Download Notification */}
      {isDownloadToastOpen && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-card border border-teal-500/40 shadow-lg text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Agreement Export Ready</p>
            <p className="text-muted-foreground text-[11px]">
              The official executed contract PDF has been prepared for download.
            </p>
          </div>
          <button
            onClick={() => setIsDownloadToastOpen(false)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
