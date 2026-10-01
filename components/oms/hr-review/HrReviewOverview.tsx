import Link from "next/link";
import { FileText, ArrowRight, Info, ExternalLink, Wallet, GitCommit } from "lucide-react";
import { HrReviewDetailResponse } from "@/types/hr-review";
import { DepartmentApprovalTrail } from "./DepartmentApprovalTrail";
import { SystemChecksPanel } from "./SystemChecksPanel";
import { HrConfirmationsPanel } from "./HrConfirmationsPanel";

interface HrReviewOverviewProps {
  detail: HrReviewDetailResponse;
  onNavigateTab: (tab: "approval-trail" | "budget") => void;
}

const formatClarificationDate = (isoString: string) => {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
  });
  return formatter.format(date); // e.g., 5 Aug
};

export function HrReviewOverview({
  detail,
  onNavigateTab,
}: HrReviewOverviewProps) {
  const cCtx = detail.clarificationContext;

  return (
    <div className="space-y-6">
      {/* TASK 3: Returned clarification banner with rich sky/blue styling */}
      {cCtx?.hadClarification && (
        <div className="relative overflow-hidden rounded-lg border border-sky-500/30 bg-gradient-to-r from-sky-500/[0.08] via-sky-500/[0.03] to-card p-5 shadow-xs">
          <div className="absolute left-0 inset-y-0 w-1 bg-sky-500" />
          <div className="flex gap-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 mt-0.5">
              <Info className="size-4.5" />
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  You asked for more information on {formatClarificationDate(cCtx.askedAt)}
                </p>
                <div className="mt-1 text-[13px] italic text-muted-foreground border-l-2 border-sky-500/40 pl-2.5 bg-sky-500/[0.04] py-1 rounded-r">
                  &quot;{cCtx.askMessage}&quot;
                </div>
              </div>

              <div className="h-px w-full bg-sky-500/15" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[13px] font-medium text-foreground">
                  <span className="font-semibold text-sky-700 dark:text-sky-300">{cCtx.respondedBy.name}</span> responded on {formatClarificationDate(cCtx.respondedAt)}
                  <span className="font-normal text-muted-foreground ml-1.5 text-xs bg-muted/80 px-2 py-0.5 rounded-full border border-border/40">
                    {cCtx.fieldsChanged} fields changed, {cCtx.attachmentsAdded} attachment added
                  </span>
                </div>
                
                <Link 
                  href={cCtx.diffLink} 
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-teal hover:underline underline-offset-4"
                >
                  View what changed <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* TASK 4: Business need Card */}
          <div className="rounded-lg border border-border/80 bg-card p-5 shadow-xs space-y-3 transition-colors hover:border-border">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
                <FileText className="size-4" />
              </div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-foreground">Business Need</h3>
            </div>
            {/* Full justification, NEVER truncated */}
            <div className="rounded-lg bg-muted/30 border border-border/50 p-3.5 text-[13.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {detail.request.justification}
            </div>
          </div>

          <SystemChecksPanel checks={detail.systemChecks} />
          
          <HrConfirmationsPanel confirmations={detail.hrConfirmations} requestId={detail.request.id} />
        </div>

        <div className="space-y-6">
          {/* Budget Summary Card with Emerald Theme */}
          <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] via-card to-card p-5 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="size-4" />
                </div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-foreground">Budget Position</h3>
              </div>
              <button
                onClick={() => onNavigateTab("budget")}
                className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                View detail <ArrowRight className="size-3" />
              </button>
            </div>
            
            <div className="mt-1 flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Available Remaining</span>
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-[24px] font-bold font-display text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(detail.budget.availableRemaining / 100)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {detail.budget.fundingRoute}
                </span>
              </div>
            </div>
          </div>

          {/* Approval Trail Summary Card */}
          <div className="rounded-lg border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <GitCommit className="size-4" />
                </div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-foreground">Approval Trail</h3>
              </div>
              <button
                onClick={() => onNavigateTab("approval-trail")}
                className="text-[12px] text-brand-teal hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            
            {/* Show only the last 3 items as a summary, or the whole thing if it's short */}
            <DepartmentApprovalTrail
              items={detail.approvalTrail.slice(-3)}
              detailed={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}