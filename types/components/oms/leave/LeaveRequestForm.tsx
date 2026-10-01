"use client";

import { useMemo, useRef, useState } from "react";
import { eachDayOfInterval, isWeekend } from "date-fns";
import {
  CalendarRange,
  FileCheck2,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { DatePickerField } from "@/components/shared/DatePickerField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  LeaveBalance,
  LeaveRequestSubmission,
  LeaveTypeId,
} from "./leave.types";

interface LeaveRequestFormProps {
  balances: LeaveBalance[];
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onSubmit: (submission: LeaveRequestSubmission) => void;
}

function countWorkingDays(range: DateRange | undefined) {
  if (!range?.from) return 0;

  const to = range.to ?? range.from;
  if (to < range.from) return 0;

  return eachDayOfInterval({ start: range.from, end: to }).filter(
    (day) => !isWeekend(day),
  ).length;
}

export function LeaveRequestForm({
  balances,
  range,
  onRangeChange,
  onSubmit,
}: LeaveRequestFormProps) {
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [leaveType, setLeaveType] = useState<LeaveTypeId>("annual");
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [attachmentName, setAttachmentName] = useState<string>();
  const [attempted, setAttempted] = useState(false);

  const workingDays = useMemo(() => countWorkingDays(range), [range]);
  const duration = halfDay && workingDays === 1 ? 0.5 : workingDays;
  const selectedBalance = balances.find((balance) => balance.id === leaveType);

  const rangeError = attempted && (!range?.from || !range.to)
    ? "Select both the start and end date."
    : undefined;

  const reasonError = attempted && reason.trim().length < 5
    ? "Enter a short reason for the request."
    : undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (!range?.from || !range.to || duration <= 0 || reason.trim().length < 5) {
      return;
    }

    onSubmit({
      typeId: leaveType,
      startDate: range.from,
      endDate: range.to,
      duration,
      halfDay,
      reason: reason.trim(),
      attachmentName,
    });

    setReason("");
    setAttachmentName(undefined);
    setHalfDay(false);
    setAttempted(false);
  }

  return (
    <Card
      id="leave-request-form"
      className="h-full gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:translate-y-0"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarRange className="size-4" />
        </span>

        <div>
          <h2 className="text-sm font-semibold text-foreground">New Leave Request</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete the details and submit for approval.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="leave-type" className="text-xs">Leave type</Label>
          <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveTypeId)}>
            <SelectTrigger id="leave-type" className="h-9">
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {balances.map((balance) => (
                <SelectItem key={balance.id} value={balance.id}>
                  {balance.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-[11px] text-muted-foreground">
            {selectedBalance?.approvalOnly
              ? "This leave type is available by approval."
              : `${selectedBalance?.remaining ?? 0} day(s) currently available.`}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DatePickerField
            label="Start date"
            value={range?.from}
            onChange={(from) => {
              if (!from) {
                onRangeChange(undefined);
                return;
              }

              const existingTo = range?.to;
              onRangeChange({
                from,
                to: existingTo && existingTo >= from ? existingTo : from,
              });
            }}
          />

          <DatePickerField
            label="End date"
            value={range?.to}
            onChange={(to) => {
              if (!range?.from || !to) return;
              onRangeChange({ from: range.from, to });
            }}
          />
        </div>

        {rangeError && <p className="text-xs text-destructive">{rangeError}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
          <div>
            <p className="text-xs font-medium text-foreground">Duration</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Weekends are excluded.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="half-day"
                checked={halfDay}
                disabled={workingDays !== 1}
                onCheckedChange={setHalfDay}
              />
              <Label htmlFor="half-day" className="cursor-pointer text-xs">Half day</Label>
            </div>

            <span className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-sm font-semibold text-primary">
              {duration} {duration === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="leave-reason" className="text-xs">Reason</Label>
          <Textarea
            id="leave-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Briefly explain the reason for your leave..."
            rows={3}
            className="resize-none text-sm"
          />
          {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs">Supporting attachment</Label>
            <span className="text-[10px] text-muted-foreground">Optional</span>
          </div>

          <input
            ref={attachmentInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(event) => setAttachmentName(event.target.files?.[0]?.name)}
          />

          {attachmentName ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/25 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileCheck2 className="size-4 shrink-0 text-emerald-600" />
                <span className="truncate text-xs text-foreground">{attachmentName}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => setAttachmentName(undefined)}
              >
                <X className="size-3.5" />
                <span className="sr-only">Remove attachment</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 border-dashed"
              onClick={() => attachmentInputRef.current?.click()}
            >
              <Paperclip className="size-4" />
              Upload file
            </Button>
          )}
        </div>

        <Button type="submit" className="w-full gap-2">
          <Send className="size-4" />
          Submit Request
        </Button>
      </form>
    </Card>
  );
}
