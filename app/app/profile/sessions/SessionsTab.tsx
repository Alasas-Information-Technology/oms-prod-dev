"use client";

import { Icon } from "@iconify/react";
import { ActiveSession } from "@/lib/types/session.types";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { useConfirm } from "@/hooks/use-confirm";

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
    const t = type.toUpperCase();
    if (t === "MOBILE") return <Icon icon="mdi:cellphone" className="w-4 h-4 text-muted-foreground" />;
    if (t === "TABLET") return <Icon icon="mdi:tablet" className="w-4 h-4 text-muted-foreground" />;
    return <Icon icon="mdi:monitor" className="w-4 h-4 text-muted-foreground" />;
}

function formatDateTime(value: unknown): string {
    return new Date(value as string | number | Date).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
        timeZone: "Asia/Dubai",
    });
}

function timeAgo(value: unknown): string {
    const ms = Date.now() - new Date(value as string | number | Date).getTime();
    const mins = Math.floor(ms / 60_000);
    const hours = Math.floor(ms / 3_600_000);
    const days = Math.floor(ms / 86_400_000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

// DataTable requires T extends Record<string, unknown>
type SessionRow = ActiveSession & Record<string, unknown>;

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionsTab({
    sessions,
    loading,
    error,
    onTerminate,
    onTerminateAll,
    onRetry,
}: SessionsTabProps) {
    const confirm = useConfirm();

    const otherCount = sessions.filter((s) => !s.isCurrentSession).length;

    // ── Column definitions ────────────────────────────────────────────────────
    const columns: ColumnDef<SessionRow>[] = [
        {
            key: "device",
            header: "Device / Browser",
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <DeviceIcon type={String(row.deviceType ?? "")} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground capitalize">
                                {String(row.deviceType ?? "").toLowerCase()}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getBrowserBadge(String(row.browserName ?? ""))}`}>
                                {String(row.browserName ?? "").toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {String(row.loginSessionId ?? "")}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "ipAddress",
            header: "IP Address",
            sortable: true,
            render: (value) => (
                <span className="text-sm text-muted-foreground font-mono">{String(value ?? "")}</span>
            ),
        },
        {
            key: "createdAt",
            header: "Signed In",
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="mdi:calendar-outline" className="w-3.5 h-3.5 shrink-0" />
                    {formatDateTime(value)}
                </div>
            ),
        },
        {
            key: "lastActivityAt",
            header: "Last Active",
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5 shrink-0" />
                    {timeAgo(value)}
                </div>
            ),
        },
        {
            key: "expiresAt",
            header: "Expires",
            sortable: true,
            render: (value) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateTime(value)}
                </span>
            ),
        },
        {
            key: "isCurrentSession",
            header: "Status",
            sortable: false,
            render: (value) =>
                value ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-accent border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Idle
                    </span>
                ),
        },
    ];

    // ── Row actions ───────────────────────────────────────────────────────────
    const rowActions: RowAction<SessionRow>[] = [
        {
            label: "Terminate",
            icon: <Icon icon="mdi:trash-can-outline" width={14} height={14} />,
            variant: "destructive",
            onClick: (row) => {
                // Skip current session
                if (row.isCurrentSession) return;

                // confirm() returns a () => void — call it immediately to open the dialog
                confirm(
                    {
                        title: "Terminate Session",
                        description: `Sign out ${String(row.deviceType ?? "").toLowerCase()} · ${String(row.browserName ?? "").toUpperCase()} (${String(row.loginSessionId ?? "")})? This cannot be undone.`,
                        confirmLabel: "Terminate",
                        cancelLabel: "Cancel",
                        variant: "destructive",
                    },
                    () => onTerminate(String(row.loginSessionId)),
                )(); // <-- immediately invoke the returned () => void
            },
        },
    ];

    // ── Error state ───────────────────────────────────────────────────────────
    if (!loading && error) {
        return (
            <div className="bg-card text-card-foreground rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
                <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 text-destructive/60" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={onRetry}
                    className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <Icon icon="mdi:refresh" className="w-3.5 h-3.5" />
                    Try again
                </button>
            </div>
        );
    }

    // Build per-row actions so the confirm closure captures the correct row
    function buildRowActions(row: SessionRow): RowAction<SessionRow>[] {
        if (row.isCurrentSession) return [];

        return [
            {
                label: "Terminate",
                icon: <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />,
                variant: "destructive",
                onClick: confirm(
                    {
                        title: "Terminate Session",
                        description: `Sign out ${String(row.deviceType ?? "").toLowerCase()} · ${String(row.browserName ?? "").toUpperCase()} (${String(row.loginSessionId ?? "")})? This cannot be undone.`,
                        confirmLabel: "Terminate",
                        cancelLabel: "Cancel",
                        variant: "destructive",
                    },
                    () => onTerminate(String(row.loginSessionId)),
                ),
            },
        ];
    }

    const currentCount = sessions.filter(
        (session) => session.isCurrentSession === true
    ).length;

    const otherCountnew = sessions.length - currentCount;

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                        Active Sessions
                    </h3>
                    {!loading && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {currentCount} session{currentCount !== 1 ? "s" : ""} ·{" "}
                            {otherCountnew} other device{otherCountnew !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                <button
                    onClick={confirm(
                        {
                            title: "Terminate All Other Sessions",
                            description: `This will immediately sign out ${otherCount} other device${otherCount !== 1 ? "s" : ""}. Your current session will not be affected.`,
                            confirmLabel: `Terminate ${otherCount} Session${otherCount !== 1 ? "s" : ""}`,
                            cancelLabel: "Cancel",
                            variant: "destructive",
                        },
                        onTerminateAll,
                    )}
                    disabled={loading || otherCount === 0}
                    className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors text-destructive border border-destructive/30 hover:bg-destructive/10 disabled:opacity-40 disabled:pointer-events-none"
                >
                    <Icon icon="mdi:logout" className="w-4 h-4" />
                    Terminate All Other Sessions
                </button>
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <DataTable<SessionRow>
                columns={columns}
                data={sessions as SessionRow[]}
                keyField="loginSessionId"
                loading={loading}
                rowActions={rowActions}
                enableSearch
                globalFilterFields={["deviceType", "browserName", "ipAddress", "loginSessionId"]}
                emptyMessage="No active sessions"
                pageSizeOptions={[10, 25, 50]}
                pageSize={10}
            />
        </>
    );
}