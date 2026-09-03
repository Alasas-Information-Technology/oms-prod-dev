"use client";

import * as React from "react";
import {
  MessageSquareText,
  Loader2,
  Check,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ClarificationAttachment } from "@/types/clarification";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { cn } from "@/lib/utils";

interface ClarificationResponseComposerProps {
  message: string;
  onChangeMessage: (message: string) => void;
  attachments: ClarificationAttachment[];
  onAddAttachment: (attachment: ClarificationAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  isSavingDraft?: boolean;
  lastSavedAt?: string | null;
  readOnly?: boolean;
  className?: string;
}

export function ClarificationResponseComposer({
  message,
  onChangeMessage,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  isSavingDraft = false,
  lastSavedAt,
  readOnly = false,
  className,
}: ClarificationResponseComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [message]);

  const charCount = message.length;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-4",
        className
      )}
    >
      {/* Header with quiet autosave indicator */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Your Response Message
          </span>
        </div>

        {/* Quiet Autosave Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {isSavingDraft ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Loader2 className="size-3 animate-spin" /> Saving draft...
            </span>
          ) : lastSavedAt ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-5 space-y-4">
        {/* Auto-growing Textarea (Min 6 rows) */}
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            id="clarification-response-message"
            disabled={readOnly}
            placeholder="Type your clarification response addressing each of HR's questions..."
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            className="min-h-[140px] resize-none text-sm leading-relaxed p-4 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs border-border/80 rounded-lg"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {charCount} character{charCount === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground/80 font-medium">
              Recommended: 50–1,000 characters for clarity
            </span>
          </div>
        </div>

        {/* Attachments Section extracted to AttachmentList */}
        <div className="pt-2">
          <AttachmentList
            attachments={attachments}
            editable={!readOnly}
            onAddAttachment={onAddAttachment}
            onRemoveAttachment={onRemoveAttachment}
            scanningStates={true}
          />
        </div>
      </div>
    </div>
  );
}

