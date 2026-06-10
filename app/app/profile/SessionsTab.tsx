"use client";

import { LogOut, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Session } from "./profile.types";
import { SessionRow } from "./SessionRow";

interface SessionsTabProps {
    sessions: Session[];
    loading: boolean;
    error: string | null;
    onTerminate: (loginSessionId: string) => void;
    onTerminateAll: () => void;
    onRetry: () => void;
}

const TABLE_HEADERS = [
    "DEVICE / BROWSER",
    "IP ADDRESS",
    "SIGNED IN",
    "LAST ACTIVE",
    "EXPIRES",
    "STATUS",
    "",
];

export function SessionsTab({
    sessions,
    loading,
    error,
    onTerminate,
    onTerminateAll,
    onRetry,
}: SessionsTabProps) {
    const otherCount = sessions.filter((s) => !s.isCurrentSession).length;

    return (
        <div className="bg-card text-card-foreground rounded-xl border border-border px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
                    {!loading && !error && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {sessions.length} session{sessions.length !== 1 ? "s" : ""} · {otherCount} other device{otherCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                <button
                    onClick={onTerminateAll}
                    disabled={loading || otherCount === 0}
                    className="flex items-center gap-2 text-sm font-medium text-destructive border border-destructive/30 px-4 py-2 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                    <LogOut className="w-4 h-4" />
                    Terminate All Other Sessions
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading sessions...</span>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <AlertCircle className="w-8 h-8 text-destructive/60" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try again
                    </button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1.2fr_1.5fr_1.2fr_auto] gap-4 pb-3 border-b border-border">
                        {TABLE_HEADERS.map((h, i) => (
                            <span key={i} className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                                {h}
                            </span>
                        ))}
                    </div>
                    <div>
                        {sessions.map((session) => (
                            <SessionRow
                                key={session.loginSessionId}
                                session={session}
                                onTerminate={onTerminate}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}