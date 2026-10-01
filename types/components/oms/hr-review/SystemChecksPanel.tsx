import { CheckCircle2, CircleAlert, ServerCog } from "lucide-react";
import { HrSystemCheck } from "@/types/hr-review";
import { cn } from "@/components/ui/utils";

interface SystemChecksPanelProps {
  checks: HrSystemCheck[];
}

const formatTimestamp = (isoString: string) => {
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};

export function SystemChecksPanel({ checks }: SystemChecksPanelProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-3.5 transition-colors hover:border-border">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <ServerCog className="size-4" />
        </div>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-foreground">
          Verified by the System
        </h3>
      </div>

      <div className="space-y-2 pt-0.5">
        {checks.map((check) => {
          const isFailed = check.state === "FAILED";
          const isBlocking = isFailed && check.blocksApproval;

          return (
            <div
              key={check.code}
              className={cn(
                "group flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 border transition-all",
                isFailed
                  ? "bg-rose-500/[0.05] border-rose-500/25 dark:bg-rose-500/[0.08]"
                  : "bg-emerald-500/[0.04] border-emerald-500/20 dark:bg-emerald-500/[0.08]"
              )}
              title={`Checked at ${formatTimestamp(check.checkedAt)}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className={cn(
                    "flex size-5.5 shrink-0 items-center justify-center rounded-full",
                    isFailed
                      ? "text-rose-600 dark:text-rose-400 bg-rose-500/20"
                      : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/20"
                  )}
                >
                  {isFailed ? (
                    <CircleAlert className="size-3.5" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[13px] font-medium truncate",
                      isBlocking ? "text-rose-700 dark:text-rose-400 font-semibold" : "text-foreground"
                    )}
                  >
                    {check.label}
                  </p>
                  {isFailed && check.failureReason && (
                    <p className="mt-0.5 text-[11.5px] font-normal text-rose-600 dark:text-rose-400">
                      {check.failureReason}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  "text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider",
                  isFailed
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                )}
              >
                {isFailed ? "Action Required" : "Passed"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
