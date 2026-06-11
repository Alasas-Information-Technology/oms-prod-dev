"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfirmDialogDetail {
    label: string;
    value: React.ReactNode;
}

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    /** Dialog title */
    title: string;
    /** Supporting description shown below the title */
    description?: string;

    /**
     * Optional detail rows shown in a summary box.
     * Useful for showing "which item" is being acted on.
     */
    details?: ConfirmDialogDetail[];

    /** Confirm button label. Default: "Confirm" */
    confirmLabel?: string;
    /** Cancel button label. Default: "Cancel" */
    cancelLabel?: string;

    /**
     * Visual intent of the confirm button.
     * "danger"  → destructive red  (default for delete/terminate actions)
     * "primary" → primary brand color
     */
    intent?: "danger" | "primary";

    /** Called when the user clicks the confirm button */
    onConfirm: () => void;
    /** Called when the user clicks cancel or closes the dialog */
    onCancel?: () => void;

    /** Show a loading spinner on the confirm button */
    loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    details,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    intent = "danger",
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDialogProps) {
    function handleCancel() {
        onCancel?.();
        onOpenChange(false);
    }

    function handleConfirm() {
        onConfirm();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-foreground">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Detail rows */}
                {details && details.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/40 divide-y divide-border">
                        {details.map((detail, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-4">
                                <span className="text-xs font-medium text-muted-foreground shrink-0">
                                    {detail.label}
                                </span>
                                <span className="text-xs font-medium text-foreground text-right break-all">
                                    {detail.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="cursor-pointer inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            "cursor-pointer inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none",
                            intent === "danger"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {loading && (
                            <svg
                                className="w-3.5 h-3.5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}