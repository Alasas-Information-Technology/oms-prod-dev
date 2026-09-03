import { FileText, ArrowRight, Info, ExternalLink } from "lucide-react";
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
      {/* TASK 3: Returned clarification banner */}
      {cCtx?.hadClarification && (
        <div className="rounded-xl border border-border bg-slate-50 p-5 shadow-xs">
          <div className="flex gap-3">
            <Info className="size-5 shrink-0 text-muted-foreground mt-0.5" />
            <div className="space-y-4">
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  You asked for more information on {formatClarificationDate(cCtx.askedAt)}
                </p>
                <p className="mt-1 text-[13px] font-normal text-foreground-secondary">
                  "{cCtx.askMessage}"
                </p>
              </div>

              <div className="h-px w-full bg-border/60" />

              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  {cCtx.respondedBy.name} responded on {formatClarificationDate(cCtx.respondedAt)}
                  <span className="font-normal text-muted-foreground ml-1">
                    — {cCtx.fieldsChanged} fields changed, {cCtx.attachmentsAdded} attachment added
                  </span>
                </p>
                
                <a 
                  href={cCtx.diffLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline underline-offset-2"
                >
                  View what changed <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-x-8 gap-y-10 xl:grid-cols-2">
        <div className="space-y-10">
          {/* TASK 4: Business need */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-primary" />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Business Need</h3>
            </div>
            {/* Full justification, NEVER truncated */}
            <p className="text-[13px] font-normal leading-6 text-foreground-secondary whitespace-pre-wrap">
              {detail.request.justification}
            </p>
          </div>

          <SystemChecksPanel checks={detail.systemChecks} />
          
          <HrConfirmationsPanel confirmations={detail.hrConfirmations} requestId={detail.request.id} />
        </div>

        <div className="space-y-10">
          {/* Budget Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Budget Position</h3>
              <button
                onClick={() => onNavigateTab("budget")}
                className="text-[13px] text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                View detail <ArrowRight className="size-3" />
              </button>
            </div>
            
            <div className="rounded-xl border border-border bg-slate-50 p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-normal text-muted-foreground">Available</span>
                <span className="text-[13px] font-medium tabular-nums">
                  {new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(detail.budget.availableRemaining / 100)}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-baseline text-[13px] font-normal">
                <span className="text-[12px] font-normal text-muted-foreground">Route</span>
                <span className="text-[13px] font-medium text-foreground">{detail.budget.fundingRoute}</span>
              </div>
            </div>
          </div>

          {/* Approval Trail Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Approval Trail</h3>
              <button
                onClick={() => onNavigateTab("approval-trail")}
                className="text-[13px] text-primary hover:underline font-medium inline-flex items-center gap-1"
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