"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  Info,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageBarActions,
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { LeaveBalanceCards } from "./LeaveBalanceCards";
import { LeaveCalendarPanel } from "./LeaveCalendarPanel";
import { LeaveHistory } from "./LeaveHistory";
import { LeaveRequestForm } from "./LeaveRequestForm";
import {
  DEFAULT_LEAVE_RANGE,
  LEAVE_BALANCES,
  LEAVE_ENTITLEMENT_RULES,
  LEAVE_HISTORY,
} from "./leave.mock-data";
import {
  LeaveBalance,
  LeaveRequestRecord,
  LeaveRequestSubmission,
} from "./leave.types";

const STORAGE_KEY = "oms-leave-test-data";

interface SavedLeaveData {
  balances: LeaveBalance[];
  requests: LeaveRequestRecord[];
}

function getNextRequestId(requests: LeaveRequestRecord[]) {
  const highestNumber = requests.reduce((highest, request) => {
    const value = Number(request.id.split("-").at(-1));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);

  return `LV-2026-${String(highestNumber + 1).padStart(4, "0")}`;
}

function updateBalanceAfterSubmission(
  balances: LeaveBalance[],
  submission: LeaveRequestSubmission,
) {
  return balances.map((balance) => {
    if (balance.id !== submission.typeId || balance.approvalOnly) {
      return balance;
    }

    return {
      ...balance,
      pending: (balance.pending ?? 0) + submission.duration,
      remaining: Math.max(
        0,
        (balance.remaining ?? 0) - submission.duration,
      ),
    };
  });
}

export function LeaveWorkspace() {
  const [balances, setBalances] = useState<LeaveBalance[]>(LEAVE_BALANCES);
  const [requests, setRequests] = useState<LeaveRequestRecord[]>(LEAVE_HISTORY);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    ...DEFAULT_LEAVE_RANGE,
  });
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as SavedLeaveData;

        if (Array.isArray(parsed.balances)) {
          setBalances(parsed.balances);
        }

        if (Array.isArray(parsed.requests)) {
          setRequests(
            parsed.requests.map((request) => ({
              ...request,
              startDate: new Date(request.startDate),
              endDate: new Date(request.endDate),
              requestedAt: new Date(request.requestedAt),
            })),
          );
        }
      }
    } catch (error) {
      console.error("Could not load saved leave test data:", error);
    }

    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;

    try {
      const data: SavedLeaveData = { balances, requests };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Could not save leave test data:", error);
    }
  }, [balances, requests, dataLoaded]);

  function handleSubmit(submission: LeaveRequestSubmission) {
    const selectedType = balances.find(
      (balance) => balance.id === submission.typeId,
    );

    const newRequest: LeaveRequestRecord = {
      id: getNextRequestId(requests),
      typeId: submission.typeId,
      typeLabel: selectedType?.label ?? "Leave",
      startDate: submission.startDate,
      endDate: submission.endDate,
      duration: submission.duration,
      paid: submission.typeId !== "unpaid",
      status: "pending",
      approver: "Omar Al Hashmi",
      requestedAt: new Date(),
      reason: submission.reason,
    };

    setRequests((current) => [newRequest, ...current]);
    setBalances((current) =>
      updateBalanceAfterSubmission(current, submission),
    );
    setRequestDialogOpen(false);

    toast.success("Leave request submitted", {
      description: `${newRequest.id} is awaiting reporting-manager approval.`,
    });
  }

  function handleWithdraw(requestId: string) {
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== "pending") return;

    setRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? { ...item, status: "withdrawn" }
          : item,
      ),
    );

    setBalances((current) =>
      current.map((balance) => {
        if (balance.id !== request.typeId || balance.approvalOnly) {
          return balance;
        }

        return {
          ...balance,
          pending: Math.max(
            0,
            (balance.pending ?? 0) - request.duration,
          ),
          remaining: (balance.remaining ?? 0) + request.duration,
        };
      }),
    );

    toast.success("Leave request withdrawn", {
      description: `${requestId} has been removed from the approval queue.`,
    });
  }

  return (
    <div className="min-h-full bg-background pb-16">
      <PageBarBreadcrumbs
        crumbs={[
          { label: "People & Self Service", href: "/app/leave" },
          { label: "Leave", isCurrent: true },
        ]}
      />

      <PageBarActions>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
                aria-label="View entitlement rules"
              >
                <ShieldCheck className="size-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 text-foreground shadow-lg"
            >
              <p className="text-sm font-semibold">Entitlement Rules</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Important policy reminders.
              </p>

              <ul className="mt-3 space-y-2.5">
                {LEAVE_ENTITLEMENT_RULES.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-start gap-2 text-xs leading-5 text-foreground-secondary"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-teal" />
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>

          <Button
            type="button"
            size="sm"
            className="h-9 gap-2"
            onClick={() => setRequestDialogOpen(true)}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Request Leave</span>
          </Button>
        </div>
      </PageBarActions>

      <main className="mx-auto w-full max-w-[1680px] space-y-5 px-4 pb-8 pt-5 sm:px-6">
        <header className="flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <CalendarCheck2 className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Leave
              </h1>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              View entitlement, request leave and track approvals.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Leave year: 01 Jan – 31 Dec 2026
          </p>
        </header>

        <LeaveBalanceCards balances={balances} />

        <div className="flex items-start gap-3 rounded-xl border border-info-border/40 bg-info-surface px-4 py-3 text-info-text">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs leading-5">
            Leave types and rules are configurable and may be paid or unpaid
            as indicated.
          </p>
        </div>

        <section className="min-w-0">
          <LeaveCalendarPanel
            range={selectedRange}
            requests={requests}
            onRangeChange={setSelectedRange}
          />
        </section>

        <section className="min-w-0">
          <LeaveHistory
            requests={requests}
            onWithdraw={handleWithdraw}
          />
        </section>

        <p className="text-center text-[11px] leading-5 text-muted-foreground">
          For privacy and confidentiality, only the employee and authorised
          HR or approving users can view leave details.
        </p>
      </main>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-xl sm:p-6">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>

          <LeaveRequestForm
            balances={balances}
            range={selectedRange}
            onRangeChange={setSelectedRange}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}