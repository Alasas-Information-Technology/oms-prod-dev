"use client";

import * as React from "react";
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
  FileText,
  Link as LinkIcon,
  Lock,
  RotateCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Calendar,
  Building2,
  Layers,
  FileCheck2,
  X,
  ExternalLink,
  Printer,
} from "lucide-react";
import { usePageBar } from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRequestById, MOCK_REQUESTS } from "./request.mock-data";
import { OmsRequest } from "./request.types";
import { RequestStatusBadge } from "./RequestStatusBadge";

interface PostHrDocumentPackProps {
  requestId: string;
}

export function PostHrDocumentPack({ requestId }: PostHrDocumentPackProps) {
  const router = useRouter();
  const { setCustomCrumbs } = usePageBar();

  // Dialog state for previews and audit log
  const [previewDoc, setPreviewDoc] = React.useState<{
    title: string;
    version: string;
    type: "certificate" | "hiring-request";
  } | null>(null);
  const [showAuditModal, setShowAuditModal] = React.useState(false);
  const [isPreparingPR, setIsPreparingPR] = React.useState(false);

  // Fetch request or fallback to mock
  const request: OmsRequest = React.useMemo(() => {
    const found = getRequestById(requestId);
    if (found) return found;
    // Fallback if ID is invalid or custom
    return (
      MOCK_REQUESTS.find((r) => r.requestId === "OMS-2026-0148") ||
      MOCK_REQUESTS[0]
    );
  }, [requestId]);

  // Set top page breadcrumb
  React.useEffect(() => {
    setCustomCrumbs([
      { label: "My Requests", href: "/app/requests" },
      { label: request.requestId, href: `/app/requests/${request.requestId}` },
      { label: "Documents", isCurrent: true },
    ]);
    return () => setCustomCrumbs(null);
  }, [request.requestId, setCustomCrumbs]);

  const formattedBudget = React.useMemo(() => {
    return `AED ${request.budget.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [request.budget]);

  const formattedLockedBudget = React.useMemo(() => {
    const locked = request.lockedBudget ?? Math.round(request.budget * 0.72);
    return `AED ${locked.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [request.budget, request.lockedBudget]);

  const handleDownload = (docTitle: string) => {
    toast.success(`${docTitle} downloaded successfully`, {
      description: "PDF version 1.0 (Signed & Verified)",
    });
  };

  const handleRegenerate = () => {
    toast.info("Regenerating Document Pack...", {
      description: "Re-verifying live budget and approval signatures.",
    });
    setTimeout(() => {
      toast.success("Document Pack refreshed successfully");
    }, 1000);
  };

  const handlePreparePR = () => {
    setIsPreparingPR(true);
    toast.loading("Preparing Oracle PR Package...", { id: "pr-prep" });
    setTimeout(() => {
      setIsPreparingPR(false);
      toast.success("Oracle PR Package Prepared Successfully!", {
        id: "pr-prep",
        description:
          "Requisition hand-off payload compiled and dispatched to Procurement.",
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 dark:bg-slate-950 pb-16 select-none">
      {/* Top Header Row */}
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Post-HR Document Pack
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {request.position} · {request.candidateRoute || "Unknown candidate route"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RequestStatusBadge status="HR Approved" className="text-xs px-3 py-1" />
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="mt-8 max-w-[1600px] mx-auto overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[700px] px-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shadow-sm">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Department Approval
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-primary/80 mx-3" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shadow-sm">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                HR Review
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-primary/80 mx-3" />

            {/* Step 3 Active */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-slate-100 dark:ring-slate-800">
                3
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Documents
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 mx-3" />

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 relative text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center font-medium text-xs bg-white dark:bg-slate-900">
                4
              </div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Oracle PR
              </span>
            </div>

            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 mx-3" />

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-2 relative text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center font-medium text-xs bg-white dark:bg-slate-900">
                5
              </div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Procurement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="px-6 py-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Generated Documents (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Generated Documents
            </h2>

            {/* Document Card 1: HR Approval Certificate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow">
                      1
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        HR Approval Certificate
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        Generated
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Version 1.0 · 05 Aug 2026 16:10
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      Contains position detail, budget position, HR confirmation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    onClick={() =>
                      setPreviewDoc({
                        title: "HR Approval Certificate",
                        version: "Version 1.0 · 05 Aug 2026 16:10",
                        type: "certificate",
                      })
                    }
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    onClick={() => handleDownload("HR Approval Certificate")}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Card 2: OEMS Hiring Request Document */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow">
                      2
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        OEMS Hiring Request Document
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        Generated
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Version 1.0 · 05 Aug 2026 16:10
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      Contains {request.resources} positions and job descriptions,
                      secure QR vendor upload route.
                    </p>

                    {/* QR Code Inner Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3 mt-3 flex items-center gap-3.5 max-w-md">
                      <div className="w-12 h-12 shrink-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 flex items-center justify-center shadow-xs">
                        {/* Styled SVG QR Graphic */}
                        <svg
                          viewBox="0 0 24 24"
                          className="w-full h-full text-slate-800 dark:text-slate-200 fill-current"
                        >
                          <path d="M2,2 H10 V10 H2 Z M4,4 V8 H8 V4 Z M14,2 H22 V10 H14 Z M16,4 V8 H20 V4 Z M2,14 H10 V22 H2 Z M4,16 V20 H8 V16 Z M14,14 H17 V17 H14 Z M19,14 H22 V19 H19 Z M14,19 H19 V22 H14 Z M19,19 H22 V22 H19 Z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                          Secure requisition route
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Signed link
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Expiry enforced
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Audit enabled
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    onClick={() =>
                      setPreviewDoc({
                        title: "OEMS Hiring Request Document",
                        version: "Version 1.0 · 05 Aug 2026 16:10",
                        type: "hiring-request",
                      })
                    }
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    onClick={() =>
                      handleDownload("OEMS Hiring Request Document")
                    }
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Metadata Footer Bar */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Source Request:{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    {request.requestId}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Generated from:{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    live data
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>
                  Document hash:{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    Verified
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Classification:{" "}
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">
                    Confidential
                  </strong>
                </span>
              </div>
            </div>

            {/* Next Step Callout Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3.5 mt-2">
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
                <ArrowRight className="w-3.5 h-3.5" />
                Next step
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-0.5">
                Attach the generated pack to the Oracle Purchase Requisition,
                then hand the request to Procurement for qualified-vendor sourcing.
              </p>
            </div>
          </div>

          {/* Right Column: Readiness + Snapshot + Audit (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Oracle PR Readiness */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Oracle PR Readiness
              </h2>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>HR Approval Certificate attached</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Passed
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Hiring Request Document attached</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Passed
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Budget allocation {formattedBudget}</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Verified
                  </span>
                </div>

                {/* Item 4 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Department approval trail</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Complete
                  </span>
                </div>

                {/* Item 5 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>HR approval</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Complete
                  </span>
                </div>

                {/* Item 6 */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Procurement handover</span>
                  </div>
                  <span className="font-semibold text-amber-500">Pending</span>
                </div>
              </div>

              {/* Ready Banner Box */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-center gap-2 mt-5 text-primary font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Ready to create PR</span>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 rounded-lg shadow-xs"
                disabled={isPreparingPR}
                onClick={handlePreparePR}
              >
                {isPreparingPR ? "Preparing Package..." : "Prepare Oracle PR Package"}
              </Button>
            </div>

            {/* Card 2: Request Snapshot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Request Snapshot
              </h2>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Resources</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {request.resources}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Grade</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    G8
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Engagement</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    12 months
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Work location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {request.location || "DIEZ Premises"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Funding</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Budgeted
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Locked & Allocated</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formattedLockedBudget}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Version & Audit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Version & Audit
              </h2>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Generated by</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    System
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Request data timestamp</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    05 Aug 2026 16:10
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>HR approver</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Fatima Al Hashimi
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Download events</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    0
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-normal">
                Regeneration allowed only after approved change.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 h-8 text-xs font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                onClick={() => setShowAuditModal(false)}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                View Document Audit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200/90 dark:border-slate-800 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Drafts are retained for 60 days.</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              onClick={() => router.push("/app/requests")}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              onClick={handleRegenerate}
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate Documents
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              disabled={isPreparingPR}
              onClick={handlePreparePR}
            >
              Prepare Oracle PR Package
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <DialogTitle className="text-lg font-bold flex items-center justify-between text-slate-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {previewDoc.title}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {previewDoc.version}
                </span>
              </DialogTitle>
            </DialogHeader>

            {/* Document Content View Mock */}
            <div className="py-4 text-xs text-slate-700 dark:text-slate-300 space-y-6">
              {/* Header Box */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    DUBAI INTEGRATED ECONOMIC ZONES AUTHORITY
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official HR Approval & Requisition Record
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground text-xs">
                  CONFIDENTIAL
                </Badge>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Requisition ID:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {request.requestId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Position Title:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {request.position}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Department:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {request.department || "Technology & Infrastructure"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Total Approved Budget:
                  </span>
                  <span className="font-semibold text-primary">
                    {formattedBudget}
                  </span>
                </div>
              </div>

              {/* Justification summary */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                  Business Justification & Clearance
                </h4>
                <p className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-300">
                  {request.justification}
                </p>
              </div>

              {/* Sign-off Stamps */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border border-primary/30 bg-primary/5 dark:border-primary/40 p-3 rounded-lg">
                  <span className="text-[11px] text-primary font-semibold block">
                    ✓ HR APPROVED
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Approver: Fatima Al Hashimi
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Timestamp: 05 Aug 2026 16:10
                  </span>
                </div>
                <div className="border border-primary/30 bg-primary/5 dark:border-primary/40 p-3 rounded-lg">
                  <span className="text-[11px] text-primary font-semibold block">
                    ✓ BUDGET VERIFIED
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Source: DIEZ Budget Control System
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Hash: 8f92a10b4e571c...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  handleDownload(previewDoc.title);
                  setPreviewDoc(null);
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
          <DialogContent className="max-w-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Document Pack Audit Trail
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    HR Approval Certified
                  </p>
                  <p className="text-slate-500">
                    Fatima Al Hashimi signed HR Approval Certificate for {request.requestId}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    05 Aug 2026 16:10:04 GST
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Document Pack Generated
                  </p>
                  <p className="text-slate-500">
                    Compiled HR Approval Certificate & OEMS Hiring Request Document v1.0
                  </p>
                  <span className="text-[11px] text-slate-400">
                    05 Aug 2026 16:10:12 GST
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Secure Vendor QR Code Generated
                  </p>
                  <p className="text-slate-500">
                    Signed upload token initialized (Expiry: 30 days)
                  </p>
                  <span className="text-[11px] text-slate-400">
                    05 Aug 2026 16:10:15 GST
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuditModal(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
