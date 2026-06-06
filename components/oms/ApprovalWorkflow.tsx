import { Check, X, Clock, AlertCircle, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type ApprovalStatus = "approved" | "rejected" | "pending" | "waiting" | "on-hold";

export interface ApprovalStep {
  id: string;
  order: number;
  approverName: string;
  approverRole: string;
  department: string;
  status: ApprovalStatus;
  timestamp?: string;
  comments?: string;
  initials?: string;
}

interface ApprovalWorkflowProps {
  steps: ApprovalStep[];
  title?: string;
  referenceNumber?: string;
  requestedBy?: { name: string; role: string; department: string; date: string };
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const STATUS_CONFIG: Record<
  ApprovalStatus,
  { Icon: typeof Check; iconClass: string; dotClass: string; label: string; textClass: string }
> = {
  approved: {
    Icon: Check,
    iconClass: "text-white",
    dotClass: "bg-emerald-600",
    label: "Approved",
    textClass: "text-emerald-700",
  },
  rejected: {
    Icon: X,
    iconClass: "text-white",
    dotClass: "bg-red-600",
    label: "Rejected",
    textClass: "text-red-700",
  },
  pending: {
    Icon: Clock,
    iconClass: "text-amber-700",
    dotClass: "bg-amber-100 border border-amber-300",
    label: "Pending",
    textClass: "text-amber-700",
  },
  waiting: {
    Icon: Clock,
    iconClass: "text-slate-500",
    dotClass: "bg-slate-100 border border-slate-300",
    label: "Waiting",
    textClass: "text-slate-500",
  },
  "on-hold": {
    Icon: AlertCircle,
    iconClass: "text-orange-700",
    dotClass: "bg-orange-100 border border-orange-300",
    label: "On Hold",
    textClass: "text-orange-700",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ApprovalWorkflow({
  steps,
  title,
  referenceNumber,
  requestedBy,
  orientation = "horizontal",
  className,
}: ApprovalWorkflowProps) {
  return (
    <div className={cn("glass-card rounded-lg border border-slate-200 overflow-hidden", className)}>
      {(title || referenceNumber || requestedBy) && (
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && <div className="text-sm font-semibold text-slate-900">{title}</div>}
            {referenceNumber && (
              <div className="text-xs text-muted-foreground mt-0.5">Ref: {referenceNumber}</div>
            )}
          </div>
          {requestedBy && (
            <div className="text-right">
              <div className="text-xs font-medium text-slate-700">{requestedBy.name}</div>
              <div className="text-xs text-muted-foreground">
                {requestedBy.role} · {requestedBy.department}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{requestedBy.date}</div>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {orientation === "horizontal" ? (
          <div className="flex items-start overflow-x-auto gap-0 pb-2">
            {steps.map((step, idx) => {
              const cfg = STATUS_CONFIG[step.status];
              const StatusIcon = cfg.Icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="flex items-start shrink-0">
                  <div className="flex flex-col items-center gap-2 w-32">
                    <div className="relative">
                      <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700 border border-slate-200">
                        {step.initials ?? getInitials(step.approverName)}
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-5 rounded-full flex items-center justify-center",
                          cfg.dotClass
                        )}
                      >
                        <StatusIcon size={10} className={cfg.iconClass} />
                      </div>
                    </div>

                    <div className="text-center px-1">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {step.approverName}
                      </div>
                      <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {step.approverRole}
                      </div>
                      <div className={cn("text-xs font-medium mt-1.5", cfg.textClass)}>
                        {cfg.label}
                      </div>
                      {step.timestamp && (
                        <div className="text-xs text-slate-400 mt-0.5">{step.timestamp}</div>
                      )}
                    </div>

                    {step.comments && (
                      <div className="w-full px-2 py-1.5 glass rounded border border-slate-100/50 text-xs text-slate-600 flex items-start gap-1 shadow-sm">
                        <MessageSquare size={10} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{step.comments}</span>
                      </div>
                    )}
                  </div>

                  {!isLast && (
                    <div className="flex items-center w-8 shrink-0 mt-4">
                      <div className="flex-1 h-px bg-slate-200" />
                      <ChevronRight size={12} className="text-slate-300 -mx-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {steps.map((step, idx) => {
              const cfg = STATUS_CONFIG[step.status];
              const StatusIcon = cfg.Icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative flex gap-4">
                  {!isLast && (
                    <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" />
                  )}

                  <div className="relative shrink-0">
                    <div className="size-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {step.initials ?? getInitials(step.approverName)}
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 size-4 rounded-full flex items-center justify-center",
                        cfg.dotClass
                      )}
                    >
                      <StatusIcon size={8} className={cfg.iconClass} />
                    </div>
                  </div>

                  <div className={cn("flex-1", !isLast && "pb-5")}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {step.approverName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.approverRole} · {step.department}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn("text-xs font-medium", cfg.textClass)}>{cfg.label}</div>
                        {step.timestamp && (
                          <div className="text-xs text-slate-400 mt-0.5">{step.timestamp}</div>
                        )}
                      </div>
                    </div>
                    {step.comments && (
                      <div className="mt-2 px-2.5 py-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                        <MessageSquare size={11} className="text-slate-400 mt-0.5 shrink-0" />
                        <span>{step.comments}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
