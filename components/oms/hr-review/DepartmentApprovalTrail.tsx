import { HrApprovalTrailItem } from "@/types/hr-review";
import { cn } from "@/components/ui/utils";

interface DepartmentApprovalTrailProps {
  items: HrApprovalTrailItem[];
  detailed?: boolean;
}

const formatStepperDate = (isoString: string) => {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date).replace(" ", " "); // e.g., 4 Aug 2026, 09:18
};

export function DepartmentApprovalTrail({
  items,
  detailed = false,
}: DepartmentApprovalTrailProps) {
  return (
    <div className={cn("space-y-0", detailed && "max-w-4xl")}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.stage}-${index}`} className="relative flex gap-3 pb-6 last:pb-0">
            {/* Connector Line */}
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[9px] top-6 h-[calc(100%-16px)] w-px bg-border"
              />
            )}

            {/* Step Circle */}
            <span
              className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium text-muted-foreground mt-0.5"
            >
              {index + 1}
            </span>

            {/* Content */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <span className="text-[13px] font-medium text-foreground">
                  {item.label} by {item.stage.replace(/_/g, " ")}
                </span>
                <span className="text-[12px] font-normal text-muted-foreground whitespace-nowrap tabular-nums">
                  {formatStepperDate(item.at)}
                </span>
              </div>
              <span className="text-[12px] font-normal text-muted-foreground">
                {item.user.name}
              </span>
              
              {detailed && item.comment && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-[13px] font-normal text-foreground-secondary italic">
                  "{item.comment}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}