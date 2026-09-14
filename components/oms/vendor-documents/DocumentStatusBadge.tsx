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
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  UPLOADED: {
    label: "Uploaded",
    className: "bg-info-surface text-info-text border-info-border font-medium",
    icon: FileText,
  },
  SCAN_FAILED: {
    label: "Scan failed",
    className: "bg-danger-surface text-danger-text border-danger-border font-semibold",
    icon: XCircle,
  },
  UNDER_REVIEW: {
    label: "In review",
    className: "bg-accent-surface text-accent-text border-accent-border font-medium",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-success-surface text-success-text border-success-border font-semibold",
    icon: Check,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-danger-surface text-danger-text border-danger-border font-semibold",
    icon: XCircle,
  },
  PENDING_SIGNATURE: {
    label: "Pending signature",
    className: "bg-warning-surface text-warning-text border-warning-border font-medium",
    icon: PenTool,
  },
  MISSING: {
    label: "Missing",
    className: "bg-danger-surface text-danger-text border-danger-border font-semibold",
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
        "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full tracking-wide transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="size-3 shrink-0 stroke-[2.5]" />}
      <span>{config.label}</span>
    </Badge>
  );
}
