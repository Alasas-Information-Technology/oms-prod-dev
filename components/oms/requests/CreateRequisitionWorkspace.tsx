"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Building2,
  Home,
  Briefcase,
  Globe,
  UserPlus,
  User,
  CheckCircle2,
  GitFork,
  CreditCard,
  ShieldCheck,
  Clock,
  Check,
  ChevronDown,
  X,
  Plus,
  Coins,
  FileText,
  Send,
  UploadCloud,
  Trash2,
  Eye,
  Award,
  Edit3,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PageBarActions,
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";
import { DatePickerField } from "@/components/shared/DatePickerField";
import { toast } from "sonner";

interface Step {
  id: number;
  label: string;
}

const STEPS: Step[] = [
  { id: 1, label: "Position Details" },
  { id: 2, label: "Roles & Funding" },
  { id: 3, label: "Attachments" },
  { id: 4, label: "Review & Submit" },
];

// DIEZ Colleague Directory mock options for dropdown selection
const DIEZ_DIRECTORY_OPTIONS = [
  "Tariq Al Suwaidi",
  "Hessa Al Shamsi",
  "Rashid Al Nuaimi",
  "Hamad Al Qassimi",
  "Maitha Al Falasi",
  "Zayed Al Hosani",
  "Ebrahim Al Tamimi",
  "Salem Al Zaabi",
  "Sheikha Al Qassimi",
  "Badr Al Rumaithi",
];

// Mock budget line datasets for Funding Routes
const BUDGETED_DATA = [
  {
    id: "b1",
    name: "Cybersecurity Services FY2026",
    available: "AED 850,000",
    allocated: 400000,
    period: "Pre-approved",
    checked: true,
  },
  {
    id: "b2",
    name: "Digital Transformation FY2026",
    available: "AED 390,000",
    allocated: 220000,
    period: "Pre-approved",
    checked: true,
  },
  {
    id: "b3",
    name: "Technology Operations FY2026",
    available: "AED 175,000",
    allocated: 0,
    period: "Pre-approved",
    checked: false,
  },
];

const UNALLOCATED_DATA = [
  {
    id: "u1",
    name: "Department Contingency Reserve Pool",
    available: "AED 1,200,000",
    allocated: 620000,
    period: "Open Pool",
    checked: true,
  },
  {
    id: "u2",
    name: "Unassigned Discretionary Capital",
    available: "AED 450,000",
    allocated: 0,
    period: "Open Pool",
    checked: false,
  },
];

const UNBUDGETED_DATA = [
  {
    id: "ub1",
    name: "Off-Cycle Special Operational Funding",
    available: "AED 0 (Out of Budget)",
    allocated: 620000,
    period: "Special Request",
    checked: true,
  },
];

export function CreateRequisitionWorkspace() {
  const router = useRouter();

  // Current Step state (1: Position Details, 2: Roles & Funding, 3: Attachments, 4: Review & Submit)
  const [currentStep, setCurrentStep] = React.useState(1);

  // ==================== STEP 1 FORM STATE ====================
  const [resources, setResources] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [salaryGrade, setSalaryGrade] = React.useState("");
  const [jobProfile, setJobProfile] = React.useState("");
  const [engagementStart, setEngagementStart] = React.useState<Date | undefined>(undefined);
  const [engagementEnd, setEngagementEnd] = React.useState<Date | undefined>(undefined);
  const [budgetAmount, setBudgetAmount] = React.useState("");

  // Auto-calculated duration based on selected engagement start & end dates
  const calculatedDuration = React.useMemo(() => {
    if (!engagementStart || !engagementEnd) {
      return "Select start & end dates";
    }

    if (engagementEnd < engagementStart) {
      return "End date must be after start date";
    }

    const start = new Date(engagementStart);
    const end = new Date(engagementEnd);

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const dayDiff = end.getDate() - start.getDate();

    if (dayDiff > 15) {
      months += 1;
    } else if (dayDiff < -15) {
      months -= 1;
    }

    if (months <= 0) {
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return `${days} day${days > 1 ? "s" : ""}`;
    }

    return `${months} month${months > 1 ? "s" : ""}`;
  }, [engagementStart, engagementEnd]);

  const [justification, setJustification] = React.useState("");
  const [softwareRequirements, setSoftwareRequirements] = React.useState("");
  const [hardwareRequirements, setHardwareRequirements] = React.useState("");

  // Operating Model Selection
  const [workLocation, setWorkLocation] = React.useState<
    "diez" | "wfh" | "vendor" | "abroad"
  >("diez");

  // Candidate Route Selection
  const [candidateRoute, setCandidateRoute] = React.useState<"unknown" | "known">(
    "unknown"
  );

  // Dynamic Location Details based on selected Operating Model Work Location
  const locationDetails = React.useMemo(() => {
    switch (workLocation) {
      case "diez":
        return {
          officeSpace: "Available",
          seatingPlan: "Floor 4 · Zone B · 2 seats",
          isInteractive: true,
        };
      case "wfh":
        return {
          officeSpace: "Not Required (Home-based)",
          seatingPlan: "N/A — Remote WFH",
          isInteractive: false,
        };
      case "vendor":
        return {
          officeSpace: "Vendor Facility",
          seatingPlan: "Vendor Office (UAE)",
          isInteractive: false,
        };
      case "abroad":
        return {
          officeSpace: "Not Applicable",
          seatingPlan: "International Remote",
          isInteractive: false,
        };
    }
  }, [workLocation]);

  // ==================== STEP 2 FORM STATE ====================
  // Assigned Roles State (Empty by default)
  const [reportingManager, setReportingManager] = React.useState<string[]>([]);
  const [interviewers, setInterviewers] = React.useState<string[]>([]);
  const [mainInterviewer, setMainInterviewer] = React.useState<string[]>([]);
  const [workAssignees, setWorkAssignees] = React.useState<string[]>([]);

  // Open dropdown trackers
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Funding Route Selection
  const [fundingRoute, setFundingRoute] = React.useState<
    "budgeted" | "unallocated" | "unbudgeted"
  >("budgeted");

  // Budget Lines State
  const [budgetLines, setBudgetLines] = React.useState(BUDGETED_DATA);

  // Handle funding route dynamic data switching
  const handleRouteSwitch = (route: "budgeted" | "unallocated" | "unbudgeted") => {
    setFundingRoute(route);
    if (route === "budgeted") setBudgetLines(BUDGETED_DATA);
    if (route === "unallocated") setBudgetLines(UNALLOCATED_DATA);
    if (route === "unbudgeted") setBudgetLines(UNBUDGETED_DATA);
  };

  // Calculated Budget Allocation Totals
  const selectedAllocationTotal = React.useMemo(() => {
    return budgetLines
      .filter((line) => line.checked)
      .reduce((sum, line) => sum + line.allocated, 0);
  }, [budgetLines]);

  // ==================== STEP 3 ATTACHMENTS STATE ====================
  const [attachedFiles, setAttachedFiles] = React.useState<
    { id: string; name: string; category: string; size: string }[]
  >([
    {
      id: "f1",
      name: "Passport_Scan_Copy.pdf",
      category: "Passport Copy",
      size: "2.4 MB",
    },
    {
      id: "f2",
      name: "Emirates_ID_Front_Back.pdf",
      category: "Emirates ID",
      size: "1.8 MB",
    },
    {
      id: "f3",
      name: "Cybersecurity_Certifications_CISSP.pdf",
      category: "Certificates",
      size: "3.5 MB",
    },
  ]);

  const handleSimulatedFileUpload = (categoryName: string) => {
    const fileId = `file-${Date.now()}`;
    const newFile = {
      id: fileId,
      name: `${categoryName.replace(/\s+/g, "_")}_Doc.pdf`,
      category: categoryName,
      size: "2.1 MB",
    };
    setAttachedFiles((prev) => [...prev, newFile]);
    toast.success(`Attached ${categoryName} document successfully!`);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info("Document removed");
  };

  // Handlers
  const handleSaveDraft = () => {
    toast.success("Draft REQ-2026-0186 saved successfully!");
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      toast.info(`Moved to Step ${currentStep + 1}`);
    } else {
      toast.success("Requisition REQ-2026-0186 submitted for HOD approval!");
      router.push("/app/requests/mine");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/app/requests/mine");
    }
  };

  const handleCancel = () => {
    router.push("/app/requests/mine");
  };

  // Helper for role tag management
  const removeRoleTag = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    name: string
  ) => {
    setter((prev) => prev.filter((item) => item !== name));
  };

  const addRoleTag = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    name: string
  ) => {
    setter((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setActiveDropdown(null);
  };

  const toggleBudgetLine = (id: string) => {
    setBudgetLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, checked: !line.checked } : line
      )
    );
  };

  const breadcrumbs = React.useMemo(
    () => [
      {
        label: "My Requests",
        href: "/app/requests/mine",
      },
      {
        label: "New Requisition",
        isCurrent: true,
      },
    ],
    []
  );

  return (
    <div className="min-h-full bg-background p-4 md:p-6 pb-36 md:pb-44">
      <PageBarActions>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCancel}
        >
          <ArrowLeft className="size-3.5" />
          Back to My Requests
        </Button>
      </PageBarActions>

      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Create Requisition
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            {jobTitle ? `${jobTitle} · ` : ""}Draft REQ-2026-0186
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="relative my-2 w-full">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  {/* Step item */}
                  <div
                    onClick={() => setCurrentStep(step.id)}
                    className="flex cursor-pointer items-center gap-3 group"
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : isCompleted
                          ? "bg-primary/20 text-primary"
                          : "border border-border bg-card text-muted-foreground group-hover:border-foreground/40"
                      }`}
                    >
                      {isCompleted ? <Check className="size-4" /> : step.id}
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Step Line Connector */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-[1px] flex-1 mx-4 transition-colors ${
                        currentStep > step.id ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: POSITION DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column - Details Form */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Position Requirements Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6">
                <h2 className="mb-5 text-base font-semibold text-foreground md:text-lg">
                  Position Requirements
                </h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Number of resources */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="num-resources"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Number of resources
                    </Label>
                    <Input
                      id="num-resources"
                      placeholder="Enter number of resources"
                      value={resources}
                      onChange={(e) => setResources(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="job-title"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Job title
                    </Label>
                    <Input
                      id="job-title"
                      placeholder="Enter job title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {/* Salary Grade */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="salary-grade"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Salary grade
                    </Label>
                    <Input
                      id="salary-grade"
                      placeholder="Enter salary grade"
                      value={salaryGrade}
                      onChange={(e) => setSalaryGrade(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {/* Job Profile */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="job-profile"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Job profile
                    </Label>
                    <Input
                      id="job-profile"
                      placeholder="Enter job profile description"
                      value={jobProfile}
                      onChange={(e) => setJobProfile(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {/* Engagement Start */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Engagement start
                    </Label>
                    <DatePickerField
                      value={engagementStart}
                      onChange={setEngagementStart}
                      placeholder="Select start date"
                      dateFormat="dd MMM yyyy"
                    />
                  </div>

                  {/* Engagement End */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Engagement end
                    </Label>
                    <DatePickerField
                      value={engagementEnd}
                      onChange={setEngagementEnd}
                      placeholder="Select end date"
                      dateFormat="dd MMM yyyy"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Duration (auto-calculated)
                    </Label>
                    <div className="flex h-9 w-full items-center rounded border border-border bg-input-background px-3 text-xs font-semibold text-foreground">
                      {calculatedDuration}
                    </div>
                  </div>

                  {/* Budget Amount */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="budget-amount"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Budget amount
                    </Label>
                    <Input
                      id="budget-amount"
                      placeholder="Enter estimated budget amount"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Business Justification Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6">
                <h2 className="mb-4 text-base font-semibold text-foreground md:text-lg">
                  Business Justification
                </h2>

                <div className="space-y-4">
                  {/* Justification Textarea */}
                  <div className="space-y-1.5">
                    <Textarea
                      id="justification"
                      rows={4}
                      placeholder="Enter business justification details..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="resize-none text-sm text-foreground/90 leading-relaxed"
                    />
                    <div className="text-right text-xs text-muted-foreground font-mono">
                      {justification.length} / 500
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    {/* Software Requirements */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="software-reqs"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Software requirements
                      </Label>
                      <Input
                        id="software-reqs"
                        placeholder="Enter software requirements"
                        value={softwareRequirements}
                        onChange={(e) => setSoftwareRequirements(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Hardware Requirements */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="hardware-reqs"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Hardware requirements
                      </Label>
                      <Input
                        id="hardware-reqs"
                        placeholder="Enter hardware requirements"
                        value={hardwareRequirements}
                        onChange={(e) => setHardwareRequirements(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Operating Model & Readiness */}
            <div className="space-y-6 lg:col-span-5 xl:col-span-4">
              {/* Operating Model Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">
                  Operating Model
                </h2>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Work location
                  </Label>

                  {/* 4 Cards Selector Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {/* 1. DIEZ Premises */}
                    <button
                      type="button"
                      onClick={() => setWorkLocation("diez")}
                      className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center transition-all min-h-[96px] ${
                        workLocation === "diez"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full pt-1">
                        {workLocation === "diez" && (
                          <div className="absolute top-0 right-0 size-2 rounded-full bg-primary" />
                        )}
                        <Building2 className="size-5 shrink-0" />
                      </div>
                      <span className="text-xs font-medium leading-tight mt-2">
                        DIEZ Premises
                      </span>
                    </button>

                    {/* 2. UAE Remote (WFH) */}
                    <button
                      type="button"
                      onClick={() => setWorkLocation("wfh")}
                      className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center transition-all min-h-[96px] ${
                        workLocation === "wfh"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full pt-1">
                        {workLocation === "wfh" && (
                          <div className="absolute top-0 right-0 size-2 rounded-full bg-primary" />
                        )}
                        <Home className="size-5 shrink-0" />
                      </div>
                      <span className="text-xs font-medium leading-tight mt-2">
                        UAE Remote (WFH)
                      </span>
                    </button>

                    {/* 3. UAE Remote (Vendor Office) */}
                    <button
                      type="button"
                      onClick={() => setWorkLocation("vendor")}
                      className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center transition-all min-h-[96px] ${
                        workLocation === "vendor"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full pt-1">
                        {workLocation === "vendor" && (
                          <div className="absolute top-0 right-0 size-2 rounded-full bg-primary" />
                        )}
                        <Briefcase className="size-5 shrink-0" />
                      </div>
                      <span className="text-xs font-medium leading-tight mt-2">
                        UAE Remote (Vendor Office)
                      </span>
                    </button>

                    {/* 4. Remote (Abroad) */}
                    <button
                      type="button"
                      onClick={() => setWorkLocation("abroad")}
                      className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center transition-all min-h-[96px] ${
                        workLocation === "abroad"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full pt-1">
                        {workLocation === "abroad" && (
                          <div className="absolute top-0 right-0 size-2 rounded-full bg-primary" />
                        )}
                        <Globe className="size-5 shrink-0" />
                      </div>
                      <span className="text-xs font-medium leading-tight mt-2">
                        Remote (Abroad)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sub-info below location */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50 transition-all duration-200">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Office space
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">
                      {locationDetails.officeSpace}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Seating plan
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${
                        locationDetails.isInteractive
                          ? "text-primary cursor-pointer hover:underline"
                          : "text-foreground"
                      }`}
                    >
                      {locationDetails.seatingPlan}
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Route Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">
                  Candidate Route
                </h2>

                <div className="space-y-3">
                  {/* 1. Unknown candidates */}
                  <div
                    onClick={() => setCandidateRoute("unknown")}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                      candidateRoute === "unknown"
                        ? "border-primary bg-primary/5"
                        : "border-border/80 bg-background hover:border-foreground/30"
                    }`}
                  >
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary">
                      {candidateRoute === "unknown" && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <UserPlus className="size-5 shrink-0 text-primary mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">
                        Unknown candidates
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attach a job description for vendor sourcing
                      </div>
                    </div>
                  </div>

                  {/* 2. Known candidate */}
                  <div
                    onClick={() => setCandidateRoute("known")}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                      candidateRoute === "known"
                        ? "border-primary bg-primary/5"
                        : "border-border/80 bg-background hover:border-foreground/30"
                    }`}
                  >
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50">
                      {candidateRoute === "known" && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <User className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">
                        Known candidate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attach the candidate CV
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Readiness Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">
                  Request Readiness
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* 1. Required fields */}
                  <div className="space-y-1">
                    <CheckCircle2 className="size-5 text-primary" />
                    <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                      Required fields
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      12 / 12 complete
                    </div>
                  </div>

                  {/* 2. Expected approval route */}
                  <div className="space-y-1">
                    <GitFork className="size-5 text-muted-foreground" />
                    <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                      Expected approval route
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Resolved after role selection
                    </div>
                  </div>

                  {/* 3. Budget check */}
                  <div className="space-y-1">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                      Budget check
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Runs in next step
                    </div>
                  </div>

                  {/* 4. Privacy classification */}
                  <div className="space-y-1">
                    <ShieldCheck className="size-5 text-muted-foreground" />
                    <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                      Privacy classification
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Candidate personal data
                    </div>
                  </div>
                </div>

                {/* Bottom Notice Box */}
                <div className="rounded-lg border border-border/60 bg-muted/40 p-3 flex items-start gap-2.5 text-xs text-muted-foreground mt-4">
                  <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>
                    Unknown-candidate sourcing will use anonymised department review.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ROLES & FUNDING */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column - Assigned Roles (Width reduced to 5 cols) */}
            <div className="space-y-6 lg:col-span-5 xl:col-span-5">
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground md:text-lg">
                    Assigned Roles
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="size-3" />
                      Active Directory
                    </Badge>
                    <span>Select colleagues from DIEZ directory.</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* 1. Reporting Line Manager */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Reporting Line Manager
                    </Label>
                    <div className="relative">
                      <div
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === "manager" ? null : "manager"
                          )
                        }
                        className="min-h-[44px] cursor-pointer rounded-lg border border-border bg-background p-2 flex items-center justify-between gap-2 hover:border-foreground/40 transition-colors"
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {reportingManager.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-md border border-border/60"
                            >
                              {name}
                              <X
                                className="size-3 text-muted-foreground hover:text-foreground cursor-pointer ml-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoleTag(setReportingManager, name);
                                }}
                              />
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          {reportingManager.length > 0 && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                          <ChevronDown className="size-4" />
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      {activeDropdown === "manager" && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg p-1 space-y-0.5">
                          {DIEZ_DIRECTORY_OPTIONS.map((name) => (
                            <div
                              key={name}
                              onClick={() => addRoleTag(setReportingManager, name)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent rounded-md cursor-pointer"
                            >
                              <span>{name}</span>
                              {reportingManager.includes(name) && (
                                <Check className="size-3.5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Interviewers */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Interviewers
                    </Label>
                    <div className="relative">
                      <div
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === "interviewers" ? null : "interviewers"
                          )
                        }
                        className="min-h-[44px] cursor-pointer rounded-lg border border-border bg-background p-2 flex items-center justify-between gap-2 hover:border-foreground/40 transition-colors"
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {interviewers.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-md border border-border/60"
                            >
                              {name}
                              <X
                                className="size-3 text-muted-foreground hover:text-foreground cursor-pointer ml-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoleTag(setInterviewers, name);
                                }}
                              />
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          {interviewers.length > 0 && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                          <ChevronDown className="size-4" />
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      {activeDropdown === "interviewers" && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg p-1 space-y-0.5">
                          {DIEZ_DIRECTORY_OPTIONS.map((name) => (
                            <div
                              key={name}
                              onClick={() => addRoleTag(setInterviewers, name)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent rounded-md cursor-pointer"
                            >
                              <span>{name}</span>
                              {interviewers.includes(name) && (
                                <Check className="size-3.5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Main Interviewer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Main Interviewer
                    </Label>
                    <div className="relative">
                      <div
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === "main" ? null : "main"
                          )
                        }
                        className="min-h-[44px] cursor-pointer rounded-lg border border-border bg-background p-2 flex items-center justify-between gap-2 hover:border-foreground/40 transition-colors"
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {mainInterviewer.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-md border border-border/60"
                            >
                              {name}
                              <X
                                className="size-3 text-muted-foreground hover:text-foreground cursor-pointer ml-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoleTag(setMainInterviewer, name);
                                }}
                              />
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          {mainInterviewer.length > 0 && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                          <ChevronDown className="size-4" />
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      {activeDropdown === "main" && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg p-1 space-y-0.5">
                          {DIEZ_DIRECTORY_OPTIONS.map((name) => (
                            <div
                              key={name}
                              onClick={() => addRoleTag(setMainInterviewer, name)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent rounded-md cursor-pointer"
                            >
                              <span>{name}</span>
                              {mainInterviewer.includes(name) && (
                                <Check className="size-3.5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Work Completion Assignees */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Work Completion Assignees
                    </Label>
                    <div className="relative">
                      <div
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === "work" ? null : "work"
                          )
                        }
                        className="min-h-[44px] cursor-pointer rounded-lg border border-border bg-background p-2 flex items-center justify-between gap-2 hover:border-foreground/40 transition-colors"
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {workAssignees.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-md border border-border/60"
                            >
                              {name}
                              <X
                                className="size-3 text-muted-foreground hover:text-foreground cursor-pointer ml-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRoleTag(setWorkAssignees, name);
                                }}
                              />
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          {workAssignees.length > 0 && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                          <ChevronDown className="size-4" />
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      {activeDropdown === "work" && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg p-1 space-y-0.5">
                          {DIEZ_DIRECTORY_OPTIONS.map((name) => (
                            <div
                              key={name}
                              onClick={() => addRoleTag(setWorkAssignees, name)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent rounded-md cursor-pointer"
                            >
                              <span>{name}</span>
                              {workAssignees.includes(name) && (
                                <Check className="size-3.5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval Route Summary Box */}
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-4 flex items-center gap-3 text-xs md:text-sm">
                    <GitFork className="size-5 text-primary shrink-0" />
                    <div className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Approval route: </span>
                      {reportingManager.length > 0 ? (
                        <>
                          <span className="font-semibold text-foreground">
                            {reportingManager.join(", ")}
                          </span>{" "}
                          → <span className="font-semibold text-foreground">Ebrahim Al Tamimi</span> →{" "}
                          <span className="font-semibold text-foreground">Zayed Al Hosani</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Select a Reporting Line Manager to establish approval route
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Funding Route & Budget Lines (Width expanded to 7 cols) */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-7">
              {/* Funding Route Section */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">
                  Funding Route
                </h2>

                {/* Segmented Switcher */}
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRouteSwitch("budgeted")}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                      fundingRoute === "budgeted"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Budgeted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRouteSwitch("unallocated")}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                      fundingRoute === "unallocated"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unallocated
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRouteSwitch("unbudgeted")}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                      fundingRoute === "unbudgeted"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unbudgeted
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fundingRoute === "budgeted" && "Pre-approved department cost center lines for FY2026."}
                  {fundingRoute === "unallocated" && "Central department unassigned contingency & reserve pool."}
                  {fundingRoute === "unbudgeted" && "Out-of-budget emergency funding. Requires VP of Finance approval."}
                </p>
              </div>

              {/* Budget Lines Section with Editable Grouped Inputs */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">
                    {fundingRoute === "budgeted" && "Budget Lines"}
                    {fundingRoute === "unallocated" && "Unallocated Reserve Pool"}
                    {fundingRoute === "unbudgeted" && "Out-of-Budget Request Lines"}
                  </h2>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {fundingRoute === "budgeted" && "Pre-approved"}
                    {fundingRoute === "unallocated" && "Central Reserve"}
                    {fundingRoute === "unbudgeted" && "Special Approval"}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="py-2 px-1 w-8"></th>
                        <th className="py-2 px-2 font-medium">Budget line</th>
                        <th className="py-2 px-2 font-medium text-right">Available</th>
                        <th className="py-2 px-2 font-medium text-right w-44">Allocate</th>
                        <th className="py-2 px-2 font-medium text-center">Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {budgetLines.map((line) => (
                        <tr key={line.id} className="hover:bg-muted/30">
                          <td className="py-3 px-1">
                            <Checkbox
                              checked={line.checked}
                              onCheckedChange={() => toggleBudgetLine(line.id)}
                            />
                          </td>
                          <td className="py-3 px-2 font-semibold text-foreground leading-tight">
                            {line.name}
                          </td>
                          <td className="py-3 px-2 text-right text-muted-foreground whitespace-nowrap">
                            {line.available}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {line.checked ? (
                              <div className="flex h-8 items-center rounded-md border border-border/80 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ml-auto w-36">
                                <span className="bg-muted/80 px-2.5 text-[11px] font-semibold text-muted-foreground border-r border-border/60 h-full flex items-center shrink-0 select-none">
                                  AED
                                </span>
                                <Input
                                  type="text"
                                  value={line.allocated > 0 ? line.allocated.toLocaleString() : ""}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0;
                                    setBudgetLines((prev) =>
                                      prev.map((b) => (b.id === line.id ? { ...b, allocated: val } : b))
                                    );
                                  }}
                                  className="h-full border-0 rounded-none text-right text-xs font-bold focus-visible:ring-0 shadow-none px-2.5 bg-transparent"
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs font-medium px-3">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              {line.period}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allocation Summary & Fix for UI Alignment Issue */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">
                    Allocation Summary
                  </h2>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-xs">
                    <CheckCircle2 className="size-3.5" />
                    Allocation balanced
                  </Badge>
                </div>

                {/* 4 Metric Stats Grid - Properly Aligned */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Request amount
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      AED 620,000
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Selected allocation
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      AED {selectedAllocationTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Available across lines
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      AED 1,240,000
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Remaining reservation
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      AED 620,000
                    </div>
                  </div>
                </div>

                {/* Control Explanation - Fixed Formatting & Clean Horizontal Layout */}
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4 space-y-2 mt-2">
                  <div className="text-xs font-semibold text-foreground">
                    Clear control explanation
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Funds:</span>
                    <Badge variant="outline" className="text-[11px] font-medium bg-background">
                      On submit: Available → Reserved
                    </Badge>
                    <span className="text-muted-foreground/60">•</span>
                    <Badge variant="outline" className="text-[11px] font-medium bg-background">
                      On HOD approval: Reserved → Allocated
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    Funds are reserved on submit. They are locked and allocated only after HOD approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ATTACHMENTS */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Required Document Category Cards & Dropzone */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Category Upload Cards Grid */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground md:text-lg">
                    Required & Supporting Attachments
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attach candidate identity verification, certificates, and compliance documentation.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* 1. Passport Copy */}
                  <div className="rounded-xl border border-border/80 bg-background p-4 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="size-5" />
                      </div>
                      {attachedFiles.some((f) => f.category === "Passport Copy") ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                          <CheckCircle2 className="size-3" /> Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                          Required
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Passport Copy</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Clear scan of passport information page (PDF or JPG).
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleSimulatedFileUpload("Passport Copy")}
                    >
                      <Plus className="size-3.5" />
                      Upload Passport
                    </Button>
                  </div>

                  {/* 2. Emirates ID Copy */}
                  <div className="rounded-xl border border-border/80 bg-background p-4 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-5" />
                      </div>
                      {attachedFiles.some((f) => f.category === "Emirates ID") ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                          <CheckCircle2 className="size-3" /> Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                          Required (UAE)
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Emirates ID (EID) Copy</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Front and back copy of valid Emirates ID.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleSimulatedFileUpload("Emirates ID")}
                    >
                      <Plus className="size-3.5" />
                      Upload EID Copy
                    </Button>
                  </div>

                  {/* 3. Professional Certificates */}
                  <div className="rounded-xl border border-border/80 bg-background p-4 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Award className="size-5" />
                      </div>
                      {attachedFiles.some((f) => f.category === "Certificates") ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                          <CheckCircle2 className="size-3" /> Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-muted-foreground">
                          Recommended
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Certificates & Qualifications</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Degrees, CISSP, CISM, or professional certifications.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleSimulatedFileUpload("Certificates")}
                    >
                      <Plus className="size-3.5" />
                      Upload Certificate
                    </Button>
                  </div>

                  {/* 4. Job Description / CV */}
                  <div className="rounded-xl border border-border/80 bg-background p-4 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileCheck className="size-5" />
                      </div>
                      <Badge variant="outline" className="text-[11px] text-muted-foreground">
                        Optional
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Job Specs / Candidate CV</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vendor sourcing spec document or candidate resume.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleSimulatedFileUpload("Job Specs")}
                    >
                      <Plus className="size-3.5" />
                      Upload Document
                    </Button>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => handleSimulatedFileUpload("General Attachment")}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all space-y-2 mt-4"
                >
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <UploadCloud className="size-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Click or drag & drop files here to upload
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Supports PDF, DOCX, PNG, JPG up to 15MB each
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Uploaded Files List & Compliance Check */}
            <div className="space-y-6 lg:col-span-5 xl:col-span-4">
              {/* Uploaded Files List */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">
                    Attached Documents ({attachedFiles.length})
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    Ready for review
                  </Badge>
                </div>

                {attachedFiles.length > 0 ? (
                  <div className="space-y-2.5">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-lg border border-border/60 bg-background p-3 flex items-center justify-between gap-3 hover:border-foreground/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                              <span>{file.category}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => toast.info(`Previewing ${file.name}`)}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No files attached yet. Click upload above to add documents.
                  </div>
                )}
              </div>

              {/* Compliance Checklist Box */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">
                  Document Verification
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Passport Copy</span>
                    {attachedFiles.some((f) => f.category === "Passport Copy") ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                        <Check className="size-3" /> Verified
                      </Badge>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Emirates ID Copy</span>
                    {attachedFiles.some((f) => f.category === "Emirates ID") ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                        <Check className="size-3" /> Verified
                      </Badge>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Professional Certificates</span>
                    {attachedFiles.some((f) => f.category === "Certificates") ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                        <Check className="size-3" /> Attached
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Optional</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Malware Security Scan</span>
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                      <ShieldCheck className="size-3" /> Clean
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & SUBMIT */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Top Banner Card */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      Requisition REQ-2026-0186
                    </h2>
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready for Submission
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All 4 requisition setup steps are complete. Review details below before submitting for official HOD approval.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Badge variant="outline" className="text-xs py-1 px-3 bg-background">
                  Step 4 of 4
                </Badge>
              </div>
            </div>

            {/* 4 Review Cards Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Card 1: Position Requirements */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        1. Position Requirements
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setCurrentStep(1)}
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Job Title</span>
                      <div className="font-semibold text-foreground text-sm mt-0.5">
                        {jobTitle || "Senior Cybersecurity Analyst"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resources</span>
                      <div className="font-semibold text-foreground text-sm mt-0.5">
                        {resources || "2 positions"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Salary Grade</span>
                      <div className="font-semibold text-foreground mt-0.5">
                        {salaryGrade || "G8"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Operating Model</span>
                      <div className="font-semibold text-foreground capitalize mt-0.5">
                        {workLocation === "diez" ? "DIEZ Premises (Floor 4)" : workLocation}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <div className="font-semibold text-foreground mt-0.5">
                        {calculatedDuration !== "Select start & end dates" ? calculatedDuration : "12 months"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Candidate Route</span>
                      <div className="font-semibold text-foreground capitalize mt-0.5">
                        {candidateRoute} candidates
                      </div>
                    </div>
                  </div>

                  {justification && (
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs space-y-1">
                      <span className="font-semibold text-foreground">Business Justification</span>
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {justification}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Assigned Governance & Approval Workflow */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <GitFork className="size-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        2. Assigned Governance
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setCurrentStep(2)}
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </Button>
                  </div>

                  {/* Visual Approval Chain */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Approval Flow Sequence
                    </span>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge className="bg-primary text-primary-foreground font-semibold text-[11px]">
                        1. {reportingManager[0] || "Tariq Al Suwaidi"}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="bg-background font-semibold text-[11px]">
                        2. Ebrahim Al Tamimi (HOD)
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="bg-background font-semibold text-[11px]">
                        3. Zayed Al Hosani (Finance)
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-muted-foreground">Main Interviewer</span>
                      <div className="font-semibold text-foreground mt-0.5">
                        {mainInterviewer.length > 0 ? mainInterviewer.join(", ") : "Not assigned"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interviewers</span>
                      <div className="font-semibold text-foreground mt-0.5">
                        {interviewers.length > 0 ? interviewers.join(", ") : "Not assigned"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Financial & Budget Allocation */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="size-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        3. Financial & Budget Allocation
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setCurrentStep(2)}
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Funding Route</span>
                      <div className="font-semibold text-foreground capitalize mt-0.5">
                        {fundingRoute}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requisition Total</span>
                      <div className="font-bold text-foreground text-sm mt-0.5">
                        {budgetAmount || "AED 620,000"}
                      </div>
                    </div>
                  </div>

                  {/* Selected Budget Lines Summary Table */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Selected Budget Lines ({budgetLines.filter((b) => b.checked).length})
                    </span>
                    <div className="space-y-1 text-xs">
                      {budgetLines
                        .filter((b) => b.checked)
                        .map((line) => (
                          <div key={line.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                            <span className="font-medium text-foreground truncate pr-2">{line.name}</span>
                            <span className="font-bold text-foreground shrink-0">AED {line.allocated.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Attachments & Compliance */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        4. Attached Compliance Documents
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setCurrentStep(3)}
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Attached Files ({attachedFiles.length})
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {attachedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-background">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="size-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground truncate">{file.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {file.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Legal Declaration Box */}
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs md:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                <ShieldCheck className="size-5 text-primary" />
                <span>Submitter Compliance Declaration</span>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex items-start gap-3 text-xs">
                <Checkbox id="confirm-req" defaultChecked className="mt-0.5" />
                <Label htmlFor="confirm-req" className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer">
                  I confirm that all provided position details, assigned roles, budget funding, and attached compliance documents are accurate, verified, and ready to submit for Head of Department (HOD) approval.
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Footer */}
      <div className="sticky bottom-0 z-20 border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-3 md:px-8 -mx-4 -mb-36 md:-mx-6 md:-mb-44 mt-8">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between">
          <div className="text-xs text-muted-foreground hidden sm:block font-medium">
            Drafts are retained for 60 days.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-10 px-5 text-sm gap-1.5"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-10 px-5 text-sm"
              >
                Cancel
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="h-10 px-5 text-sm gap-2"
            >
              <Bookmark className="size-4" />
              Save Draft
            </Button>

            <Button
              onClick={handleContinue}
              className="h-10 px-5 text-sm gap-2 shadow-xs"
            >
              {currentStep === 1 && "Continue to Roles & Funding"}
              {currentStep === 2 && "Continue to Attachments"}
              {currentStep === 3 && "Continue to Review & Submit"}
              {currentStep === 4 && "Submit Requisition"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
