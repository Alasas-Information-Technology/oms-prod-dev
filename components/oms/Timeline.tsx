import { ReactNode } from "react";
import { Check, Clock, AlertCircle, Loader } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type TimelineStatus = "completed" | "current" | "pending" | "error";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: TimelineStatus;
  icon?: ReactNode;
  user?: { name: string; role?: string };
  meta?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const STATUS_CONFIG: Record<TimelineStatus, { icon: ReactNode; dotClass: string }> = {
  completed: {
    icon: <Check size={12} strokeWidth={2.5} />,
    dotClass: "bg-emerald-600 border-emerald-600 text-white",
  },
  current: {
    icon: <Loader size={12} className="animate-spin" />,
    dotClass: "bg-primary border-primary text-white",
  },
  pending: {
    icon: <Clock size={12} />,
    dotClass: "bg-white border-slate-300 text-slate-400",
  },
  error: {
    icon: <AlertCircle size={12} />,
    dotClass: "bg-red-600 border-red-600 text-white",
  },
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, idx) => {
        const config = STATUS_CONFIG[item.status];
        const isLast = idx === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4">
            {!isLast && (
              <div
                className="absolute left-4 top-9 bottom-0 w-px bg-slate-200"
                style={{ zIndex: 0 }}
              />
            )}

            <div className="relative z-10 shrink-0 flex items-start pt-0.5 premium-transition hover-scale">
              <div
                className={cn(
                  "size-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm",
                  config.dotClass
                )}
              >
                {item.icon ?? config.icon}
              </div>
            </div>

            <div className={cn("flex-1 min-w-0", !isLast && "pb-6")}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 leading-snug">
                    {item.title}
                  </div>
                  {item.user && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.user.name}
                      {item.user.role && (
                        <span className="text-slate-400"> · {item.user.role}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {item.timestamp && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.timestamp}
                    </div>
                  )}
                  {item.meta && (
                    <div className="text-xs text-slate-400 mt-0.5">{item.meta}</div>
                  )}
                </div>
              </div>
              {item.description && (
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
