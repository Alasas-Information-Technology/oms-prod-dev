"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  History,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  ClarificationThreadEntry,
} from "@/types/clarification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ClarificationThreadProps {
  entries?: ClarificationThreadEntry[];
  /** Alias for entries for backwards compatibility */
  thread?: ClarificationThreadEntry[];
  expandable?: boolean;
  latestExpanded?: boolean;
  cycleNumber?: number;
  className?: string;
}

/**
 * Maps technical action codes to friendly plain-language descriptions
 */
function getActionPlainLanguage(action: string, isCurrentUser: boolean): string {
  switch (action) {
    case "CLARIFICATION_REQUESTED":
      return "asked for more information";
    case "RESPONSE_SUBMITTED":
      return isCurrentUser ? "you responded" : "responded to clarification";
    case "SUBMITTED":
      return "submitted the requisition";
    case "DRAFT_SAVED":
      return "saved a draft response";
    case "APPROVAL_RESTARTED":
      return "restarted approval chain";
    default:
      return action.toLowerCase().replace(/_/g, " ");
  }
}

/**
 * Format bytes to readable size
 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ClarificationThread({
  entries,
  thread,
  expandable = true,
  latestExpanded = true,
  cycleNumber,
  className,
}: ClarificationThreadProps) {
  const items = entries || thread || [];
  const [earlierExpanded, setEarlierExpanded] = React.useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  // Sort thread chronologically
  const sortedThread = [...items].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  // Latest entry is the last one
  const latestEntry = sortedThread[sortedThread.length - 1];
  const earlierEntries = sortedThread.slice(0, sortedThread.length - 1);

  const renderThreadEntry = (entry: ClarificationThreadEntry, isLatest = false) => {
    const formattedDate = entry.at
      ? format(new Date(entry.at), "d MMM yyyy, HH:mm")
      : "";
    const isRequestor = entry.actor.role?.toLowerCase().includes("requestor");
    const plainAction = getActionPlainLanguage(entry.action, Boolean(isRequestor));

    const initials = entry.actor.name
      ? entry.actor.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "OM";

    return (
      <div
        key={entry.id}
        className={cn(
          "p-4 sm:p-5 rounded-lg border transition-all space-y-3",
          isLatest
            ? "bg-card border-border/70 shadow-2xs"
            : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/30"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 border border-border/60">
              {entry.actor.avatarUrl && (
                <AvatarImage src={entry.actor.avatarUrl} alt={entry.actor.name} />
              )}
              <AvatarFallback className="text-[10px] font-semibold bg-muted text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-foreground truncate">
                {entry.actor.name}
              </span>
              {entry.actor.role && (
                <span className="text-[11px] text-muted-foreground">
                  ({entry.actor.role})
                </span>
              )}
              <span className="text-muted-foreground/60 font-normal">
                {plainAction}
              </span>
            </div>
          </div>

          {formattedDate && (
            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
              {formattedDate}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-9">
          {entry.message}
        </p>

        {entry.attachments && entry.attachments.length > 0 && (
          <div className="pl-9 pt-1 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {entry.attachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/60 bg-muted/40 text-xs text-foreground"
                >
                  <Paperclip className="size-3 text-muted-foreground" />
                  <span className="truncate max-w-[180px] font-medium">{att.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({formatBytes(att.sizeBytes)})
                  </span>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header and Cycle Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Message history
          </span>
        </div>

        {cycleNumber !== undefined && cycleNumber >= 2 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
            <Info className="size-3 text-muted-foreground/70" />
            <span>Cycle {cycleNumber} · No limit on clarification cycles</span>
          </span>
        )}
      </div>

      {/* Earlier Messages Collapsible Section */}
      {expandable && earlierEntries.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEarlierExpanded((prev) => !prev)}
            className="w-full h-8 flex items-center justify-between px-3 text-xs font-medium text-muted-foreground bg-muted/30 border border-border/40 hover:bg-muted/60"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="size-3.5" />
              <span>Earlier messages ({earlierEntries.length})</span>
            </span>
            {earlierExpanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </Button>

          {earlierExpanded && (
            <div className="space-y-2.5 pl-2 border-l-2 border-border/60 ml-2 animate-in fade-in-50 duration-200">
              {earlierEntries.map((entry) => renderThreadEntry(entry, false))}
            </div>
          )}
        </div>
      )}

      {/* Non-expandable view: show all earlier entries if expandable is false */}
      {!expandable && earlierEntries.length > 0 && (
        <div className="space-y-2.5">
          {earlierEntries.map((entry) => renderThreadEntry(entry, false))}
        </div>
      )}

      {/* Latest Entry Expanded by Default */}
      {latestExpanded && latestEntry && renderThreadEntry(latestEntry, true)}
    </div>
  );
}
