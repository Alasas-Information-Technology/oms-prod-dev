"use client";

import { format } from "date-fns";
import { ApprovalHistoryItem } from "@/lib/types/approval.types";
import { History, CheckCircle2, Undo2, XCircle, Send } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalHistoryProps {
  history: ApprovalHistoryItem[];
}

function getActionMeta(action: ApprovalHistoryItem["action"]) {
  switch (action) {
    case "APPROVE":
      return {
        label: "Approved",
        icon: CheckCircle2,
        pillClass: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        nodeClass: "bg-emerald-700 text-white shadow-2xs",
      };
    case "REJECT":
      return {
        label: "Rejected",
        icon: XCircle,
        pillClass: "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        nodeClass: "bg-rose-700 text-white shadow-2xs",
      };
    case "SEND_BACK":
      return {
        label: "Sent Back",
        icon: Undo2,
        pillClass: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        nodeClass: "bg-amber-700 text-white shadow-2xs",
      };
    case "SUBMITTED":
      return {
        label: "Submitted",
        icon: Send,
        pillClass: "bg-primary/10 text-primary border-primary/20",
        nodeClass: "bg-primary text-primary-foreground shadow-2xs",
      };
    default:
      return {
        label: "Reviewed",
        icon: History,
        pillClass: "bg-muted text-muted-foreground border-border",
        nodeClass: "bg-muted text-muted-foreground",
      };
  }
}

export function ApprovalHistory({ history }: ApprovalHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Audit & Decision Trail</h3>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded border border-border">
          {history.length} Event{history.length === 1 ? "" : "s"} Recorded
        </span>
      </div>

      <div className="flex flex-col">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const meta = getActionMeta(item.action);
          const ActionIcon = meta.icon;
          
          return (
            <div key={`${item.user.id}-${item.at}`} className="flex gap-4 relative">
              {/* Timeline Connector & Node */}
              <div className="flex flex-col items-center">
                <div className={cn("z-10 flex items-center justify-center size-7 rounded-full text-xs font-bold shrink-0", meta.nodeClass)}>
                  <ActionIcon className="size-3.5 stroke-[2.5]" />
                </div>
                {!isLast && (
                  <div className="w-[2px] h-full bg-slate-300 dark:bg-slate-700 my-1" />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex flex-col gap-1.5 pb-6 pt-0.5 flex-1 min-w-0", isLast && "pb-0")}>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {item.user.name}
                  </span>
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", meta.pillClass)}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    &middot; {format(new Date(item.at), "d MMM yyyy, HH:mm")}
                  </span>
                </div>
                
                {item.comment && (
                  <div className="mt-1 p-3.5 rounded-lg bg-muted/30 border border-border text-xs leading-relaxed text-foreground/90 font-normal">
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

