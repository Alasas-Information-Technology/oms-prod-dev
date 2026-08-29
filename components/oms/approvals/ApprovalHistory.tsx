"use client";

import { format } from "date-fns";
import { ApprovalHistoryItem } from "@/lib/types/approval.types";
import { cn } from "@/components/ui/utils";

interface ApprovalHistoryProps {
  history: ApprovalHistoryItem[];
}

function getActionLabel(action: ApprovalHistoryItem["action"]) {
  switch (action) {
    case "APPROVE":
      return "Approved";
    case "REJECT":
      return "Rejected";
    case "SEND_BACK":
      return "Sent Back";
    case "SUBMITTED":
      return "Submitted";
    default:
      return "Reviewed";
  }
}

export function ApprovalHistory({ history }: ApprovalHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-6">Approval History</h3>
      <div className="flex flex-col">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const actionLabel = getActionLabel(item.action);
          
          return (
            <div key={`${item.user.id}-${item.at}`} className="flex gap-4 relative">
              {/* Timeline Connector & Node */}
              <div className="flex flex-col items-center">
                <div className="z-10 flex items-center justify-center w-7 h-7 rounded-full bg-muted border border-border/60 text-xs font-semibold text-muted-foreground shrink-0">
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-[2px] h-full bg-border/40 my-1" />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex flex-col gap-1 pb-6 pt-0.5", isLast && "pb-0")}>
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    {item.user.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {actionLabel.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    &middot; {format(new Date(item.at), "d MMM yyyy, HH:mm")}
                  </span>
                </div>
                
                {item.comment && (
                  <div className="mt-1.5 p-3 rounded-md bg-muted/30 border border-border/50 text-sm text-foreground">
                    {item.comment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
