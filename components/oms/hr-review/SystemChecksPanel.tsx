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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <ServerCog className="size-4 text-primary" />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Verified by the System
        </h3>
      </div>

      <div className="space-y-2">
        {checks.map((check) => {
          const isFailed = check.state === "FAILED";
          const isBlocking = isFailed && check.blocksApproval;

          return (
            <div
              key={check.code}
              className="group flex min-w-0 items-start gap-3 rounded-lg py-2"
              title={`Checked at ${formatTimestamp(check.checkedAt)}`}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  isFailed
                    ? "text-destructive bg-destructive-light"
                    : "text-success bg-success-light"
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
                    "text-[13px] font-medium",
                    isBlocking ? "text-destructive" : "text-foreground"
                  )}
                >
                  {check.label}
                </p>

                {isFailed && check.failureReason && (
                  <p className="mt-1 text-[12px] font-normal text-destructive">
                    {check.failureReason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
