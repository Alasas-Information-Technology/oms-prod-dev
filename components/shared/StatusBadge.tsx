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
  draft:        { label: "Draft",        className: "bg-muted text-muted-foreground border-border dark:bg-muted/50",     dotColor: "bg-muted-foreground/60" },
  active:       { label: "Active",       className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40", dotColor: "bg-emerald-500" },
  expired:      { label: "Expired",      className: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",   dotColor: "bg-orange-500" },
  terminated:   { label: "Terminated",   className: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40",            dotColor: "bg-red-500" },
  "under-review": { label: "Under Review", className: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",       dotColor: "bg-blue-500" },
  pending:      { label: "Pending",      className: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",      dotColor: "bg-amber-500" },
  approved:     { label: "Approved",     className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",dotColor: "bg-emerald-500" },
  rejected:     { label: "Rejected",     className: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40",            dotColor: "bg-red-500" },
  "on-hold":    { label: "On Hold",      className: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",   dotColor: "bg-orange-500" },
  waiting:      { label: "Waiting",      className: "bg-muted text-muted-foreground border-border dark:bg-muted/40",      dotColor: "bg-muted-foreground/60" },
  accredited:   { label: "Accredited",   className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",dotColor: "bg-emerald-500" },
  suspended:    { label: "Suspended",    className: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",   dotColor: "bg-orange-500" },
  blacklisted:  { label: "Blacklisted",  className: "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/50",           dotColor: "bg-red-500" },
  provisional:  { label: "Provisional",  className: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",   dotColor: "bg-purple-500" },
  completed:    { label: "Completed",    className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",dotColor: "bg-emerald-500" },
  cancelled:    { label: "Cancelled",    className: "bg-muted text-muted-foreground border-border dark:bg-muted/50",     dotColor: "bg-muted-foreground/60" },
  new:          { label: "New",          className: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",         dotColor: "bg-blue-500" },
  "in-progress":{ label: "In Progress",  className: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",            dotColor: "bg-sky-500" },
};

interface StatusBadgeProps {
  status: OMSStatus;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
  label?: string; // <--- ADDED Optional label override
}

export function StatusBadge({
  status,
  className,
  showDot = true,
  size = "md",
  label, // <--- ADDED
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
    dotColor: "bg-muted-foreground/60",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)}
        />
      )}
      {label ?? config.label}
    </span>
  );
}
