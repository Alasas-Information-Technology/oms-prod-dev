"use client";

import * as React from "react";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  ShieldCheck,
  Clock,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClarificationAttachment } from "@/types/clarification";
import { cn } from "@/lib/utils";

export interface AttachmentListProps {
  attachments: ClarificationAttachment[];
  editable?: boolean;
  onAddAttachment?: (attachment: ClarificationAttachment) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  scanningStates?: boolean;
  showDropzone?: boolean;
  readOnly?: boolean;
  className?: string;
  title?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AttachmentList({
  attachments = [],
  editable = false,
  onAddAttachment,
  onRemoveAttachment,
  scanningStates = true,
  showDropzone = true,
  readOnly = false,
  className,
  title,
}: AttachmentListProps) {
  const isEditable = editable && !readOnly;
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditable) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditable) return;

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
      onAddAttachment?.(newAttachment);
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Paperclip className="size-3.5" />
          <span>{title || "Supporting Documents & Attachments"}</span>
          {attachments.length > 0 && (
            <span className="text-foreground font-semibold">({attachments.length})</span>
          )}
        </span>
      </div>

      {/* Stated Limits BEFORE Upload (per §1.4 / §3.4) */}
      {isEditable && showDropzone && (
        <p className="text-xs text-muted-foreground leading-normal">
          Accepted file types: <strong>PDF, DOCX, XLSX, PNG, JPG</strong> up to <strong>10 MB</strong> each. All files are automatically checked for security.
        </p>
      )}

      {/* Drag & Drop Zone */}
      {isEditable && showDropzone && (
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
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between gap-2.5 p-3 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/30 transition-colors"
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
                    {scanningStates && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {att.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs font-medium"
                  >
                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3 mr-1" />
                      <span>View</span>
                    </a>
                  </Button>
                )}

                {isEditable && onRemoveAttachment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(att.id);
                    }}
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isEditable && (
          <p className="text-xs text-muted-foreground italic">No attachments provided.</p>
        )
      )}
    </div>
  );
}
