"use client";

import { useState } from "react";
import {
    LogOut, RefreshCw, AlertCircle,
    Monitor, Smartphone, Tablet, Calendar, Clock, Trash2,
} from "lucide-react";
import { ActiveSession } from "@/lib/types/session.types";
import { DataTable, ColumnDef } from "@/components/oms/DataTable2";
import { ConfirmDialog, ConfirmDialogDetail } from "@/components/oms/ConfirmDialog";

interface SessionsTabProps {
    sessions: ActiveSession[];
    loading: boolean;
    error: string | null;
    onTerminate: (loginSessionId: string) => void;
    onTerminateAll: () => void;
    onRetry: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BROWSER_BADGE: Record<string, string> = {
    CHROME: "bg-blue-50   text-blue-600   border-blue-200   dark:bg-blue-950   dark:text-blue-400   dark:border-blue-800",
    FIREFOX: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
    SAFARI: "bg-sky-50    text-sky-600    border-sky-200    dark:bg-sky-950    dark:text-sky-400    dark:border-sky-800",
    EDGE: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800",
};

function getBrowserBadge(browser: string) {
    return BROWSER_BADGE[browser.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
}

function DeviceIcon({ type }: { type: string }) {
    const cls = "w-4 h-4 text-muted-foreground";
    const t = type.toUpperCase();
    if (t === "MOBILE") return <Smartphone className={cls} />;
    if (t === "TABLET") return <Tablet className={cls} />;
    return <Monitor className={cls} />;
}

function formatDateTime(value: Date | string): string {
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
        timeZone: "Asia/Dubai",
    });
}

function timeAgo(value: Date | string): string {
    const ms = Date.now() - new Date(value).getTime();
    const mins = Math.floor(ms / 60_000);
    const hours = Math.floor(ms / 3_600_000);
    const days = Math.floor(ms / 86_400_000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function buildSessionDetails(session: ActiveSession): ConfirmDialogDetail[] {
    return [
        { label: "Session ID", value: session.loginSessionId },
        { label: "Device", value: `${session.deviceType.charAt(0).toUpperCase()}${session.deviceType.slice(1).toLowerCase()} · ${session.browserName.toUpperCase()}` },
    ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionsTab({
    sessions,
    loading,
    error,
    onTerminate,
    onTerminateAll,
    onRetry,
}: SessionsTabProps) {
    // Single session terminate dialog
    const [terminateTarget, setTerminateTarget] = useState<ActiveSession | null>(null);
    // Terminate all dialog
    const [terminateAllOpen, setTerminateAllOpen] = useState(false);

    const otherCount = sessions.filter((s) => !s.isCurrentSession).length;

    // ── Column definitions ────────────────────────────────────────────────────
    const columns: ColumnDef<ActiveSession>[] = [
        {
            key: "device",
            label: "Device / Browser",
            sortable: false,
            searchable: (row) => `${row.deviceType} ${row.browserName} ${row.loginSessionId}`,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <DeviceIcon type={row.deviceType} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground capitalize">
                                {row.deviceType.toLowerCase()}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getBrowserBadge(row.browserName)}`}>
                                {row.browserName.toUpperCase()}
                            </span>
                        </div>
                        {/* Full session ID — no truncation */}
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {row.loginSessionId}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "ipAddress",
            label: "IP Address",
            searchable: true,
            render: (value) => (
                <span className="text-sm text-muted-foreground font-mono">{String(value)}</span>
            ),
        },
        {
            key: "createdAt",
            label: "Signed In",
            accessor: (row) => new Date(row.createdAt).getTime(),
            render: (_, row) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {formatDateTime(row.createdAt)}
                </div>
            ),
        },
        {
            key: "lastActivityAt",
            label: "Last Active",
            accessor: (row) => new Date(row.lastActivityAt).getTime(),
            render: (_, row) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {timeAgo(row.lastActivityAt)}
                </div>
            ),
        },
        {
            key: "expiresAt",
            label: "Expires",
            accessor: (row) => new Date(row.expiresAt).getTime(),
            render: (_, row) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateTime(row.expiresAt)}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: false,
            render: (_, row) =>
                row.isCurrentSession ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-accent border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Current
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                    </span>
                ),
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            // FIX: right-align only the cell, not the header label
            cellClassName: "text-right",
            render: (_, row) =>
                row.isCurrentSession ? (
                    <span className="text-xs text-muted-foreground italic">This device</span>
                ) : (
                    <button
                        onClick={() => setTerminateTarget(row)}
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Terminate
                    </button>
                ),
        },
    ];

    // ── Error state ───────────────────────────────────────────────────────────
    if (!loading && error) {
        return (
            <div className="bg-card text-card-foreground rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="w-8 h-8 text-destructive/60" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={onRetry}
                    className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try again
                </button>
            </div>
        );
    }

    return (
        <>
            <DataTable<ActiveSession>
                data={sessions}
                columns={columns}
                rowKey={(row) => row.loginSessionId}
                loading={loading}
                title="Active Sessions"
                description={
                    loading
                        ? undefined
                        : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} · ${otherCount} other device${otherCount !== 1 ? "s" : ""}`
                }
                actions={[
                    {
                        label: (
                            <>
                                <LogOut className="w-4 h-4" />
                                Terminate All Other Sessions
                            </>
                        ),
                        onClick: () => setTerminateAllOpen(true),
                        disabled: loading || otherCount === 0,
                        className: "text-destructive border border-destructive/30 hover:bg-destructive/10",
                    },
                ]}
                searchable
                searchPlaceholder="Search by device, browser or IP..."
                emptyMessage="No active sessions"
                emptyDescription="All other sessions have been terminated."
            />

            {/* Single session terminate confirmation */}
            <ConfirmDialog
                open={!!terminateTarget}
                onOpenChange={(open) => { if (!open) setTerminateTarget(null); }}
                title="Terminate Session"
                description="This will immediately sign out the device below. It cannot be undone."
                details={terminateTarget ? buildSessionDetails(terminateTarget) : []}
                confirmLabel="Terminate"
                cancelLabel="Cancel"
                intent="danger"
                onConfirm={() => {
                    if (terminateTarget) {
                        onTerminate(terminateTarget.loginSessionId);
                        setTerminateTarget(null);
                    }
                }}
            />

            {/* Terminate all confirmation */}
            <ConfirmDialog
                open={terminateAllOpen}
                onOpenChange={setTerminateAllOpen}
                title="Terminate All Other Sessions"
                description={`This will immediately sign out ${otherCount} other device${otherCount !== 1 ? "s" : ""}. Your current session will not be affected.`}
                confirmLabel={`Terminate ${otherCount} Session${otherCount !== 1 ? "s" : ""}`}
                cancelLabel="Cancel"
                intent="danger"
                onConfirm={() => {
                    onTerminateAll();
                    setTerminateAllOpen(false);
                }}
            />
        </>
    );
}