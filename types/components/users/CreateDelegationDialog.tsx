"use client";

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
import { useCreateDelegation, useUsers } from "@/hooks/useAuthorization";
import { UserSummaryDto } from "@/lib/types/authorization.types";
import { addDays, differenceInDays, format } from "date-fns";
import { Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface CreateDelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromUserId: string;
  fromUserName?: string;
}

export function CreateDelegationDialog({
  open,
  onOpenChange,
  fromUserId,
  fromUserName,
}: CreateDelegationDialogProps) {
  const [toUserId, setToUserId] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = React.useState<string>(format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [reason, setReason] = React.useState<string>("");

  const { data: usersData } = useUsers({ page: 1, pageSize: 50, isActive: true, userType: "INTERNAL" });
  const userList: UserSummaryDto[] = Array.isArray(usersData)
    ? usersData
    : Array.isArray(usersData?.data)
      ? usersData.data
      : Array.isArray((usersData as any)?.items)
        ? (usersData as any).items
        : [];
  const eligibleDelegates = userList.filter((u) => u.userId !== fromUserId);

  const createMutation = useCreateDelegation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId) {
      toast.error("Please select a target delegate.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is mandatory for delegating authority.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error("End date must be after start date.");
      return;
    }

    const durationDays = differenceInDays(end, start);
    if (durationDays > 90) {
      toast.error("Delegation period cannot exceed 90 days (Rule D2).");
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId: fromUserId,
        dto: {
          toUserId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          reason: reason.trim(),
        },
      });

      toast.success("Delegation of authority created successfully.");
      onOpenChange(false);
      setToUserId("");
      setReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create delegation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Delegate Authority
          </DialogTitle>
          <DialogDescription>
            Temporarily transfer operational permissions from <strong>{fromUserName || "this user"}</strong> to another active internal employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Target Delegate Selection */}
          <div className="space-y-2">
            <Label htmlFor="delegate-select">Assign Authority To *</Label>
            <select
              id="delegate-select"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Choose an active internal employee...</option>
              {eligibleDelegates.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.profile?.displayName || u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">End Date (Max 90d) *</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

          {/* Mandatory Reason */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="del-reason">Delegation Reason *</Label>
              <span className="text-[11px] text-rose-500 font-semibold">Mandatory</span>
            </div>
            <Textarea
              id="del-reason"
              rows={3}
              placeholder="e.g. Annual leave coverage, acting department head delegation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !toUserId || !reason.trim()}
            >
              {createMutation.isPending ? "Delegating..." : "Create Delegation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
