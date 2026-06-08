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
        "flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 pr-12 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <Bell size={15} className="text-slate-700" />
          <span className="text-sm font-semibold text-slate-900">Notifications</span>
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

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 max-h-[480px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell size={28} className="text-slate-300 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type];
            const Icon = cfg.Icon;

            return (
              <div
                key={notif.id}
                role="button"
                onClick={() => !notif.read && onMarkRead?.(notif.id)}
                className={cn(
                  "relative flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
                  !notif.read && "bg-blue-50/30"
                )}
              >
                {!notif.read && (
                  <span
                    className={cn(
                      "absolute left-1.5 top-4 size-1.5 rounded-full",
                      cfg.dotClass
                    )}
                  />
                )}

                <div className={cn("shrink-0 mt-0.5 size-7 rounded-full flex items-center justify-center", cfg.bgClass)}>
                  <Icon size={14} className={cfg.iconClass} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 leading-snug">
                        {notif.title}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss?.(notif.id);
                      }}
                      className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {notif.module && (
                        <>
                          <span className="font-medium text-slate-500">{notif.module}</span>
                          <span>·</span>
                        </>
                      )}
                      {notif.timestamp}
                    </div>
                    {notif.actionLabel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionClick?.(notif.id);
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {notif.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && !hideViewAll && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
