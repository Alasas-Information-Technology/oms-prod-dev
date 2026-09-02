"use client";

import * as React from "react";
import {
  MessageSquareText,
  Paperclip,
  Upload,
  X,
  FileText,
  ShieldCheck,
  Clock,
  ShieldAlert,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClarificationAttachment } from "@/types/clarification";
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

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [message]);

  const charCount = message.length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const newAttachment: ClarificationAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        sizeBytes: file.size,
        scanStatus: "VERIFIED",
      };
      onAddAttachment(newAttachment);
    });
  };

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

        {/* Attachments Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="size-3.5" />
              <span>Supporting Documents & Attachments</span>
              {attachments.length > 0 && (
                <span className="text-foreground font-semibold">({attachments.length})</span>
              )}
            </span>
          </div>

          {/* Stated Limits BEFORE Upload */}
          <p className="text-xs text-muted-foreground leading-normal">
            Accepted file types: <strong>PDF, DOCX, XLSX, PNG, JPG</strong> up to <strong>10 MB</strong> each. All files are automatically checked for security.
          </p>

          {/* Drag & Drop Zone */}
          {!readOnly && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-5 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center",
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-muted/15"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="size-4.5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  <span className="text-primary hover:underline">Click to upload files</span> or drag and drop here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Attach any project plans, justifications, or signed memos
                </p>
              </div>
            </div>
          )}

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-2.5 p-3 rounded-lg border border-border/70 bg-muted/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate" title={att.name}>
                        {att.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatBytes(att.sizeBytes)}</span>
                        <span>·</span>
                        {att.scanStatus === "VERIFIED" && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="size-3" /> Clean
                          </span>
                        )}
                        {att.scanStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="size-3" /> Scanning...
                          </span>
                        )}
                        {att.scanStatus === "FAILED" && (
                          <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-medium">
                            <ShieldAlert className="size-3" /> Threat Detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAttachment(att.id);
                      }}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
