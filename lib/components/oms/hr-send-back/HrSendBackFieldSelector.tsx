"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sliders, Info, Link as LinkIcon } from "lucide-react";
import { HrSelectableField, HrSendBackAsk } from "@/src/types/hr-send-back";
import { cn } from "@/lib/utils";

interface HrSendBackFieldSelectorProps {
  fields: HrSelectableField[];
  selectedKeys: string[];
  onChangeSelectedKeys: (keys: string[]) => void;
  onUnlinkField?: (fieldKey: string) => void;
  asks?: HrSendBackAsk[];
  className?: string;
}

export function HrSendBackFieldSelector({
  fields,
  selectedKeys,
  onChangeSelectedKeys,
  onUnlinkField,
  asks = [],
  className,
}: HrSendBackFieldSelectorProps) {
  // Filter out fields with selectable: false (ABSENT, not disabled)
  const activeFields = React.useMemo(() => {
    return (fields || []).filter((f) => f.selectable !== false);
  }, [fields]);

  // Mapping of field keys that are linked to one or more asks
  const fieldToAskMap = React.useMemo(() => {
    const map: Record<string, { askIndex: number; askText: string }[]> = {};
    asks.forEach((ask, index) => {
      if (ask.fieldKey) {
        if (!map[ask.fieldKey]) {
          map[ask.fieldKey] = [];
        }
        map[ask.fieldKey].push({
          askIndex: index + 1,
          askText: ask.text,
        });
      }
    });
    return map;
  }, [asks]);

  // Ensure fields linked to an ask are automatically selected
  React.useEffect(() => {
    const linkedKeys = Object.keys(fieldToAskMap);
    const missingKeys = linkedKeys.filter((k) => !selectedKeys.includes(k));
    if (missingKeys.length > 0) {
      onChangeSelectedKeys([...selectedKeys, ...missingKeys]);
    }
  }, [fieldToAskMap, selectedKeys, onChangeSelectedKeys]);

  // State for unlinking confirmation warning
  const [unlinkingField, setUnlinkingField] = React.useState<{
    fieldKey: string;
    fieldLabel: string;
    linkedAsks: { askIndex: number; askText: string }[];
  } | null>(null);

  const handleToggle = (key: string, checked: boolean) => {
    if (checked) {
      if (!selectedKeys.includes(key)) {
        onChangeSelectedKeys([...selectedKeys, key]);
      }
    } else {
      const linked = fieldToAskMap[key];
      if (linked && linked.length > 0) {
        const fieldObj = activeFields.find((f) => f.key === key);
        setUnlinkingField({
          fieldKey: key,
          fieldLabel: fieldObj?.label || key,
          linkedAsks: linked,
        });
        return;
      }
      onChangeSelectedKeys(selectedKeys.filter((k) => k !== key));
    }
  };

  const handleConfirmUnlinkAndUncheck = () => {
    if (!unlinkingField) return;
    const { fieldKey } = unlinkingField;
    // Uncheck
    onChangeSelectedKeys(selectedKeys.filter((k) => k !== fieldKey));
    // Unlink asks
    onUnlinkField?.(fieldKey);
    setUnlinkingField(null);
  };

  // If fewer than three fields are selectable, explain why
  const isShortList = activeFields.length < 3;

  return (
    <>
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-4",
          className
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Fields she can change
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
            {selectedKeys.length} of {activeFields.length} selected
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            Checked fields will appear as inline editors on her response page.
            Selecting nothing is valid if she only needs to answer questions without altering data.
          </p>

          <div className="space-y-2 pt-1">
            {activeFields.map((field) => {
              const isChecked = selectedKeys.includes(field.key);
              const linkedAsks = fieldToAskMap[field.key];
              const hasLinkedAsk = Boolean(linkedAsks && linkedAsks.length > 0);

              return (
                <div
                  key={field.key}
                  className={cn(
                    "p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                    isChecked
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/70 bg-background hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <Checkbox
                      id={`field-${field.key}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleToggle(field.key, Boolean(checked))
                      }
                      className="mt-0.5 sm:mt-0"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <label
                        htmlFor={`field-${field.key}`}
                        className="text-xs font-semibold text-foreground cursor-pointer block truncate"
                      >
                        {field.label}
                      </label>

                      {hasLinkedAsk && (
                        <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                          <LinkIcon className="size-3" />
                          <span>
                            linked to ask {linkedAsks.map((a) => a.askIndex).join(", ")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FINANCIAL FIELDS show warning BESIDE checkbox BEFORE selection */}
                  {field.financialImpact && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>
                        {field.warning ||
                          "Letting her change this could start a budget amendment."}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Short List Explanatory Note (if fewer than three selectable fields) */}
          {isShortList && (
            <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
              <Info className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span>
                Other fields are locked at this stage of review.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Confirmation Dialog before unchecking a linked field */}
      <Dialog
        open={Boolean(unlinkingField)}
        onOpenChange={(open) => !open && setUnlinkingField(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Unlink and Lock Field?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {unlinkingField && (
                <>
                  <strong className="text-foreground">{unlinkingField.fieldLabel}</strong> is
                  currently linked to{" "}
                  {unlinkingField.linkedAsks.length === 1 ? (
                    <>Ask {unlinkingField.linkedAsks[0].askIndex} (<em>&quot;{unlinkingField.linkedAsks[0].askText}&quot;</em>)</>
                  ) : (
                    <>Asks {unlinkingField.linkedAsks.map((a) => a.askIndex).join(", ")}</>
                  )}
                  . Unchecking this field will also unlink the ask so the requester will not be able to edit it.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setUnlinkingField(null)}
              className="text-xs"
            >
              Keep field unlocked
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmUnlinkAndUncheck}
              className="text-xs"
            >
              Unlink and lock field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
