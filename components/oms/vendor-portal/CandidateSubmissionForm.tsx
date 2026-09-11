"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UserPlus,
  Briefcase,
  Upload,
  Coins,
  FileCheck2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { ClarificationAttachment } from "@/types/clarification";
import {
  listVendorRequisitions,
  getVendorRateCards,
  getVendorContracts,
  submitVendorCandidate,
} from "@/src/lib/demo-data";
import {
  CostEntryMode,
  CandidateSubmissionReceipt,
  VendorRequisition,
} from "@/src/lib/demo-data/entities";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface CandidateSubmissionFormProps {
  initialRequisitionId?: string;
  vendorId?: string;
  className?: string;
}

export function CandidateSubmissionForm({
  initialRequisitionId,
  vendorId = "ven-falcon",
  className,
}: CandidateSubmissionFormProps) {
  const router = useRouter();

  // Master demo data
  const requisitions = React.useMemo(
    () => listVendorRequisitions(vendorId),
    [vendorId]
  );
  const rateCards = React.useMemo(
    () => getVendorRateCards(vendorId),
    [vendorId]
  );
  const contracts = React.useMemo(
    () => getVendorContracts(vendorId),
    [vendorId]
  );

  const publishedRateCards = React.useMemo(
    () => rateCards.filter((rc) => rc.status === "PUBLISHED"),
    [rateCards]
  );

  const [selectedRateCardId, setSelectedRateCardId] = React.useState<string>(
    () => publishedRateCards[0]?.id || ""
  );

  const activeRateCard = React.useMemo(
    () =>
      publishedRateCards.find((rc) => rc.id === selectedRateCardId) ||
      publishedRateCards[0] ||
      null,
    [publishedRateCards, selectedRateCardId]
  );

  const activeContract = React.useMemo(
    () => contracts.find((c) => c.status === "ACTIVE") || contracts[0] || null,
    [contracts]
  );

  // Form State
  const [selectedReqId, setSelectedReqId] = React.useState<string>(
    initialRequisitionId || (requisitions.find((r) => r.submissionWindow.isOpen)?.id || "")
  );

  // Candidate Details
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("+971 50 ");
  const [nationality, setNationality] = React.useState("UAE");
  const [residentStatus, setResidentStatus] = React.useState<"ONSHORE" | "OFFSHORE">("ONSHORE");
  const [experienceYears, setExperienceYears] = React.useState<number>(6);
  const [noticePeriod, setNoticePeriod] = React.useState("Immediate");

  // CV Attachment
  const [attachments, setAttachments] = React.useState<ClarificationAttachment[]>([]);

  // Cost Mode & Commercials
  const [costMode, setCostMode] = React.useState<CostEntryMode>("NEGOTIABLE");
  const [selectedGradeCode, setSelectedGradeCode] = React.useState<string>("G8");
  const [fixedAmountAed, setFixedAmountAed] = React.useState<string>("330000");
  const [leadTimeDays, setLeadTimeDays] = React.useState<number>(14);
  const [specialTerms, setSpecialTerms] = React.useState("");

  // Confirmation Modal & Submission State
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [receipt, setReceipt] = React.useState<CandidateSubmissionReceipt | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Active Requisition
  const currentReq = React.useMemo(
    () => requisitions.find((r) => r.id === selectedReqId),
    [requisitions, selectedReqId]
  );

  const selectedGrade = React.useMemo(
    () => activeRateCard?.grades.find((g) => g.gradeCode === selectedGradeCode),
    [activeRateCard, selectedGradeCode]
  );

  // Calculate resolved amount in fils
  const resolvedCost = React.useMemo(() => {
    if (costMode === "FIXED") {
      const numAed = parseFloat(fixedAmountAed.replace(/[^0-9.]/g, "")) || 0;
      const fils = Math.round(numAed * 100);
      return {
        annualFils: fils,
        monthlyFils: Math.round(fils / 12),
        label: "Fixed Commercial Quote",
      };
    }
    if (costMode === "NEGOTIABLE" && selectedGrade) {
      return {
        annualFils: selectedGrade.monthlyRate * 12,
        monthlyFils: selectedGrade.monthlyRate,
        dailyFils: selectedGrade.dailyRate,
        label: `Published Rate Card (${selectedGrade.gradeCode} · ${selectedGrade.level})`,
      };
    }
    if (costMode === "PRE_AGREED" && activeContract) {
      return {
        annualFils: activeContract.preAgreedMonthlyRate * 12,
        monthlyFils: activeContract.preAgreedMonthlyRate,
        dailyFils: activeContract.preAgreedDailyRate,
        label: `Active Contract (${activeContract.contractCode})`,
      };
    }
    return { annualFils: 0, monthlyFils: 0, label: "Unspecified" };
  }, [costMode, fixedAmountAed, selectedGrade, activeContract]);

  // Batch limit tracker
  const batchCount = currentReq ? currentReq.mySubmissionsCount : 0;
  const isBatchLimitReached = batchCount >= 10;
  const isWindowClosed = currentReq ? !currentReq.submissionWindow.isOpen : false;

  // Validation
  const validateForm = (): boolean => {
    setFormError(null);
    if (!selectedReqId) {
      setFormError("Please select a target requisition.");
      return false;
    }
    if (isWindowClosed) {
      setFormError("The submission window for this requisition is closed.");
      return false;
    }
    if (isBatchLimitReached) {
      setFormError("The 10-CV batch limit has been reached for this requirement.");
      return false;
    }
    if (!fullName.trim()) {
      setFormError("Candidate full name is required.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("A valid candidate email address is required.");
      return false;
    }
    if (!mobile.trim() || mobile.length < 7) {
      setFormError("A valid contact number is required.");
      return false;
    }
    if (attachments.length === 0) {
      setFormError("Candidate CV attachment is mandatory. Please upload a verified PDF/Word CV.");
      return false;
    }
    if (costMode === "FIXED" && (!resolvedCost.annualFils || resolvedCost.annualFils <= 0)) {
      setFormError("Please enter a valid fixed annual cost amount in AED.");
      return false;
    }
    if (costMode === "NEGOTIABLE") {
      if (!activeRateCard) {
        setFormError("Negotiable cost mode requires an approved, published rate card with DIEZ Procurement.");
        return false;
      }
      if (!selectedGrade) {
        setFormError("Please select a valid grade from your published rate card.");
        return false;
      }
    }
    if (!leadTimeDays || leadTimeDays < 0) {
      setFormError("Lead time in days is required.");
      return false;
    }
    return true;
  };

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    try {
      const result = submitVendorCandidate({
        requisitionId: selectedReqId,
        vendorId,
        candidate: {
          fullName,
          email,
          mobile,
          nationality,
          residentStatus,
          experienceYears,
          noticePeriod,
        },
        cvAttachment: {
          id: attachments[0].id,
          name: attachments[0].name,
          sizeBytes: attachments[0].sizeBytes,
          url: attachments[0].url,
        },
        costMode,
        rateCardGradeCode: costMode === "NEGOTIABLE" ? selectedGradeCode : undefined,
        fixedAmount: costMode === "FIXED" ? resolvedCost.annualFils : undefined,
        contractId: costMode === "PRE_AGREED" ? activeContract?.id : undefined,
        leadTimeDays,
        specialTerms: specialTerms.trim() || undefined,
      });

      setReceipt(result);
      setIsConfirmOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit candidate.");
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("+971 50 ");
    setAttachments([]);
    setReceipt(null);
    setFormError(null);
    setSpecialTerms("");
  };

  // Receipt Card after successful submission
  if (receipt) {
    return (
      <div className={cn("w-full max-w-3xl mx-auto px-4 py-8 space-y-6 select-none", className)}>
        <Card className="rounded-xl border border-teal-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <div className="size-14 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Candidate Submission Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {receipt.message}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border/50 divide-y divide-border/40 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-muted-foreground">Target Requirement:</span>
              <span className="font-semibold text-foreground">{receipt.positionTitle} ({receipt.requisitionId})</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Candidate Reference Assigned:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">{receipt.candidateRef}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Cost Mode:</span>
              <Badge variant="outline" className="text-[11px] font-mono">{receipt.costMode}</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Quoted Rate:</span>
              <span className="font-bold text-foreground tabular-nums">
                AED {formatAmount(receipt.resolvedMonthlyFils)} / month (AED {formatAmount(receipt.resolvedAmountFils)} / year)
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Lead Time to Deploy:</span>
              <span className="font-medium text-foreground">{receipt.leadTimeDays} days</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Batch Submission Counter:</span>
              <span className="font-semibold text-foreground">
                CV {receipt.batchSubmissionNumber} of {receipt.maxBatchSize} in current batch
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
            <ShieldCheck className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Competitor Isolation Active:</strong> This submission and commercial quote are visible strictly to DIEZ Procurement. Competitor vendors invited to this requirement cannot view your candidates or rates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleResetForm}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs"
            >
              <UserPlus className="size-3.5 mr-1.5" />
              Submit Another Candidate
            </Button>
            <Button
              asChild
              size="sm"
              className="w-full sm:w-auto text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
            >
              <Link href="/vendor/submissions/history">
                View Submission History
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col bg-background pb-16 space-y-6", className)}>
      {/* 1. Header Bar */}
      <div className="w-full bg-background border-b border-border/70 px-4 sm:px-6 py-4 space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Link href="/vendor" className="hover:text-foreground transition-colors">
                Vendor Portal
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">Submit Candidate</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Submit Candidate
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium">
                RFP Sourcing Workflow
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Submit verified technical candidates against active DIEZ requisitions · 10-CV batch limit per requirement
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild variant="outline" size="sm" className="h-9 text-xs font-medium">
              <Link href="/vendor/requisitions">
                <Briefcase className="size-3.5 mr-1.5" />
                Browse Requirements
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
        {formError && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{formError}</p>
          </div>
        )}

        <form onSubmit={handleOpenReview} className="space-y-6">
          {/* Section 1: Target Requisition Selection */}
          <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  1. Target Requirement
                </h2>
              </div>
              {currentReq && (
                <span className="text-xs text-muted-foreground font-mono">
                  {currentReq.mySubmissionsCount} of {currentReq.submissionWindow.maxBatchSize} CVs submitted
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-select" className="text-xs font-medium">
                Select Active Requisition <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedReqId} onValueChange={setSelectedReqId}>
                <SelectTrigger id="req-select" className="w-full text-xs h-10">
                  <SelectValue placeholder="Choose an open requirement..." />
                </SelectTrigger>
                <SelectContent>
                  {requisitions.map((req) => (
                    <SelectItem
                      key={req.id}
                      value={req.id}
                      disabled={!req.submissionWindow.isOpen}
                      className="text-xs py-2"
                    >
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="font-semibold">{req.positionTitle} ({req.id})</span>
                        <span className="text-muted-foreground">
                          {req.submissionWindow.isOpen
                            ? `${req.submissionWindow.daysRemaining}d left in window`
                            : "Window Closed"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Requisition Batch Status Card */}
            {currentReq && (
              <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {currentReq.positionTitle} · {currentReq.departmentName}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Grade {currentReq.salaryGrade} · {currentReq.workLocation}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Falcon Tech Batch Usage:</span>
                    <span className="font-bold text-foreground tabular-nums">
                      {currentReq.mySubmissionsCount} of {currentReq.submissionWindow.maxBatchSize} CVs submitted
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        currentReq.mySubmissionsCount >= 10
                          ? "bg-rose-500"
                          : currentReq.mySubmissionsCount > 0
                          ? "bg-teal-500"
                          : "bg-transparent"
                      )}
                      style={{
                        width: `${Math.min(
                          (currentReq.mySubmissionsCount / currentReq.submissionWindow.maxBatchSize) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {isBatchLimitReached && (
                  <p className="text-[11px] text-destructive font-semibold pt-1">
                    ⚠️ Batch limit reached: You have submitted the maximum 10 CVs permitted for this requirement.
                  </p>
                )}
                {isWindowClosed && (
                  <p className="text-[11px] text-destructive font-semibold pt-1">
                    ⚠️ Sourcing window is closed for this requirement ({currentReq.submissionWindow.closedReason}).
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Section 2: Candidate Information */}
          <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <UserPlus className="size-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                2. Candidate Identification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cand-name" className="text-xs font-medium">
                  Candidate Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cand-name"
                  placeholder="e.g. Tariq Al-Hashmi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-email" className="text-xs font-medium">
                  Candidate Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cand-email"
                  type="email"
                  placeholder="tariq@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-mobile" className="text-xs font-medium">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cand-mobile"
                  placeholder="+971 50 123 4567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-nat" className="text-xs font-medium">
                  Nationality
                </Label>
                <Input
                  id="cand-nat"
                  placeholder="e.g. UAE, Jordan, India, UK"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-res" className="text-xs font-medium">
                  Residency Status
                </Label>
                <Select
                  value={residentStatus}
                  onValueChange={(val: "ONSHORE" | "OFFSHORE") => setResidentStatus(val)}
                >
                  <SelectTrigger id="cand-res" className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSHORE" className="text-xs">UAE Onshore Resident</SelectItem>
                    <SelectItem value="OFFSHORE" className="text-xs">Offshore / Remote International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-exp" className="text-xs font-medium">
                  Relevant Experience (Years)
                </Label>
                <Input
                  id="cand-exp"
                  type="number"
                  min={0}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-notice" className="text-xs font-medium">
                  Notice Period
                </Label>
                <Input
                  id="cand-notice"
                  placeholder="e.g. Immediate, 2 weeks, 30 days"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </Card>

          {/* Section 3: CV Upload via AttachmentList */}
          <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="size-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  3. Candidate Curriculum Vitae (CV) <span className="text-destructive">*</span>
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                PDF or Word Document · Mandatory
              </span>
            </div>

            <div className="space-y-2">
              <AttachmentList
                attachments={attachments}
                editable={true}
                scanningStates={true}
                showDropzone={attachments.length === 0}
                onAddAttachment={(att) => {
                  setAttachments([att]);
                }}
                onRemoveAttachment={() => {
                  setAttachments([]);
                }}
                title="Candidate CV File"
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-teal-600" />
                Uploaded CVs are automatically scanned for malware before forwarding to DIEZ hiring managers.
              </p>
            </div>
          </Card>

          {/* Section 4: Commercial Terms & RFP Cost Entry Modes */}
          <Card className="rounded-xl border border-border/70 dark:border-white/[0.08] bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  4. Commercial Terms & Quoted Rate (RFP Step 4)
                </h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Mode: {costMode}
              </span>
            </div>

            {/* Cost Mode Selection Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">
                Select Cost Mode <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Fixed Mode */}
                <div
                  onClick={() => setCostMode("FIXED")}
                  className={cn(
                    "p-3.5 rounded-lg border text-left cursor-pointer transition-all select-none space-y-1.5",
                    costMode === "FIXED"
                      ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15 ring-1 ring-teal-500"
                      : "border-border/60 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Fixed</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                      Single Rate
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Custom fixed rate quote in exact AED.
                  </p>
                </div>

                {/* Negotiable Mode */}
                <div
                  onClick={() => setCostMode("NEGOTIABLE")}
                  className={cn(
                    "p-3.5 rounded-lg border text-left cursor-pointer transition-all select-none space-y-1.5",
                    costMode === "NEGOTIABLE"
                      ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15 ring-1 ring-teal-500"
                      : "border-border/60 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Negotiable</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono">
                      Rate Card
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Resolves strictly from Falcon Tech's published rate card.
                  </p>
                </div>

                {/* Pre-Agreed Mode */}
                <div
                  onClick={() => setCostMode("PRE_AGREED")}
                  className={cn(
                    "p-3.5 rounded-lg border text-left cursor-pointer transition-all select-none space-y-1.5",
                    costMode === "PRE_AGREED"
                      ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15 ring-1 ring-teal-500"
                      : "border-border/60 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Pre-Agreed</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                      Contract MSA
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Read-only rate resolved from active DIEZ contract.
                  </p>
                </div>
              </div>
            </div>

            {/* Mode-specific Input Form */}
            {costMode === "FIXED" && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fixed-input" className="text-xs font-medium">
                    Quoted Annual Cost (AED) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      AED
                    </span>
                    <Input
                      id="fixed-input"
                      type="number"
                      step="1000"
                      min="10000"
                      value={fixedAmountAed}
                      onChange={(e) => setFixedAmountAed(e.target.value)}
                      className="pl-14 text-xs font-mono font-semibold h-10"
                      placeholder="330000"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Equivalent to <strong className="text-foreground">AED {formatAmount(resolvedCost.monthlyFils)}</strong> / month.
                  </p>
                </div>
              </div>
            )}

            {costMode === "NEGOTIABLE" && (
              <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/30 space-y-3">
                {!activeRateCard ? (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>No Approved & Published Rate Card Available</span>
                    </div>
                    <p className="text-muted-foreground">
                      Negotiable mode resolves strictly against Procurement-approved rate cards.
                      Your rate cards currently in Draft or Submitted status cannot be used until approved and published by DIEZ Procurement.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/vendor/rates"
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold underline text-xs"
                      >
                        View Rate Cards Master Data & Status &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {publishedRateCards.length > 1 && (
                      <div className="space-y-1.5 pb-2 border-b border-border/40">
                        <Label htmlFor="rate-card-select" className="text-xs font-medium text-foreground">
                          Select Published Rate Card
                        </Label>
                        <Select
                          value={selectedRateCardId}
                          onValueChange={(val) => {
                            setSelectedRateCardId(val);
                            const card = publishedRateCards.find((c) => c.id === val);
                            if (card && card.grades.length > 0) {
                              setSelectedGradeCode(card.grades[0].gradeCode);
                            }
                          }}
                        >
                          <SelectTrigger id="rate-card-select" className="w-full text-xs h-9 font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {publishedRateCards.map((rc) => (
                              <SelectItem key={rc.id} value={rc.id} className="text-xs">
                                {rc.code} — {rc.name} ({rc.template})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="grade-select" className="text-xs font-medium text-foreground">
                          Select Published Rate Card Grade <span className="text-destructive">*</span>
                        </Label>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                          Card: {activeRateCard.code} · Status: PUBLISHED
                        </span>
                      </div>

                      <Select value={selectedGradeCode} onValueChange={setSelectedGradeCode}>
                        <SelectTrigger id="grade-select" className="w-full text-xs h-10 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activeRateCard.grades.map((grade) => (
                            <SelectItem key={grade.gradeCode} value={grade.gradeCode} className="text-xs py-2">
                              <div className="flex items-center justify-between gap-4 w-full">
                                <span className="font-bold">{grade.gradeCode} ({grade.level})</span>
                                <span>{grade.roleTitle}</span>
                                <span className="font-mono text-teal-600 font-semibold">
                                  AED {formatAmount(grade.monthlyRate)}/mo
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Resolved Grade Details (Hand-typing disabled) */}
                {selectedGrade && (
                  <div className="p-3 rounded-md bg-background/80 border border-teal-500/20 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Role Classification:</span>
                      <span className="font-semibold text-foreground">{selectedGrade.roleTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Base Salary Band:</span>
                      <span className="font-mono text-foreground">
                        AED {formatAmount(selectedGrade.minSalary)} – AED {formatAmount(selectedGrade.maxSalary)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Service Charge:</span>
                      <span className="font-mono text-teal-600 font-medium">{selectedGrade.serviceChargePercent}%</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 font-bold">
                      <span className="text-foreground">Official Approved Monthly Rate:</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400 text-sm">
                        AED {formatAmount(selectedGrade.monthlyRate)} / mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Annualized Total Quoted Rate:</span>
                      <span className="font-mono text-foreground font-semibold">
                        AED {formatAmount(resolvedCost.annualFils)}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">
                  * Hand-typed amounts are prohibited under Negotiable mode. The rate resolves directly from your official DIEZ-approved published rate card.
                </p>
              </div>
            )}

            {costMode === "PRE_AGREED" && activeContract && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Active Master Contract: {activeContract.contractCode}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-600">
                    {activeContract.status}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-background border border-border/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contract Agreement:</span>
                    <span className="font-semibold text-foreground">{activeContract.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pre-Agreed Monthly Billing Rate:</span>
                    <span className="font-mono font-bold text-foreground">
                      AED {formatAmount(activeContract.preAgreedMonthlyRate)} / mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pre-Agreed Daily Billing Rate:</span>
                    <span className="font-mono text-foreground">
                      AED {formatAmount(activeContract.preAgreedDailyRate)} / day
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Annualized Pre-Agreed Value:</span>
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                      AED {formatAmount(resolvedCost.annualFils)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Read-only contract rate governed by active DIEZ Master Services Agreement.
                </p>
              </div>
            )}

            {/* Lead Time & Special Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="lead-time" className="text-xs font-medium">
                  Lead Time to Deploy (Days) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lead-time"
                  type="number"
                  min={0}
                  max={180}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="special-terms" className="text-xs font-medium">
                  Special Commercial Terms (Optional)
                </Label>
                <Textarea
                  id="special-terms"
                  placeholder="e.g. Pre-authorized weekend shift allowances, equipment supply terms, or specific visa readiness notes..."
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  className="text-xs min-h-[70px]"
                />
              </div>
            </div>
          </Card>

          {/* Submit Action Strip */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isBatchLimitReached || isWindowClosed}
              className={cn(
                "text-xs font-semibold px-6 h-10 shadow-xs gap-1.5",
                isBatchLimitReached || isWindowClosed
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              <Sparkles className="size-4" />
              Review & Submit Candidate
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Confirm Candidate Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please review the candidate details and commercial quote before formal submission to DIEZ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 divide-y divide-border/40 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-muted-foreground">Requisition:</span>
                <span className="font-semibold text-foreground">{currentReq?.positionTitle} ({currentReq?.id})</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Candidate:</span>
                <span className="font-bold text-foreground">{fullName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Cost Mode:</span>
                <span className="font-mono">{costMode}</span>
              </div>
              <div className="flex items-center justify-between py-1 font-bold">
                <span className="text-foreground">Quoted Rate:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">
                  AED {formatAmount(resolvedCost.monthlyFils)} / mo
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Annualized Value:</span>
                <span className="font-mono text-foreground font-semibold">
                  AED {formatAmount(resolvedCost.annualFils)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Lead Time:</span>
                <span className="font-medium text-foreground">{leadTimeDays} days</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">CV Attached:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {attachments[0]?.name || "CV File"}
                </span>
              </div>
            </div>

            {/* Visible to DIEZ only statement */}
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Confidential Submission:</strong> This submission is visible exclusively to DIEZ Procurement and Hiring Panels. It will never be disclosed to other vendors.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              className="text-xs"
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
              className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit to DIEZ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
