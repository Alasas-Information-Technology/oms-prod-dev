import { cn } from "@/components/ui/utils";

export type OMSStatus =
  | "draft" | "active" | "expired" | "terminated" | "under-review"
  | "pending" | "approved" | "rejected" | "on-hold" | "waiting"
  | "accredited" | "suspended" | "blacklisted" | "provisional"
  | "completed" | "cancelled" | "new" | "in-progress";

interface StatusConfig {
  label: string;
  className: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<OMSStatus, StatusConfig> = {
  draft:        { label: "Draft",        className: "bg-slate-100 text-slate-600 border-slate-200",     dotColor: "bg-slate-400" },
  active:       { label: "Active",       className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" },
  expired:      { label: "Expired",      className: "bg-orange-50 text-orange-700 border-orange-200",   dotColor: "bg-orange-500" },
  terminated:   { label: "Terminated",   className: "bg-red-50 text-red-700 border-red-200",            dotColor: "bg-red-500" },
  "under-review": { label: "Under Review", className: "bg-blue-50 text-blue-700 border-blue-200",       dotColor: "bg-blue-500" },
  pending:      { label: "Pending",      className: "bg-amber-50 text-amber-700 border-amber-200",      dotColor: "bg-amber-500" },
  approved:     { label: "Approved",     className: "bg-emerald-50 text-emerald-700 border-emerald-200",dotColor: "bg-emerald-500" },
  rejected:     { label: "Rejected",     className: "bg-red-50 text-red-700 border-red-200",            dotColor: "bg-red-500" },
  "on-hold":    { label: "On Hold",      className: "bg-orange-50 text-orange-700 border-orange-200",   dotColor: "bg-orange-500" },
  waiting:      { label: "Waiting",      className: "bg-slate-50 text-slate-500 border-slate-200",      dotColor: "bg-slate-400" },
  accredited:   { label: "Accredited",   className: "bg-emerald-50 text-emerald-700 border-emerald-200",dotColor: "bg-emerald-500" },
  suspended:    { label: "Suspended",    className: "bg-orange-50 text-orange-700 border-orange-200",   dotColor: "bg-orange-500" },
  blacklisted:  { label: "Blacklisted",  className: "bg-red-100 text-red-800 border-red-300",           dotColor: "bg-red-700" },
  provisional:  { label: "Provisional",  className: "bg-purple-50 text-purple-700 border-purple-200",   dotColor: "bg-purple-500" },
  completed:    { label: "Completed",    className: "bg-emerald-50 text-emerald-700 border-emerald-200",dotColor: "bg-emerald-500" },
  cancelled:    { label: "Cancelled",    className: "bg-slate-100 text-slate-600 border-slate-200",     dotColor: "bg-slate-400" },
  new:          { label: "New",          className: "bg-blue-100 text-blue-800 border-blue-200",         dotColor: "bg-blue-600" },
  "in-progress":{ label: "In Progress",  className: "bg-sky-50 text-sky-700 border-sky-200",            dotColor: "bg-sky-500" },
};

interface StatusBadgeProps {
  status: OMSStatus;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, showDot = true, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium premium-transition shadow-sm hover:shadow-md",
        size === "sm" ? "px-2 py-0.5 text-xs rounded" : "px-2.5 py-1 text-sm rounded-md",
        config.className,
        className
      )}
    >
      {showDot && <span className={cn("size-1.5 rounded-full shrink-0 shadow-[0_0_6px] shadow-current", config.dotColor)} />}
      {config.label}
    </span>
  );
}
