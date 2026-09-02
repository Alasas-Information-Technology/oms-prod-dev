"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  FileText,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Clock,
  ShieldAlert,
  User,
} from "lucide-react";
import { ClarificationDetail } from "@/types/clarification";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ClarificationMessagePanelProps {
  clarification: ClarificationDetail;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ClarificationMessagePanel({
  clarification,
  className,
}: ClarificationMessagePanelProps) {
  const { raisedBy, raisedAt, message, attachments } = clarification;

  const formattedDate = raisedAt
    ? format(new Date(raisedAt), "d MMM yyyy, HH:mm")
    : "";

  const initials = raisedBy.name
    ? raisedBy.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HR";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Header with HR Author details */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-muted/40 border-b border-border/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 border border-border/80 shadow-2xs">
            {raisedBy.avatarUrl && <AvatarImage src={raisedBy.avatarUrl} alt={raisedBy.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {raisedBy.name}
            </p>
            <p className="text-xs text-muted-foreground font-medium truncate">
              {raisedBy.role}
            </p>
          </div>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0 bg-background/80 px-2.5 py-1 rounded-md border border-border/50">
            <Clock className="size-3 text-muted-foreground/70" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Full Message Text */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-normal">
          {message}
        </div>

        {/* Attachments list with View action */}
        {attachments && attachments.length > 0 && (
          <div className="pt-4 border-t border-border/50 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="size-3.5" />
              <span>Attachments from HR ({attachments.length})</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate" title={att.name}>
                        {att.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatBytes(att.sizeBytes)}</span>
                        <span>·</span>
                        {att.scanStatus === "VERIFIED" && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="size-3" /> Clean
                          </span>
                        )}
                        {att.scanStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="size-3" /> Checking
                          </span>
                        )}
                        {att.scanStatus === "FAILED" && (
                          <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-medium">
                            <ShieldAlert className="size-3" /> Threat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {att.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 px-2.5 text-xs font-medium shrink-0"
                    >
                      <a href={att.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3 mr-1" />
                        <span>View</span>
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
