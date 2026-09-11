"use client";

import * as React from "react";
import Link from "next/link";
import {
  Coins,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  Trash2,
  Plus,
  Edit2,
  Send,
  Eye,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatAmount } from "@/lib/money";
import {
  getVendorRateCards,
  createOrUpdateVendorRateCard,
  submitVendorRateCardForApproval,
  publishVendorRateCard,
  exportRateCardTemplateCsv,
  parseRateCardCsv,
} from "@/src/lib/demo-data";
import {
  RateCard,
  RateCardGrade,
  RateCardTemplate,
  RateCardStatus,
} from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorRateCardsWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type StatusFilter = "ALL" | "PUBLISHED" | "SUBMITTED" | "DRAFT";
type TemplateFilter = "ALL" | RateCardTemplate;

interface EditableGradeRow {
  gradeCode: string;
  level: string;
  roleTitle: string;
  minSalaryAed: number;
  maxSalaryAed: number;
  serviceChargePercent: number;
}

export function VendorRateCardsWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorRateCardsWorkspaceProps) {
  // State for cards list
  const [rateCards, setRateCards] = React.useState<RateCard[]>(() =>
    getVendorRateCards(vendorId)
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [templateFilter, setTemplateFilter] = React.useState<TemplateFilter>("ALL");
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>("rc-falcon-001");

  // Notification message
  const [toastMessage, setToastMessage] = React.useState<{
    title: string;
    description: string;
    type: "SUCCESS" | "INFO";
  } | null>(null);

  // Upload & Parsed Preview Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<"CHOOSE_FILE" | "PARSED_PREVIEW">(
    "CHOOSE_FILE"
  );
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<RateCardTemplate>("UAE_REMOTE_OFFICE");
  const [cardCode, setCardCode] = React.useState("RC-FT-RO-2026");
  const [cardName, setCardName] = React.useState(
    "Falcon Tech UAE Remote Office Engineering Schedule"
  );
  const [effectiveFrom, setEffectiveFrom] = React.useState("2026-07-01");
  const [effectiveTo, setEffectiveTo] = React.useState("2027-06-30");
  const [previewGrades, setPreviewGrades] = React.useState<EditableGradeRow[]>([]);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Re-read rate cards helper
  const refreshRateCards = () => {
    setRateCards([...getVendorRateCards(vendorId)]);
  };

  const showToast = (title: string, description: string, type: "SUCCESS" | "INFO" = "SUCCESS") => {
    setToastMessage({ title, description, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // KPI Metrics
  const publishedCount = React.useMemo(
    () => rateCards.filter((rc) => rc.status === "PUBLISHED").length,
    [rateCards]
  );
  const submittedCount = React.useMemo(
    () => rateCards.filter((rc) => rc.status === "SUBMITTED").length,
    [rateCards]
  );
  const draftCount = React.useMemo(
    () => rateCards.filter((rc) => rc.status === "DRAFT").length,
    [rateCards]
  );

  // Filtered Cards
  const filteredCards = React.useMemo(() => {
    return rateCards.filter((card) => {
      if (statusFilter !== "ALL" && card.status !== statusFilter) return false;
      if (templateFilter !== "ALL" && card.template !== templateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = card.code.toLowerCase().includes(q);
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesTemplate = card.template.toLowerCase().includes(q);
        const matchesRole = card.grades.some(
          (g) =>
            g.roleTitle.toLowerCase().includes(q) ||
            g.gradeCode.toLowerCase().includes(q)
        );
        if (!matchesCode && !matchesName && !matchesTemplate && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [rateCards, statusFilter, templateFilter, searchQuery]);

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csv = exportRateCardTemplateCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "diez_rate_card_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(
      "CSV Template Downloaded",
      "Standard 5-template rate card CSV structure exported (diez_rate_card_template.csv)."
    );
  };

  // Load sample data into Parsed Preview
  const handleLoadSamplePreview = () => {
    setPreviewError(null);
    setSelectedTemplate("UAE_REMOTE_OFFICE");
    setCardCode("RC-FT-RO-2026");
    setCardName("Falcon Tech UAE Remote (Vendor Office) Rate Schedule");
    setEffectiveFrom("2026-07-01");
    setEffectiveTo("2027-06-30");
    setPreviewGrades([
      {
        gradeCode: "G6",
        level: "Junior",
        roleTitle: "Remote Office Software Test Engineer",
        minSalaryAed: 13000,
        maxSalaryAed: 17000,
        serviceChargePercent: 12,
      },
      {
        gradeCode: "G7",
        level: "Mid-Level",
        roleTitle: "Remote Office Cloud Operations Engineer",
        minSalaryAed: 17000,
        maxSalaryAed: 23000,
        serviceChargePercent: 12,
      },
      {
        gradeCode: "G8",
        level: "Senior",
        roleTitle: "Remote Office Solutions Architect",
        minSalaryAed: 22000,
        maxSalaryAed: 30000,
        serviceChargePercent: 11,
      },
      {
        gradeCode: "G9",
        level: "Lead",
        roleTitle: "Remote Office Technical Delivery Lead",
        minSalaryAed: 30000,
        maxSalaryAed: 40000,
        serviceChargePercent: 10,
      },
    ]);
    setUploadStep("PARSED_PREVIEW");
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseRateCardCsv(text, vendorId);

        setSelectedTemplate(parsed.template);
        setEffectiveFrom(parsed.effectiveFrom);
        setEffectiveTo(parsed.effectiveTo);
        setCardCode(`RC-FT-${parsed.template.substring(0, 4)}-${new Date().getFullYear()}`);
        setCardName(`Falcon Tech ${formatTemplateLabel(parsed.template)} Schedule`);

        setPreviewGrades(
          parsed.grades.map((g) => ({
            gradeCode: g.gradeCode,
            level: g.level,
            roleTitle: g.roleTitle,
            minSalaryAed: Math.round(g.minSalary / 100),
            maxSalaryAed: Math.round(g.maxSalary / 100),
            serviceChargePercent: g.serviceChargePercent,
          }))
        );

        setUploadStep("PARSED_PREVIEW");
      } catch (err: any) {
        setPreviewError(err.message || "Failed to parse rate card CSV.");
      }
    };
    reader.readAsText(file);
  };

  // Inline Preview Grade edit handlers
  const handleUpdateGradeRow = (
    index: number,
    field: keyof EditableGradeRow,
    value: string | number
  ) => {
    setPreviewGrades((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddGradeRow = () => {
    const nextNum = previewGrades.length + 6;
    setPreviewGrades((prev) => [
      ...prev,
      {
        gradeCode: `G${nextNum}`,
        level: nextNum <= 7 ? "Mid-Level" : "Senior",
        roleTitle: "New Technical Role",
        minSalaryAed: 18000,
        maxSalaryAed: 24000,
        serviceChargePercent: 12,
      },
    ]);
  };

  const handleDeleteGradeRow = (index: number) => {
    if (previewGrades.length <= 1) {
      setPreviewError("A rate card must contain at least one grade row.");
      return;
    }
    setPreviewGrades((prev) => prev.filter((_, i) => i !== index));
  };

  // Convert preview rows into official RateCardGrade objects (in fils)
  const buildFinalGrades = (): RateCardGrade[] => {
    return previewGrades.map((row) => {
      const minFils = Math.round(row.minSalaryAed * 100);
      const maxFils = Math.round(row.maxSalaryAed * 100);
      const midAed = (row.minSalaryAed + row.maxSalaryAed) / 2;
      const monthlyRateAed = midAed * (1 + row.serviceChargePercent / 100);
      const monthlyFils = Math.round(monthlyRateAed * 100);
      const dailyFils = Math.round(monthlyFils / 22);

      return {
        gradeCode: row.gradeCode.trim().toUpperCase(),
        level: row.level.trim(),
        roleTitle: row.roleTitle.trim(),
        minSalary: minFils,
        maxSalary: maxFils,
        serviceChargePercent: row.serviceChargePercent,
        monthlyRate: monthlyFils,
        dailyRate: dailyFils,
      };
    });
  };

  // Save as Draft
  const handleSaveDraft = () => {
    try {
      setPreviewError(null);
      if (!cardCode.trim() || !cardName.trim()) {
        setPreviewError("Rate card code and name are required.");
        return;
      }
      const grades = buildFinalGrades();

      const newId = `rc-falcon-${Date.now()}`;
      const newCard: RateCard = {
        id: newId,
        vendorId,
        code: cardCode.trim().toUpperCase(),
        name: cardName.trim(),
        template: selectedTemplate,
        status: "DRAFT",
        effectiveFrom,
        effectiveTo,
        currency: "AED",
        grades,
      };

      createOrUpdateVendorRateCard(newCard);
      refreshRateCards();
      setIsUploadModalOpen(false);
      setExpandedCardId(newId);
      showToast(
        "Rate Card Draft Saved",
        `Rate card ${newCard.code} saved as Draft. You can review and submit to Procurement when ready.`
      );
    } catch (err: any) {
      setPreviewError(err.message || "Failed to save rate card draft.");
    }
  };

  // Save & Submit for Approval
  const handleSubmitForApproval = () => {
    try {
      setPreviewError(null);
      if (!cardCode.trim() || !cardName.trim()) {
        setPreviewError("Rate card code and name are required.");
        return;
      }
      const grades = buildFinalGrades();

      const newId = `rc-falcon-${Date.now()}`;
      const newCard: RateCard = {
        id: newId,
        vendorId,
        code: cardCode.trim().toUpperCase(),
        name: cardName.trim(),
        template: selectedTemplate,
        status: "SUBMITTED",
        effectiveFrom,
        effectiveTo,
        currency: "AED",
        grades,
      };

      createOrUpdateVendorRateCard(newCard);
      refreshRateCards();
      setIsUploadModalOpen(false);
      setExpandedCardId(newId);
      showToast(
        "Submitted for Procurement Approval",
        `Rate card ${newCard.code} submitted to DIEZ Procurement Division for commercial review.`
      );
    } catch (err: any) {
      setPreviewError(err.message || "Failed to submit rate card for approval.");
    }
  };

  // Lifecycle Action: Submit existing Draft
  const handleCardSubmitAction = (cardId: string) => {
    try {
      submitVendorRateCardForApproval(cardId, vendorId);
      refreshRateCards();
      showToast(
        "Submitted for Procurement Approval",
        "Rate card has been transitioned to Submitted status for DIEZ Procurement review."
      );
    } catch (err: any) {
      showToast("Submission Error", err.message, "INFO");
    }
  };

  // Lifecycle Action: Simulate Procurement Approval (Transitions SUBMITTED -> PUBLISHED)
  const handleCardPublishAction = (cardId: string) => {
    try {
      publishVendorRateCard(cardId, vendorId);
      refreshRateCards();
      showToast(
        "Rate Card Approved & Published",
        "Rate card is now PUBLISHED and live. Its grades are now immediately selectable in Submit a Candidate (VP2) Negotiable cost mode."
      );
    } catch (err: any) {
      showToast("Publication Error", err.message, "INFO");
    }
  };

  // Format template label
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

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Master Data & Commercials
            </span>
            <span className="text-muted-foreground/40 font-mono">/</span>
            <span className="text-[11px] font-mono font-medium text-teal-600 dark:text-teal-400">
              5 RFP Templates
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Vendor Rate Cards
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Manage and submit role grade rate cards across the RFP's five standard work-location
            templates. Only Procurement-approved (<strong className="text-foreground">Published</strong>)
            rate cards can be selected for Negotiable candidate submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs h-9 gap-1.5 border-border/70 hover:bg-muted/40"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Template
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setUploadStep("CHOOSE_FILE");
              setPreviewError(null);
              setIsUploadModalOpen(true);
            }}
            className="text-xs h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Rate Card (CSV)
          </Button>
        </div>
      </div>

      {/* 3-Step Lifecycle Visual Stepper & Governance Rule */}
      <div className="p-4 sm:p-5 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent text-xs backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                Master Data Governance Lifecycle
              </span>
              <Badge variant="outline" className="text-[10px] border-teal-500/40 text-teal-600">
                Part 4.7
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
              Per RFP Step 4, Negotiable cost mode in Submit a Candidate (VP2) reads exclusively
              from <strong className="text-foreground">Published</strong> rate cards. Unapproved cards in Draft
              or Submitted status are strictly non-selectable.
            </p>
          </div>

          {/* Stepper Visualization */}
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/80 border border-border/60 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>1. Draft</span>
            </div>
            <span className="text-muted-foreground">&rarr;</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>2. Submitted</span>
            </div>
            <span className="text-muted-foreground">&rarr;</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3. Published</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Rate Cards</span>
            <p className="text-2xl font-bold font-mono text-foreground">{rateCards.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <Coins className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Published (Usable in VP2)
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {publishedCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Under Review (Submitted)
            </span>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {submittedCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Draft Schedules</span>
            <p className="text-2xl font-bold font-mono text-muted-foreground">{draftCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <Edit2 className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/60 w-fit">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              statusFilter === "ALL"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All Cards</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {rateCards.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("PUBLISHED")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              statusFilter === "PUBLISHED"
                ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Published</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
              {publishedCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("SUBMITTED")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              statusFilter === "SUBMITTED"
                ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Submitted</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
              {submittedCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none flex items-center gap-1.5",
              statusFilter === "DRAFT"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Draft</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {draftCount}
            </span>
          </button>
        </div>

        {/* Template Selector & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Select
            value={templateFilter}
            onValueChange={(val: TemplateFilter) => setTemplateFilter(val)}
          >
            <SelectTrigger className="w-full sm:w-56 text-xs h-9 font-medium">
              <SelectValue placeholder="All 5 RFP Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All 5 Templates
              </SelectItem>
              <SelectItem value="DIEZA_PREMISES" className="text-xs">
                DIEZA Premises (Onsite)
              </SelectItem>
              <SelectItem value="UAE_REMOTE_WFH" className="text-xs">
                UAE Remote (WFH)
              </SelectItem>
              <SelectItem value="UAE_REMOTE_OFFICE" className="text-xs">
                UAE Remote (Vendor Office)
              </SelectItem>
              <SelectItem value="REMOTE_ABROAD" className="text-xs">
                Remote (Abroad)
              </SelectItem>
              <SelectItem value="PRE_AGREED" className="text-xs">
                Pre-Agreed Contracted Rate
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, role, grade..."
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Rate Cards Accordion / List */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <Card className="p-8 rounded-xl border border-dashed text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No rate cards found</p>
            <p className="text-xs text-muted-foreground">
              No commercial rate cards matched the selected filters.
            </p>
          </Card>
        ) : (
          filteredCards.map((card) => {
            const isPublished = card.status === "PUBLISHED";
            const isSubmitted = card.status === "SUBMITTED";
            const isDraft = card.status === "DRAFT";
            const isExpanded = expandedCardId === card.id;

            return (
              <Card
                key={card.id}
                className={cn(
                  "rounded-xl border transition-all duration-200 overflow-hidden bg-card",
                  isPublished
                    ? "border-teal-500/30 shadow-xs"
                    : isSubmitted
                    ? "border-amber-500/30"
                    : "border-border/60"
                )}
              >
                {/* Card Summary Header (Click to toggle expansion) */}
                <div
                  onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 select-none transition-colors border-b border-border/40"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-muted text-foreground border border-border/70">
                        {card.code}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium border-teal-500/30 text-teal-700 dark:text-teal-300 bg-teal-500/10 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        {formatTemplateLabel(card.template)}
                      </Badge>

                      {/* Status Badge */}
                      {isPublished && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          PUBLISHED · Active in VP2
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          SUBMITTED · In Procurement Review
                        </span>
                      )}
                      {isDraft && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground border border-border">
                          <Edit2 className="w-3 h-3" />
                          DRAFT · Unapproved
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      {card.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Term: {card.effectiveFrom} to {card.effectiveTo}
                      </span>
                      <span>·</span>
                      <span className="font-mono">
                        {card.grades.length} Grades Defined ({card.grades.map((g) => g.gradeCode).join(", ")})
                      </span>
                      <span>·</span>
                      <span className="font-mono">Currency: {card.currency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      {isExpanded ? "Hide Grade Matrix" : "View Grade Matrix"}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Expanded Grade Matrix Table */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4 bg-muted/10">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Approved Role Grade Matrix & Commercial Rates
                      </h4>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        Minor units integer arithmetic · fils
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                            <th className="py-2.5 px-3">Grade</th>
                            <th className="py-2.5 px-3">Level Band</th>
                            <th className="py-2.5 px-3">Role Classification</th>
                            <th className="py-2.5 px-3 text-right">Base Salary Band (AED)</th>
                            <th className="py-2.5 px-3 text-right">Agency Fee</th>
                            <th className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400">
                              Monthly Rate (AED)
                            </th>
                            <th className="py-2.5 px-3 text-right">Daily Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-mono">
                          {card.grades.map((grade) => (
                            <tr
                              key={grade.gradeCode}
                              className="hover:bg-muted/20 transition-colors"
                            >
                              <td className="py-3 px-3 font-bold text-foreground">
                                {grade.gradeCode}
                              </td>
                              <td className="py-3 px-3 font-sans">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[11px] font-medium border",
                                    grade.level.toLowerCase().includes("senior") ||
                                      grade.level.toLowerCase().includes("lead")
                                      ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30"
                                      : "bg-muted/60 text-muted-foreground border-border/60"
                                  )}
                                >
                                  {grade.level}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-sans font-medium text-foreground">
                                {grade.roleTitle}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                                AED {formatAmount(grade.minSalary)} – {formatAmount(grade.maxSalary)}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums text-foreground font-semibold">
                                {grade.serviceChargePercent}%
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-bold text-teal-600 dark:text-teal-400 text-sm">
                                AED {formatAmount(grade.monthlyRate)}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                                AED {formatAmount(grade.dailyRate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs">
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                        {isPublished ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active in Submit Candidate &rarr; Negotiable mode resolves against this card.
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Submitted to DIEZ Procurement. Not selectable in candidate submission until published.
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Draft schedule. Submit to DIEZ Procurement for review and approval.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isDraft && (
                          <Button
                            size="sm"
                            onClick={() => handleCardSubmitAction(card.id)}
                            className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit to Procurement
                          </Button>
                        )}

                        {isSubmitted && (
                          <Button
                            size="sm"
                            onClick={() => handleCardPublishAction(card.id)}
                            className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Simulate Procurement Approval & Publish
                          </Button>
                        )}

                        {isPublished && (
                          <Link href="/vendor/submissions">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1 border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10"
                            >
                              Use in Candidate Submission
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Upload & Parsed Preview Dialog (RFP Master Data Mechanism) */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                RFP Master Data Upload
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Step: {uploadStep === "CHOOSE_FILE" ? "1 of 2 (Upload)" : "2 of 2 (Parsed Preview)"}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground pt-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Upload Rate Card & Parsed Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {uploadStep === "CHOOSE_FILE"
                ? "Select an RFP work-location template and upload a CSV/Excel file, or load sample pre-filled data."
                : "Parsed preview BEFORE submit: review and edit role grades, salary bands, and agency service charges."}
            </DialogDescription>
          </DialogHeader>

          {previewError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE FILE & TEMPLATE */}
          {uploadStep === "CHOOSE_FILE" && (
            <div className="space-y-5 py-3 text-xs">
              {/* Template Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="upload-template" className="text-xs font-medium text-foreground">
                  Select Work-Location Template (Five RFP Standard Templates){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={(val: RateCardTemplate) => setSelectedTemplate(val)}
                >
                  <SelectTrigger id="upload-template" className="w-full text-xs h-9 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIEZA_PREMISES" className="text-xs">
                      1. DIEZA Premises (Onsite)
                    </SelectItem>
                    <SelectItem value="UAE_REMOTE_WFH" className="text-xs">
                      2. UAE Remote (WFH)
                    </SelectItem>
                    <SelectItem value="UAE_REMOTE_OFFICE" className="text-xs">
                      3. UAE Remote (Vendor Office)
                    </SelectItem>
                    <SelectItem value="REMOTE_ABROAD" className="text-xs">
                      4. Remote (Abroad)
                    </SelectItem>
                    <SelectItem value="PRE_AGREED" className="text-xs">
                      5. Pre-Agreed Contracted Rate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-xl border-2 border-dashed border-border/80 hover:border-teal-500/60 bg-muted/20 hover:bg-muted/30 transition-all text-center cursor-pointer space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    Click to browse or drop your CSV rate sheet here
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Supports CSV formatted per DIEZ Master Data schema (.csv)
                  </p>
                </div>
              </div>

              {/* Or Load Sample Preview Action */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Instant Demonstration Mode
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Load sample 2-level grading structure for UAE Remote (Vendor Office) to inspect
                    the parsed preview table immediately.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleLoadSamplePreview}
                  className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white shrink-0 ml-3"
                >
                  Load Sample Preview &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PARSED PREVIEW BEFORE SUBMIT */}
          {uploadStep === "PARSED_PREVIEW" && (
            <div className="space-y-5 py-2 text-xs">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Template</Label>
                  <p className="font-semibold text-foreground text-xs">
                    {formatTemplateLabel(selectedTemplate)}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pv-code" className="text-[11px] text-muted-foreground">
                    Card Code
                  </Label>
                  <Input
                    id="pv-code"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pv-from" className="text-[11px] text-muted-foreground">
                    Effective From
                  </Label>
                  <Input
                    id="pv-from"
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pv-to" className="text-[11px] text-muted-foreground">
                    Effective To
                  </Label>
                  <Input
                    id="pv-to"
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>

              {/* Editable Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                      Parsed Grade Matrix (Editable Prior to Submit)
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Adjust salary limits or service charge; monthly and daily rates compute
                      live.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddGradeRow}
                    className="text-xs h-7 gap-1 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Grade Row
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border/70">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                        <th className="py-2 px-2.5 w-16">Grade</th>
                        <th className="py-2 px-2.5 w-28">Level</th>
                        <th className="py-2 px-2.5">Role Title</th>
                        <th className="py-2 px-2.5 w-28">Min Salary (AED)</th>
                        <th className="py-2 px-2.5 w-28">Max Salary (AED)</th>
                        <th className="py-2 px-2.5 w-20">Fee %</th>
                        <th className="py-2 px-2.5 text-right w-32 text-teal-600 dark:text-teal-400">
                          Monthly Rate
                        </th>
                        <th className="py-2 px-2.5 text-right w-28">Daily Rate</th>
                        <th className="py-2 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {previewGrades.map((row, idx) => {
                        const midAed = (row.minSalaryAed + row.maxSalaryAed) / 2;
                        const monthlyAed = midAed * (1 + row.serviceChargePercent / 100);
                        const monthlyFils = Math.round(monthlyAed * 100);
                        const dailyFils = Math.round(monthlyFils / 22);

                        return (
                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                            {/* Grade Code */}
                            <td className="py-1.5 px-2">
                              <Input
                                value={row.gradeCode}
                                onChange={(e) =>
                                  handleUpdateGradeRow(idx, "gradeCode", e.target.value)
                                }
                                className="text-xs h-8 font-mono font-bold w-16"
                              />
                            </td>

                            {/* Level (Two-level grading structure) */}
                            <td className="py-1.5 px-2">
                              <Select
                                value={row.level}
                                onValueChange={(val) => handleUpdateGradeRow(idx, "level", val)}
                              >
                                <SelectTrigger className="text-xs h-8 w-28 font-medium">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Junior" className="text-xs">
                                    Junior
                                  </SelectItem>
                                  <SelectItem value="Mid-Level" className="text-xs">
                                    Mid-Level
                                  </SelectItem>
                                  <SelectItem value="Senior" className="text-xs">
                                    Senior
                                  </SelectItem>
                                  <SelectItem value="Lead" className="text-xs">
                                    Lead
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>

                            {/* Role Title */}
                            <td className="py-1.5 px-2">
                              <Input
                                value={row.roleTitle}
                                onChange={(e) =>
                                  handleUpdateGradeRow(idx, "roleTitle", e.target.value)
                                }
                                className="text-xs h-8 font-medium min-w-[180px]"
                              />
                            </td>

                            {/* Min Salary */}
                            <td className="py-1.5 px-2">
                              <Input
                                type="number"
                                step="500"
                                value={row.minSalaryAed}
                                onChange={(e) =>
                                  handleUpdateGradeRow(
                                    idx,
                                    "minSalaryAed",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="text-xs h-8 font-mono tabular-nums w-28"
                              />
                            </td>

                            {/* Max Salary */}
                            <td className="py-1.5 px-2">
                              <Input
                                type="number"
                                step="500"
                                value={row.maxSalaryAed}
                                onChange={(e) =>
                                  handleUpdateGradeRow(
                                    idx,
                                    "maxSalaryAed",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="text-xs h-8 font-mono tabular-nums w-28"
                              />
                            </td>

                            {/* Service Charge % */}
                            <td className="py-1.5 px-2">
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={row.serviceChargePercent}
                                onChange={(e) =>
                                  handleUpdateGradeRow(
                                    idx,
                                    "serviceChargePercent",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="text-xs h-8 font-mono tabular-nums w-20 text-center"
                              />
                            </td>

                            {/* Monthly Rate (Computed) */}
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                              AED {formatAmount(monthlyFils)}
                            </td>

                            {/* Daily Rate (Computed) */}
                            <td className="py-1.5 px-2.5 text-right font-mono text-muted-foreground tabular-nums">
                              AED {formatAmount(dailyFils)}
                            </td>

                            {/* Delete */}
                            <td className="py-1.5 px-1 text-center">
                              <button
                                onClick={() => handleDeleteGradeRow(idx)}
                                className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-3">
            {uploadStep === "PARSED_PREVIEW" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadStep("CHOOSE_FILE")}
                  className="text-xs h-8"
                >
                  &larr; Back to Upload
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    className="text-xs h-8 gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Save as Draft
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitForApproval}
                    className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit for DIEZ Approval
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] text-muted-foreground">
                  Need the master template format? Use the download button above.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-card border border-teal-500/40 shadow-xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">{toastMessage.title}</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {toastMessage.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
