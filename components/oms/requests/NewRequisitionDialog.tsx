"use client";

import * as React from "react";

import { FilePlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { NewRequestDraft } from "./request.types";

interface NewRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    draft: NewRequestDraft
  ) => void;
}

const INITIAL_FORM = {
  position: "",
  department: "",
  resources: "1",
  budget: "",
  justification: "",
};

export function NewRequisitionDialog({
  open,
  onOpenChange,
  onCreate,
}: NewRequisitionDialogProps) {
  const [form, setForm] =
    React.useState(INITIAL_FORM);

  const update = (
    key: keyof typeof INITIAL_FORM,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const canSave =
    form.position.trim().length > 0 &&
    form.department.trim().length > 0 &&
    Number(form.resources) > 0;

  const saveDraft = () => {
    if (!canSave) return;

    onCreate({
      position: form.position.trim(),
      department: form.department.trim(),
      resources: Number(form.resources),
      budget: Number(form.budget) || 0,
      justification:
        form.justification.trim(),
    });

    setForm(INITIAL_FORM);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            New requisition
          </DialogTitle>

          <DialogDescription>
            This creates a local mock draft.
            API submission can be connected
            later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-request-position">
              Position title
            </Label>

            <Input
              id="new-request-position"
              value={form.position}
              onChange={(event) =>
                update(
                  "position",
                  event.target.value
                )
              }
              placeholder="e.g. Senior Security Analyst"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-request-department">
              Department
            </Label>

            <Input
              id="new-request-department"
              value={form.department}
              onChange={(event) =>
                update(
                  "department",
                  event.target.value
                )
              }
              placeholder="Department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-request-resources">
              Resources
            </Label>

            <Input
              id="new-request-resources"
              type="number"
              min="1"
              value={form.resources}
              onChange={(event) =>
                update(
                  "resources",
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-request-budget">
              Estimated budget (AED)
            </Label>

            <Input
              id="new-request-budget"
              type="number"
              min="0"
              value={form.budget}
              onChange={(event) =>
                update(
                  "budget",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-request-justification">
              Business justification
            </Label>

            <Textarea
              id="new-request-justification"
              value={form.justification}
              onChange={(event) =>
                update(
                  "justification",
                  event.target.value
                )
              }
              placeholder="Explain why the resource is required"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            onClick={saveDraft}
            disabled={!canSave}
          >
            <FilePlus2 className="size-4" />
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}