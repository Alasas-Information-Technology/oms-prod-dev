"use client";

import * as React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { HrSendBackDeadline } from "@/src/types/hr-send-back";
import { cn } from "@/lib/utils";

interface HrSendBackDeadlineNoticeProps {
  deadline: HrSendBackDeadline;
  className?: string;
}

export function HrSendBackDeadlineNotice({
  deadline,
  className,
}: HrSendBackDeadlineNoticeProps) {
  const { daysAllowed, closesAt, restartsOnSend } = deadline;

  const formattedClosesAt = React.useMemo(() => {
    try {
      return format(new Date(closesAt), "d MMMM");
    } catch {
      return "the end of the cycle";
    }
  }, [closesAt]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/40 p-4 text-xs text-foreground flex items-start gap-3 shadow-2xs",
        className
      )}
    >
      <Clock className="size-4 text-primary shrink-0 mt-0.5" />
      <div className="space-y-1 min-w-0">
        <p className="font-semibold text-foreground">
          SLA Response Timeline
        </p>
        <p className="text-muted-foreground leading-relaxed">
          She has <strong className="text-foreground">{daysAllowed} days</strong> to respond,
          or the request closes automatically on <strong className="text-foreground">{formattedClosesAt}</strong>.
          {restartsOnSend ? (
            <span className="ml-1 text-muted-foreground/90">
              (Sending back restarts the 30-day clock.)
            </span>
          ) : (
            <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
              (The SLA clock continues from the original submission date.)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
