"use client";

import * as React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { ClarificationDetail } from "@/types/clarification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { cn } from "@/lib/utils";

interface ClarificationMessagePanelProps {
  clarification: ClarificationDetail;
  className?: string;
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

        {/* Attachments list via extracted AttachmentList component */}
        {attachments && attachments.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <AttachmentList
              attachments={attachments}
              editable={false}
              title={`Attachments from HR (${attachments.length})`}
              scanningStates={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
