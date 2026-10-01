import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HrReviewRequestDetail } from "@/types/hr-review";
import { cn } from "@/components/ui/utils";

interface HrReviewRequestSummaryProps {
  request: HrReviewRequestDetail;
}

const dateFormatter = new Intl.DateTimeFormat("en-AE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function MetricItem({
  icon: Icon,
  label,
  value,
  colorScheme = "teal",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  colorScheme?: "teal" | "indigo" | "amber" | "purple";
}) {
  const colorMap = {
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/60 p-3 transition-all hover:border-border hover:bg-card">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", colorMap[colorScheme])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-[14px] font-bold text-foreground tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

export function HrReviewRequestSummary({
  request,
}: HrReviewRequestSummaryProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/80 bg-gradient-to-b from-card via-card to-card/90 p-5 shadow-xs before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-brand-teal/90 before:via-primary/70 before:to-brand-teal/40">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">
            {request.position}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {request.badges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className={cn(
                  "rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                  badge === "BUDGET_VERIFIED" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-2xs",
                  badge === "NEW" && "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
                  badge === "RETURNED" && "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
                )}
              >
                {badge === "BUDGET_VERIFIED" ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Budget verified
                  </span>
                ) : badge === "RETURNED" ? (
                  <span className="inline-flex items-center gap-1">
                    <RotateCcw className="size-3" />
                    Clarification returned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="size-3" />
                    New
                  </span>
                )}
              </Badge>
            ))}

            <Badge
              variant="outline"
              className="rounded-md font-medium text-[11px] border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2.5 py-0.5"
            >
              {request.candidateRoute}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-md font-medium text-[11px] border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5"
            >
              <MapPin className="size-3 mr-1" />
              {request.workLocation}
            </Badge>
          </div>
        </div>

        <div className="shrink-0">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border/60">
            {request.id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-border/60">
        <MetricItem
          icon={Users}
          label="Resources"
          value={`${request.resources} ${request.resources === 1 ? 'position' : 'positions'}`}
          colorScheme="teal"
        />

        <MetricItem
          icon={Clock3}
          label="Engagement"
          value={`${request.engagementMonths} months`}
          colorScheme="indigo"
        />

        <MetricItem
          icon={CalendarDays}
          label="Expected start"
          value={dateFormatter.format(new Date(request.expectedStart))}
          colorScheme="amber"
        />

        <MetricItem
          icon={ShieldCheck}
          label="Grade"
          value={request.grade}
          colorScheme="purple"
        />
      </div>
    </div>
  );
}