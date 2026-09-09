"use client";

import * as React from "react";
import { DocumentStatus } from "@/src/types/vendor-documents";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  FileCheck2,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = {
  NOT_STARTED: {
    label: "Not started",
    className: "bg-muted text-muted-foreground border-border/70",
    icon: Clock,
  },
  UPLOADED: {
    label: "Uploaded",
    className:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 font-medium",
    icon: FileText,
  },
  SCAN_FAILED: {
    label: "Scan failed",
    className:
      "bg-destructive/10 text-destructive border-destructive/30 font-semibold",
    icon: XCircle,
  },
  UNDER_REVIEW: {
    label: "In review",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 font-medium",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold",
    icon: Check,
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-destructive/10 text-destructive border-destructive/30 font-semibold",
    icon: XCircle,
  },
  PENDING_SIGNATURE: {
    label: "Pending signature",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-medium",
    icon: PenTool,
  },
  MISSING: {
    label: "Missing",
    className:
      "bg-destructive/10 text-destructive border-destructive/30 font-semibold",
    icon: AlertTriangle,
  },
};

/**
 * Renders Part 3 Document Status Model badges with consistent semantic tokens
 */
export function DocumentStatusBadge({
  status,
  className,
  showIcon = true,
}: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono tracking-wide transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="size-3 shrink-0 stroke-[2.5]" />}
      <span>{config.label}</span>
    </Badge>
  );
}
