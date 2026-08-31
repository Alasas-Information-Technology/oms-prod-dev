import {
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { BudgetPositionPanel } from "./BudgetPositionPanel";
import { DepartmentApprovalTrail } from "./DepartmentApprovalTrail";
import { PolicyCompliancePanel } from "./PolicyCompliancePanel";
import { HrReviewRequest } from "./hr-review.types";

interface HrReviewOverviewProps {
  request: HrReviewRequest;
}

export function HrReviewOverview({
  request,
}: HrReviewOverviewProps) {
  return (
    <div className="space-y-4">
      <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Business Need
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Requestor justification for
              this resource requirement.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-slate-50/60 p-4">
          <p className="whitespace-normal text-sm leading-7 text-foreground-secondary">
            {request.businessNeed}
          </p>
        </div>
      </Card>

      <PolicyCompliancePanel
        checks={
          request.complianceChecks
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <BudgetPositionPanel
          budget={request.budget}
        />

        <DepartmentApprovalTrail
          items={request.approvalTrail}
        />
      </div>

      <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              HR Review Guidance
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Confirm the following before
              submitting a disposition.
            </p>
          </div>
        </div>

        <ul className="space-y-2 rounded-xl border border-border/70 p-4 text-sm text-foreground-secondary">
          <li>
            Review the business need and
            outsourcing suitability.
          </li>

          <li>
            Confirm all department
            approvals have been completed.
          </li>

          <li>
            Confirm the funding position
            and reservation are valid.
          </li>

          <li>
            Review all supporting
            attachments and compliance
            exceptions.
          </li>

          <li>
            Add a clear comment explaining
            the final HR disposition.
          </li>
        </ul>
      </Card>
    </div>
  );
}