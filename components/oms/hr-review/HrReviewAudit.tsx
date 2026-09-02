import {
  Activity,
  History,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { HrAuditEntry } from "./hr-review.types";

interface HrReviewAuditProps {
  entries: HrAuditEntry[];
}

export function HrReviewAudit({
  entries,
}: HrReviewAuditProps) {
  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Audit History
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Immutable activity history for
              this request.
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="rounded-full"
        >
          {entries.length}
        </Badge>
      </div>

      <div className="space-y-0">
        {entries.map(
          (entry, index) => (
            <div
              key={entry.id}
              className="relative flex min-w-0 gap-3 pb-5 last:pb-0"
            >
              {index <
                entries.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-[calc(100%-24px)] w-px bg-border"
                />
              )}

              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Activity className="size-4" />
              </span>

              <div className="min-w-0 flex-1 rounded-xl border border-border/70 bg-slate-50/60 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="whitespace-normal text-sm font-semibold text-foreground">
                    {entry.action}
                  </p>

                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {
                      entry.occurredAt
                    }
                  </span>
                </div>

                <p className="mt-2 whitespace-normal text-sm leading-6 text-foreground-secondary">
                  {
                    entry.description
                  }
                </p>

                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" />

                  {entry.actor}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
}