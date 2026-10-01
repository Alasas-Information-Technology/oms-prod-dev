import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Check, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;           
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  module?: string;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: typeof Bell; iconClass: string; dotClass: string; bgClass: string }
> = {
  info: {
    Icon: Info,
    iconClass: "text-blue-600",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-50",
  },
  success: {
    Icon: CheckCircle,
    iconClass: "text-emerald-600",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50",
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: "text-amber-600",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50",
  },
  error: {
    Icon: AlertCircle,
    iconClass: "text-red-600",
    dotClass: "bg-red-500",
    bgClass: "bg-red-50",
  },
};

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onActionClick?: (id: string) => void;
  className?: string;
  onViewAll?: () => void;
  hideViewAll?: boolean;
}

export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onActionClick,
  onViewAll,
  hideViewAll,
  className,
}: NotificationPanelProps) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        "flex flex-col bg-card rounded-lg border border-border overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 pr-12 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <Bell size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Check size={12} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[480px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell size={32} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = TYPE_CONFIG[n.type];
            const Icon = config.Icon;

            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors",
                  !n.read && "bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    config.bgClass
                  )}
                >
                  <Icon size={14} className={config.iconClass} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span
                        className={cn("size-1.5 rounded-full shrink-0", config.dotClass)}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70">
                    <span>{n.timestamp}</span>
                    {n.module && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-muted-foreground">{n.module}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {n.actionLabel && (
                    <button
                      onClick={() => onActionClick?.(n.id)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {n.actionLabel}
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(n.id)}
                      className="text-muted-foreground/70 hover:text-foreground p-1"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!hideViewAll && onViewAll && (
        <div className="p-3 border-t border-border/60 bg-muted/20 text-center">
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
