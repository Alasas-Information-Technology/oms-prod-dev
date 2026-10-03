"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/DatePickerField";
import { format } from "date-fns";
import { toast } from "sonner";
import { ICreateFiscalYearDto, FiscalYearStatus } from "@/lib/types/budget-master.types";
import { CalendarRange, Loader2 } from "lucide-react";

interface AddFiscalYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ICreateFiscalYearDto) => Promise<void> | void;
}

export function AddFiscalYearDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddFiscalYearDialogProps) {
  const [code, setCode] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [status, setStatus] = React.useState<FiscalYearStatus>("OPEN");
  const [oracleBudgetName, setOracleBudgetName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setCode("");
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus("OPEN");
      setOracleBudgetName("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.error("Fiscal year code is required.");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required.");
      return;
    }

    if (!endDate) {
      toast.error("End date is required.");
      return;
    }

    if (startDate > endDate) {
      toast.error("End date must be greater than or equal to start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        code: trimmedCode,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        status,
        oracle_budget_name: oracleBudgetName.trim(),
      });
      toast.success(`Fiscal year ${trimmedCode} created successfully.`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create fiscal year.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <CalendarRange className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add Fiscal Year
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="fy-code" className="text-xs font-semibold text-foreground">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fy-code"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="h-9 text-sm"
            />
            <p className="text-[11.5px] text-muted-foreground">
              Unique fiscal identifier
            </p>
          </div>

          {/* Date range with Calendar popover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <DatePickerField
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                End Date <span className="text-destructive">*</span>
              </Label>
              <DatePickerField
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Status: DRAFT / OPEN / FROZEN / CLOSED */}
          <div className="space-y-1.5">
            <Label htmlFor="fy-status" className="text-xs font-semibold text-foreground">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="fy-status" className="h-9 text-sm cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT" className="cursor-pointer">
                  <span className="font-medium text-amber-600 dark:text-amber-400">DRAFT</span>
                </SelectItem>
                <SelectItem value="OPEN" className="cursor-pointer">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">OPEN</span>
                </SelectItem>
                <SelectItem value="FROZEN" className="cursor-pointer">
                  <span className="font-medium text-sky-600 dark:text-sky-400">FROZEN</span>
                </SelectItem>
                <SelectItem value="CLOSED" className="cursor-pointer">
                  <span className="font-medium text-muted-foreground">CLOSED</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Oracle Budget Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fy-oracle" className="text-xs font-semibold text-foreground">
              Oracle Budget Name
            </Label>
            <Input
              id="fy-oracle"
              placeholder="Enter budget name"
              value={oracleBudgetName}
              onChange={(e) => setOracleBudgetName(e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm font-mono text-xs"
            />
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="h-9 text-sm font-semibold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Fiscal Year"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
