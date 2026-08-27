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

export interface ApprovalWorkflowProps {
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
    <div className={cn("rounded-lg border border-slate-200 overflow-hidden bg-card", className)}>
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
              <div className="text-[11px] text-slate-400 mt-0.5">{requestedBy.date}</div>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {orientation === "horizontal" ? (
          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            {steps.map((step, idx) => {
              const config = STATUS_CONFIG[step.status];
              const Icon = config.Icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center text-center w-36">
                    <div
                      className={cn(
                        "size-9 rounded-full flex items-center justify-center font-medium text-xs shadow-sm mb-2",
                        config.dotClass
                      )}
                    >
                      {step.status === "approved" || step.status === "rejected" ? (
                        <Icon size={16} className={config.iconClass} strokeWidth={2.5} />
                      ) : (
                        <span className={cn("text-xs font-semibold", config.iconClass)}>
                          {step.initials ?? getInitials(step.approverName)}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-900 leading-tight max-w-[130px] truncate">
                      {step.approverName}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                      {step.approverRole}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                      {step.department}
                    </div>

                    <div
                      className={cn(
                        "inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium",
                        config.textClass,
                        step.status === "approved" && "bg-emerald-50",
                        step.status === "rejected" && "bg-red-50",
                        step.status === "pending" && "bg-amber-50",
                        step.status === "waiting" && "bg-slate-50",
                        step.status === "on-hold" && "bg-orange-50"
                      )}
                    >
                      <Icon size={10} />
                      {config.label}
                    </div>

                    {step.timestamp && (
                      <div className="text-[10px] text-slate-400 mt-1">{step.timestamp}</div>
                    )}
                  </div>

                  {!isLast && (
                    <div className="flex items-center pb-8 text-slate-300">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const config = STATUS_CONFIG[step.status];
              const Icon = config.Icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {!isLast && (
                    <div
                      className="absolute left-4 top-9 bottom-0 w-px bg-slate-200"
                      style={{ zIndex: 0 }}
                    />
                  )}

                  <div
                    className={cn(
                      "relative z-10 size-8 rounded-full flex items-center justify-center font-medium text-xs shadow-sm shrink-0",
                      config.dotClass
                    )}
                  >
                    {step.status === "approved" || step.status === "rejected" ? (
                      <Icon size={14} className={config.iconClass} strokeWidth={2.5} />
                    ) : (
                      <span className={cn("text-xs font-semibold", config.iconClass)}>
                        {step.initials ?? getInitials(step.approverName)}
                      </span>
                    )}
                  </div>

                  <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {step.approverName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.approverRole} · {step.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            config.textClass,
                            step.status === "approved" && "bg-emerald-50",
                            step.status === "rejected" && "bg-red-50",
                            step.status === "pending" && "bg-amber-50",
                            step.status === "waiting" && "bg-slate-50",
                            step.status === "on-hold" && "bg-orange-50"
                          )}
                        >
                          <Icon size={10} />
                          {config.label}
                        </div>
                        {step.timestamp && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {step.timestamp}
                          </div>
                        )}
                      </div>
                    </div>

                    {step.comments && (
                      <div className="mt-2 flex items-start gap-2 p-2.5 rounded bg-slate-50 text-xs text-slate-600 border border-slate-100">
                        <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="italic">{step.comments}</span>
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
