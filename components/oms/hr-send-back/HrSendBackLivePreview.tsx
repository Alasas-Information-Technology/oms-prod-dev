"use client";

import * as React from "react";
import { ListChecks, Sliders } from "lucide-react";
import {
  HrSendBackAsk,
  HrSelectableField,
  ClarificationAttachment,
} from "@/src/types/hr-send-back";
import { AskList } from "@/components/oms/clarification/AskList";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { useDebounce } from "@/hooks/useDebounce";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface HrSendBackLivePreviewProps {
  asks: HrSendBackAsk[];
  editableFieldKeys: string[];
  allFields: HrSelectableField[];
  message: string;
  attachments: ClarificationAttachment[];
  requesterName: string;
  className?: string;
}

export function HrSendBackLivePreview({
  asks,
  editableFieldKeys,
  allFields,
  message,
  attachments,
  requesterName,
  className,
}: HrSendBackLivePreviewProps) {
  // Update live as asks, fields, message, and attachments change, debounced 300ms per Part 4.4
  const debouncedAsks = useDebounce(asks, 300);
  const debouncedFieldKeys = useDebounce(editableFieldKeys, 300);
  const debouncedMessage = useDebounce(message, 300);
  const debouncedAttachments = useDebounce(attachments, 300);

  const selectedFieldObjects = React.useMemo(() => {
    return allFields.filter((f) => debouncedFieldKeys.includes(f.key));
  }, [allFields, debouncedFieldKeys]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. Requester's checklist panel using AskList in READ mode with nothing ticked */}
      {debouncedAsks.length > 0 ? (
        <AskList
          mode="read"
          title="What she will see"
          asks={debouncedAsks}
          asksAddressed={[]}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                What she will see
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted border border-border/60">
              0 items
            </span>
          </div>
          <div className="p-4 sm:p-5 text-xs text-muted-foreground italic leading-relaxed">
            No specific checklist items specified. {requesterName} will see only your message and the unlocked fields below.
          </div>
        </div>
      )}

      {/* 2. Message preview beneath the checklist as it will appear to her */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Header with HR Author details matching ClarificationMessagePanel */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-muted/40 border-b border-border/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-primary/10 text-primary border border-border/80 flex items-center justify-center font-semibold text-xs shrink-0">
              HR
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                You (HR Review)
              </p>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                HR Specialist · Message she will read
              </p>
            </div>
          </div>

          <span className="text-[10.5px] font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded border border-border/50 shrink-0">
            When sent
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {debouncedMessage.trim() ? (
            <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-normal">
              {debouncedMessage}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              (No message entered yet. A message is required to send back.)
            </p>
          )}

          {debouncedAttachments.length > 0 && (
            <div className="pt-3 border-t border-border/40">
              <AttachmentList
                attachments={debouncedAttachments}
                editable={false}
                title={`Attachments she will receive (${debouncedAttachments.length})`}
                scanningStates={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. List of fields she will be able to change */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Fields she can change
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
            {selectedFieldObjects.length} unlocked
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {selectedFieldObjects.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No fields unlocked. Request data will remain read-only.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedFieldObjects.map((field) => {
                const linkedAsk = debouncedAsks.find((a) => a.fieldKey === field.key);
                return (
                  <div
                    key={field.key}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                          {field.label}
                        </p>
                        {linkedAsk && (
                          <span className="text-[10px] text-primary font-medium bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded shrink-0">
                            Linked to checklist
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                        Current:{" "}
                        {field.type === "MONEY"
                          ? `AED ${formatAmount(field.currentValue)}`
                          : String(field.currentValue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {field.financialImpact && (
                        <span className="text-[10.5px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Financial
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                        {field.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
