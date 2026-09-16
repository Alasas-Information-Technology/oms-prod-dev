"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Info,
  Link as LinkIcon,
  Lock,
  RotateCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { usePageBar } from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getRequestById, MOCK_REQUESTS } from "@/components/oms/requests/request.mock-data";
import { OmsRequest } from "@/components/oms/requests/request.types";
import { RequestStatusBadge } from "@/components/oms/requests/RequestStatusBadge";

interface VendorItem {
  id: string;
  name: string;
  contract: string;
  rateMethod: string;
  contractEnd: string;
  eligible: boolean;
  selected: boolean;
}

const MOCK_VENDORS: VendorItem[] = [
  {
    id: "v-1",
    name: "Gulf Talent Solutions",
    contract: "RT-2026-014",
    rateMethod: "Negotiable",
    contractEnd: "31 Dec 2026",
    eligible: true,
    selected: true,
  },
  {
    id: "v-2",
    name: "Emirates Digital Resources",
    contract: "RT-2026-022",
    rateMethod: "Pre-Agreed",
    contractEnd: "30 Jun 2027",
    eligible: true,
    selected: true,
  },
  {
    id: "v-3",
    name: "Nexa Workforce LLC",
    contract: "RT-2025-041",
    rateMethod: "Fixed",
    contractEnd: "30 Nov 2026",
    eligible: true,
    selected: true,
  },
  {
    id: "v-4",
    name: "Regional Tech Partners",
    contract: "Contract expired",
    rateMethod: "—",
    contractEnd: "31 Jul 2026",
    eligible: false,
    selected: false,
  },
];

interface SourceCandidatesWorkspaceProps {
  requestId: string;
}

export function SourceCandidatesWorkspace({ requestId }: SourceCandidatesWorkspaceProps) {
  const router = useRouter();
  const { setCustomCrumbs } = usePageBar();

  // Fetch request or fallback to mock
  const request: OmsRequest = React.useMemo(() => {
    const found = getRequestById(requestId);
    if (found) return found;
    return (
      MOCK_REQUESTS.find((r) => r.requestId === "OMS-2026-0148") ||
      MOCK_REQUESTS[0]
    );
  }, [requestId]);

  // Vendor selection state
  const [vendors, setVendors] = React.useState<VendorItem[]>(MOCK_VENDORS);
  const [cvLimit, setCvLimit] = React.useState<number>(10);
  const [additionalBatch, setAdditionalBatch] = React.useState<number>(10);
  const [simultaneousRelease, setSimultaneousRelease] = React.useState<boolean>(true);
  const [submissionWindow, setSubmissionWindow] = React.useState<string>("5 working days");
  const [submissionDeadline, setSubmissionDeadline] = React.useState<string>("08/12/2026 05:00 PM");

  // Document Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = React.useState<boolean>(false);
  const [isReleasing, setIsReleasing] = React.useState<boolean>(false);

  // Sync breadcrumbs
  React.useEffect(() => {
    setCustomCrumbs([
      { label: "Procurement", href: "/app/procurement" },
      { label: "Sourcing", href: "/app/procurement/sourcing" },
      { label: request.requestId, isCurrent: true },
    ]);
    return () => setCustomCrumbs(null);
  }, [request.requestId, setCustomCrumbs]);

  // Calculated numbers
  const selectedVendorsCount = vendors.filter((v) => v.selected && v.eligible).length;
  const maxInitialCVs = selectedVendorsCount * cvLimit;

  const formattedBudget = React.useMemo(() => {
    return `AED ${request.budget.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [request.budget]);

  // Toggle vendor selection
  const toggleVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === id && v.eligible) {
          return { ...v, selected: !v.selected };
        }
        return v;
      })
    );
  };

  // Select all / deselect all eligible
  const toggleSelectAll = (checked: boolean) => {
    setVendors((prev) =>
      prev.map((v) => (v.eligible ? { ...v, selected: checked } : v))
    );
  };

  const allEligibleSelected = vendors
    .filter((v) => v.eligible)
    .every((v) => v.selected);

  const handleSaveDraft = () => {
    toast.success("Sourcing draft saved successfully", {
      description: `Saved settings for ${request.requestId} with ${selectedVendorsCount} selected vendors.`,
    });
  };

  const handleRelease = () => {
    setIsReleasing(true);
    toast.loading("Releasing candidate requisition to vendors...", { id: "release-toast" });
    setTimeout(() => {
      setIsReleasing(false);
      toast.success(`Released to ${selectedVendorsCount} Qualified Vendors!`, {
        id: "release-toast",
        description: `Notification packages and secure upload URLs generated for ${selectedVendorsCount} vendors.`,
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 dark:bg-slate-950 pb-20 select-none">
      {/* Top Header Section */}
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
              <span>Sourcing</span>
              <span>/</span>
              <span className="font-semibold text-foreground">{request.requestId}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Source Candidates
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {request.position} · {request.resources} resources · {request.candidateRoute || "Unknown candidate route"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-semibold"
            >
              Ready for Vendor Release
            </Badge>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="mt-8 max-w-[1600px] mx-auto overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[700px] px-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 relative group">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shadow-xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                HR Approved
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-primary/80 mx-3" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 relative group">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shadow-xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Document Generated
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-primary/80 mx-3" />

            {/* Step 3 Active */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-slate-100 dark:ring-slate-800">
                3
              </div>
              <span className="text-xs font-bold text-foreground">
                Vendor Selection
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-border mx-3" />

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 relative text-muted-foreground">
              <div className="w-8 h-8 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center font-medium text-xs bg-background">
                4
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Submissions
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-border mx-3" />

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-2 relative text-muted-foreground">
              <div className="w-8 h-8 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center font-medium text-xs bg-background">
                5
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Department Review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="px-6 py-6 max-w-[1600px] mx-auto w-full flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Qualified Vendors Table (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Qualified Vendors
              </h2>
              <div className="flex items-center gap-2">
                <Select defaultValue="cybersecurity">
                  <SelectTrigger className="h-8 text-xs bg-background border-border min-w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cybersecurity">Cybersecurity · Active contracts</SelectItem>
                    <SelectItem value="all">All Accredited Vendors</SelectItem>
                    <SelectItem value="preferred">Tier-1 Preferred Partners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={allEligibleSelected}
                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Vendor
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Contract
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Rate Method
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Contract End
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Eligibility
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className={`border-border/40 transition-colors ${
                        !vendor.eligible ? "opacity-60 bg-muted/20" : "hover:bg-muted/30 cursor-pointer"
                      }`}
                      onClick={() => vendor.eligible && toggleVendor(vendor.id)}
                    >
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          disabled={!vendor.eligible}
                          checked={vendor.selected}
                          onCheckedChange={() => toggleVendor(vendor.id)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-sm text-foreground">
                        {vendor.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {vendor.contract}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">
                        {vendor.rateMethod}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {vendor.contractEnd}
                      </TableCell>
                      <TableCell>
                        {vendor.eligible ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Not eligible
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right Column: Settings & Requirements (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Release Settings */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-foreground">
                Release Settings
              </h2>

              <div className="space-y-3.5 text-xs">
                {/* Generated document */}
                <div className="flex items-center justify-between py-1 border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground font-medium">Generated document</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      OEMS Hiring Request.pdf
                    </span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] px-1.5 py-0">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>

                {/* Submission window */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-foreground font-medium block">Submission window</span>
                    <span className="text-[11px] text-muted-foreground">(Allowed range: 1–15 days)</span>
                  </div>
                  <Select value={submissionWindow} onValueChange={setSubmissionWindow}>
                    <SelectTrigger className="h-8 text-xs w-[140px] bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 working days">3 working days</SelectItem>
                      <SelectItem value="5 working days">5 working days</SelectItem>
                      <SelectItem value="7 working days">7 working days</SelectItem>
                      <SelectItem value="10 working days">10 working days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CV limit per vendor */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground font-medium">CV limit per vendor</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={cvLimit}
                      onChange={(e) => setCvLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-8 w-20 text-xs text-right font-semibold bg-background border-border"
                    />
                    <span className="text-muted-foreground">per vendor</span>
                  </div>
                </div>

                {/* Additional batch */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground font-medium">Additional batch (if required)</span>
                  <Input
                    type="number"
                    value={additionalBatch}
                    onChange={(e) => setAdditionalBatch(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 w-20 text-xs text-right font-semibold bg-background border-border"
                  />
                </div>

                {/* Simultaneous release */}
                <div className="flex items-center justify-between py-1 border-t border-border/40 pt-2.5">
                  <span className="text-foreground font-medium">Simultaneous release</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={simultaneousRelease}
                      onCheckedChange={setSimultaneousRelease}
                    />
                    <span className="font-semibold text-foreground">{simultaneousRelease ? "On" : "Off"}</span>
                  </div>
                </div>

                {/* Submission deadline */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground font-medium">Submission deadline</span>
                  <Input
                    type="text"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    className="h-8 w-44 text-xs font-mono bg-background border-border"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Commercial Response Requirements */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-foreground">
                Commercial Response Requirements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Candidate cost required</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Official quotation required</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Special terms required</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Cost method per approved contract</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium sm:col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Hiring lead time required</span>
                </div>
              </div>

              {/* Info Notice Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-foreground/90">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  Vendor identity and quotation will be hidden from the requesting department during candidate evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Release Summary Section */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Release Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                Selected vendors
              </span>
              <p className="text-lg font-bold text-foreground">{selectedVendorsCount}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Maximum initial CVs
              </span>
              <p className="text-lg font-bold text-foreground">{maxInitialCVs}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                Department
              </span>
              <p className="text-sm font-bold text-foreground">{request.department}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                Approved budget
              </span>
              <p className="text-sm font-bold text-foreground">{formattedBudget}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                Procurement visibility
              </span>
              <p className="text-sm font-bold text-foreground">Full</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Department visibility
              </span>
              <p className="text-sm font-bold text-foreground">Anonymised</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Secure submission route:</span>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs gap-1 font-medium">
              <LinkIcon className="w-3 h-3" />
              Signed link
            </Badge>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs gap-1 font-medium">
              <Clock className="w-3 h-3" />
              Expiry enforced
            </Badge>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Submission audit enabled
            </Badge>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Sticky Action Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>All selected vendors will be notified simultaneously.</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium rounded-lg"
              onClick={() => setShowPreviewModal(true)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Preview Hiring Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium rounded-lg"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              disabled={isReleasing || selectedVendorsCount === 0}
              onClick={handleRelease}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isReleasing
                ? "Releasing..."
                : `Release to ${selectedVendorsCount} Vendors`}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-card border border-border">
            <DialogHeader className="border-b border-border pb-4">
              <DialogTitle className="text-lg font-bold flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-primary" />
                  OEMS Hiring Request Document Preview
                </span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  CONFIDENTIAL
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 text-xs text-foreground space-y-4">
              <div className="border border-border rounded-lg p-4 bg-muted/30 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm">DUBAI INTEGRATED ECONOMIC ZONES AUTHORITY</h4>
                  <p className="text-muted-foreground text-[11px]">Sourcing & Candidate Requisition Package</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-foreground">{request.requestId}</span>
                  <p className="text-[11px] text-muted-foreground">{request.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-muted-foreground block">Selected Vendors Count:</span>
                  <span className="font-bold text-foreground">{selectedVendorsCount} qualified vendors</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Initial CV Allocation:</span>
                  <span className="font-bold text-foreground">{maxInitialCVs} max initial CVs</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Approved Budget:</span>
                  <span className="font-bold text-primary">{formattedBudget}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Submission Deadline:</span>
                  <span className="font-mono font-bold text-foreground">{submissionDeadline}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold mb-1">Target Positions & Justification:</h5>
                <p className="p-3 bg-muted/20 border border-border rounded text-muted-foreground leading-relaxed">
                  {request.justification}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setShowPreviewModal(false)}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
