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
import { ICreateBudgetPeriodDto, BudgetMasterStatus } from "@/lib/types/budget-master.types";
import { CalendarClock, Loader2 } from "lucide-react";

interface FiscalYearOption {
  fiscal_year_id: string | number;
  code: string;
}

interface AddBudgetPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiscalYears?: FiscalYearOption[];
  onSubmit: (data: ICreateBudgetPeriodDto) => Promise<void> | void;
}

const DEFAULT_FISCAL_YEARS: FiscalYearOption[] = [
  { fiscal_year_id: "c8e1a720-3b95-4d64-9a82-1205fbc31a01", code: "FY 2026" },
  { fiscal_year_id: "b4f2c910-1e84-4c53-8b71-0194eab20b02", code: "FY 2025" },
  { fiscal_year_id: "a3d1b800-0d73-4b42-7a60-9083d9a10c03", code: "FY 2024" },
  { fiscal_year_id: "e5a3d030-2f96-4e65-ab93-2316acd42d04", code: "FY 2027" },
];

export function AddBudgetPeriodDialog({
  open,
  onOpenChange,
  fiscalYears = DEFAULT_FISCAL_YEARS,
  onSubmit,
}: AddBudgetPeriodDialogProps) {
  const [periodCode, setPeriodCode] = React.useState("");
  const [fiscalYearId, setFiscalYearId] = React.useState(
    fiscalYears[0]?.fiscal_year_id ? String(fiscalYears[0].fiscal_year_id) : ""
  );
  const [periodName, setPeriodName] = React.useState("");
  const [periodNum, setPeriodNum] = React.useState<number | "">(1);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [status, setStatus] = React.useState<BudgetMasterStatus>("OPEN");
  const [oraclePeriodName, setOraclePeriodName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setPeriodCode("");
      setFiscalYearId(fiscalYears[0]?.fiscal_year_id ? String(fiscalYears[0].fiscal_year_id) : "");
      setPeriodName("");
      setPeriodNum(1);
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus("OPEN");
      setOraclePeriodName("");
      setIsSubmitting(false);
    }
  }, [open, fiscalYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = periodCode.trim();
    if (!trimmedCode) {
      toast.error("Period code is required.");
      return;
    }

    if (!fiscalYearId) {
      toast.error("Please select a fiscal year.");
      return;
    }

    const trimmedName = periodName.trim();
    if (!trimmedName) {
      toast.error("Period name is required.");
      return;
    }

    if (periodNum === "" || Number(periodNum) < 1) {
      toast.error("Period number must be a positive integer.");
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
        period_code: trimmedCode,
        fiscal_year_id: fiscalYearId,
        period_name: trimmedName,
        period_num: Number(periodNum),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        status,
        oracle_period_name: oraclePeriodName.trim(),
      });
      toast.success(`Budget period ${trimmedCode} created successfully.`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create budget period.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add Budget Period
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Row 1: Period Code & Fiscal Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="bp-code" className="text-xs font-semibold text-foreground">
                Period Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bp-code"
                placeholder="Enter period code"
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bp-fy" className="text-xs font-semibold text-foreground">
                Fiscal Year <span className="text-destructive">*</span>
              </Label>
              <Select
                value={fiscalYearId}
                onValueChange={setFiscalYearId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="bp-fy" className="h-9 text-sm cursor-pointer">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem
                      key={String(fy.fiscal_year_id)}
                      value={String(fy.fiscal_year_id)}
                      className="cursor-pointer"
                    >
                      {fy.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Period Name & Period Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="bp-name" className="text-xs font-semibold text-foreground">
                Period Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bp-name"
                placeholder="Enter period name"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bp-num" className="text-xs font-semibold text-foreground">
                Period Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bp-num"
                type="number"
                min={1}
                placeholder="Enter period number"
                value={periodNum}
                onChange={(e) => setPeriodNum(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isSubmitting}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Row 3: Date range */}
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

          {/* Row 4: Status */}
          <div className="space-y-1.5">
            <Label htmlFor="bp-status" className="text-xs font-semibold text-foreground">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="bp-status" className="h-9 text-sm cursor-pointer">
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

          {/* Row 5: Oracle Period Name */}
          <div className="space-y-1.5">
            <Label htmlFor="bp-oracle" className="text-xs font-semibold text-foreground">
              Oracle Period Name
            </Label>
            <Input
              id="bp-oracle"
              placeholder="Enter Oracle period name"
              value={oraclePeriodName}
              onChange={(e) => setOraclePeriodName(e.target.value)}
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
                "Save Budget Period"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
