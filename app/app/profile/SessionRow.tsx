"use client";

import { Monitor, Smartphone, Tablet, Calendar, Clock, Trash2 } from "lucide-react";
import { ActiveSession } from "@/lib/types/session.types";
import { SESSION_GRID } from "./SessionsTab";

interface SessionRowProps {
    session: ActiveSession;
    onTerminate: (loginSessionId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BROWSER_BADGE: Record<string, string> = {
    CHROME: "bg-blue-50   text-blue-600   border-blue-200   dark:bg-blue-950   dark:text-blue-400   dark:border-blue-800",
    FIREFOX: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
    SAFARI: "bg-sky-50    text-sky-600    border-sky-200    dark:bg-sky-950    dark:text-sky-400    dark:border-sky-800",
    EDGE: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800",
};

function getBrowserBadgeClass(browser: string): string {
    return BROWSER_BADGE[browser.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
}

function DeviceIcon({ type }: { type: string }) {
    const cls = "w-5 h-5 text-muted-foreground";
    const t = type.toUpperCase();
    if (t === "MOBILE") return <Smartphone className={cls} />;
    if (t === "TABLET") return <Tablet className={cls} />;
    return <Monitor className={cls} />;
}

function formatDateTime(value: Date | string): string {
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Dubai",
    });
}

function timeAgo(value: Date | string): string {
    const diffMs = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMs / 3_600_000);
    const days = Math.floor(diffMs / 86_400_000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionRow({ session, onTerminate }: SessionRowProps) {
    const isCurrent = session.isCurrentSession;

    return (
        <div
            className={`grid ${SESSION_GRID} items-center gap-4 py-4 border-b border-border last:border-0 ${isCurrent ? "bg-accent/20 -mx-6 px-6 rounded-lg" : ""
                }`}
        >
            {/* Device / Browser */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <DeviceIcon type={session.deviceType} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground capitalize">
                            {session.deviceType.toLowerCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${getBrowserBadgeClass(session.browserName)}`}>
                            {session.browserName.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                        {session.loginSessionId.slice(0, 8)}...
                    </p>
                </div>
            </div>

            {/* IP Address */}
            <span className="text-sm text-muted-foreground font-mono truncate">{session.ipAddress}</span>

            {/* Signed In */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{formatDateTime(session.createdAt)}</span>
            </div>

            {/* Last Active */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {timeAgo(session.lastActivityAt)}
            </div>

            {/* Expires */}
            <span className="text-sm text-muted-foreground truncate">
                {formatDateTime(session.expiresAt)}
            </span>

            {/* Status */}
            <div>
                {isCurrent ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-accent border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Current
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                {isCurrent ? (
                    <span className="text-xs text-muted-foreground italic">This device</span>
                ) : (
                    <button
                        onClick={() => onTerminate(session.loginSessionId)}
                        className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Terminate
                    </button>
                )}
            </div>
        </div>
    );
}