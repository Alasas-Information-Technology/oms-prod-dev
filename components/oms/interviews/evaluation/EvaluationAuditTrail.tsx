"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  Send,
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  User,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { EvaluationAuditEvent } from "@/src/types/interview-evaluation";
import { cn } from "@/lib/utils";

interface EvaluationAuditTrailProps {
  auditTrail: EvaluationAuditEvent[];
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Maps audit event types to visual indicator icons
 */
function getAuditEventIcon(event: string) {
  switch (event) {
    case "PROMPT_SENT":
      return <Send className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />;
    case "DUE_DATE_SET":
      return <Calendar className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />;
    case "INTERVIEW_CONFIRMED":
      return (
        <CheckCircle2
          className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
          aria-hidden="true"
        />
      );
    case "DRAFT_SAVED":
      return <FileText className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
    case "SUBMITTED":
      return <Lock className="size-3.5 text-primary shrink-0" aria-hidden="true" />;
    default:
      return <History className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  }
}

/**
 * Format audit timestamp safely in plain language: "12 Aug 2026, 07:45"
 */
function formatAuditTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (!isValid(d)) return isoString;
    return format(d, "d MMM yyyy, HH:mm");
  } catch {
    return isoString;
  }
}

/**
 * Collapsible Audit Trail Panel (TASK 1 / Sections 1.8, 3.7)
 *
 * - Collapsible panel at the bottom of the page, closed by default.
 * - Labelled "Audit trail (4 entries)" (or count of entries).
 * - Each entry displays: icon, plain-language label, timestamp, and optional actor.
 * - Avoids full third column waste from the reference layout.
 */
export function EvaluationAuditTrail({
  auditTrail,
  defaultOpen = false,
  className,
}: EvaluationAuditTrailProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!auditTrail || auditTrail.length === 0) {
    return null;
  }

  const panelId = "evaluation-audit-trail-content";
  const buttonId = "evaluation-audit-trail-trigger";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-2xs transition-colors overflow-hidden",
        className
      )}
    >
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" aria-hidden="true" />
          <span className="text-foreground font-medium">
            Audit trail ({auditTrail.length} {auditTrail.length === 1 ? "entry" : "entries"})
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[11px] font-normal">{isOpen ? "Hide history" : "Show history"}</span>
          {isOpen ? (
            <ChevronUp className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-5 pb-4 pt-2 border-t border-border/60 divide-y divide-border/40 text-xs animate-in fade-in-50 duration-200"
        >
          {auditTrail.map((entry, index) => (
            <div
              key={`${entry.event}-${index}`}
              className="py-2.5 flex items-center justify-between gap-4 first:pt-1 last:pb-1"
            >
              {/* Left: Icon, plain-language label & actor */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-6 rounded-full bg-muted/70 flex items-center justify-center shrink-0">
                  {getAuditEventIcon(entry.event)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-medium text-foreground truncate">{entry.label}</p>
                  {entry.actor && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <User className="size-2.5" aria-hidden="true" />
                      <span>{entry.actor}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Timestamp in plain language format */}
              <time
                dateTime={entry.at}
                className="text-[11px] font-mono text-muted-foreground shrink-0 tabular-nums"
              >
                {formatAuditTimestamp(entry.at)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
