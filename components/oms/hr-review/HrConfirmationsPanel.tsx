"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HrConfirmation } from "@/types/hr-review";
import { useHrReviewUpdateConfirmation } from "@/hooks/useHrReview";
import { toast } from "sonner";

interface HrConfirmationsPanelProps {
  confirmations: HrConfirmation[];
  requestId: string;
}

export function HrConfirmationsPanel({
  confirmations,
  requestId,
}: HrConfirmationsPanelProps) {
  const { mutate } = useHrReviewUpdateConfirmation();

  // Local state to track optimistic updates for checkboxes and notes
  const [localState, setLocalState] = useState(() =>
    confirmations.reduce((acc, conf) => {
      acc[conf.code] = {
        confirmed: conf.confirmed,
        note: conf.note || "",
      };
      return acc;
    }, {} as Record<string, { confirmed: boolean; note: string }>)
  );

  const handleToggle = (code: string, checked: boolean) => {
    const currentNote = localState[code].note;
    
    setLocalState((prev) => ({
      ...prev,
      [code]: { ...prev[code], confirmed: checked },
    }));

    mutate(
      {
        requestId,
        payload: { code, confirmed: checked, note: currentNote },
      },
      {
        onError: () => {
          toast.error("Failed to update", {
            description: "Could not save your confirmation state.",
          });
          // Revert optimistic update
          setLocalState((prev) => ({
            ...prev,
            [code]: { ...prev[code], confirmed: !checked },
          }));
        },
      }
    );
  };

  const handleNoteBlur = (code: string, newNote: string) => {
    const isConfirmed = localState[code].confirmed;
    mutate({
      requestId,
      payload: { code, confirmed: isConfirmed, note: newNote },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <UserCheck className="size-4 text-primary" />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          For you to confirm
        </h3>
      </div>

      <div className="space-y-3">
        {confirmations.map((conf) => {
          const state = localState[conf.code] || { confirmed: false, note: "" };
          
          return (
            <div key={conf.code} className="rounded-lg border border-border p-4 bg-card shadow-xs">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`conf-${conf.code}`}
                  checked={state.confirmed}
                  onCheckedChange={(checked) => handleToggle(conf.code, checked === true)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <Label 
                    htmlFor={`conf-${conf.code}`}
                    className="text-[13px] font-medium text-foreground cursor-pointer leading-tight block"
                  >
                    {conf.label}
                  </Label>
                  
                  {conf.context && conf.code === "EMIRATISATION" && (
                    <p className="mt-1 text-[12px] font-normal text-muted-foreground">
                      Currently {conf.context.current}{conf.context.unit === "PERCENT" ? "%" : ""} against a {conf.context.target}{conf.context.unit === "PERCENT" ? "%" : ""} target
                    </p>
                  )}

                  {state.confirmed && (
                    <div className="mt-3">
                      <Textarea
                        placeholder="Optional note..."
                        value={state.note}
                        onChange={(e) =>
                          setLocalState((prev) => ({
                            ...prev,
                            [conf.code]: { ...prev[conf.code], note: e.target.value },
                          }))
                        }
                        onBlur={(e) => handleNoteBlur(conf.code, e.target.value)}
                        className="h-20 text-[13px] font-normal resize-none bg-muted/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
