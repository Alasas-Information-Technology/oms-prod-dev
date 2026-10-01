"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { LeaveRequestRecord } from "./leave.types";

interface LeaveCalendarPanelProps {
  range: DateRange | undefined;
  requests: LeaveRequestRecord[];
  onRangeChange: (range: DateRange | undefined) => void;
}

interface PublicHoliday {
  date: Date;
  name: string;
}

const UAE_HOLIDAYS_2026: PublicHoliday[] = [
  { date: new Date(2026, 0, 1), name: "New Year's Day" },

  { date: new Date(2026, 2, 19), name: "Eid Al Fitr" },
  { date: new Date(2026, 2, 20), name: "Eid Al Fitr" },
  { date: new Date(2026, 2, 21), name: "Eid Al Fitr" },

  { date: new Date(2026, 4, 26), name: "Arafat Day / Eid Al Adha" },
  { date: new Date(2026, 4, 27), name: "Eid Al Adha" },
  { date: new Date(2026, 4, 28), name: "Eid Al Adha" },
  { date: new Date(2026, 4, 29), name: "Eid Al Adha" },

  { date: new Date(2026, 11, 2), name: "UAE National Day" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getStatus(request: LeaveRequestRecord) {
  switch (request.status) {
    case "approved":
      return {
        label: "Approved",
        className: "bg-emerald-100 text-emerald-800",
      };

    case "pending":
      return {
        label: "In process",
        className: "bg-amber-100 text-amber-800",
      };

    case "rejected":
      return {
        label: "Denied",
        className: "bg-rose-100 text-rose-800",
      };

    case "withdrawn":
      return {
        label: "Withdrawn",
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function getRequestsForDate(
  requests: LeaveRequestRecord[],
  date: Date,
) {
  return requests.filter((request) =>
    isWithinInterval(date, {
      start: request.startDate,
      end: request.endDate,
    }),
  );
}

export function LeaveCalendarPanel({
  range,
  requests,
  onRangeChange,
}: LeaveCalendarPanelProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    range?.from ?? new Date(),
  );
  const [activeDate, setActiveDate] = useState(
    range?.from ?? new Date(),
  );

  const firstDay = startOfWeek(startOfMonth(visibleMonth));
  const lastDay = endOfWeek(endOfMonth(visibleMonth));
  const calendarDays = eachDayOfInterval({
    start: firstDay,
    end: lastDay,
  });

  const activeHoliday = UAE_HOLIDAYS_2026.find((holiday) =>
    isSameDay(holiday.date, activeDate),
  );
  const activeRequests = getRequestsForDate(requests, activeDate);

  function handleDateClick(date: Date) {
    setActiveDate(date);

    // First click starts a new range. Second click completes it.
    if (!range?.from || range.to || date < range.from) {
      onRangeChange({ from: date, to: undefined });
      return;
    }

    onRangeChange({ from: range.from, to: date });
  }

  return (
    <Card className="gap-5 rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-4" />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              My Leave Calendar
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              View holidays and leave status. Select dates to prepare a request.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Previous month"
            onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="min-w-32 text-center text-sm font-semibold text-foreground">
            {format(visibleMonth, "MMMM yyyy")}
          </span>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Next month"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 bg-muted/40">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="border-r border-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground last:border-r-0"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date) => {
              const holiday = UAE_HOLIDAYS_2026.find((item) =>
                isSameDay(item.date, date),
              );
              const dayRequests = getRequestsForDate(requests, date);
              const isActive = isSameDay(date, activeDate);
              const isCurrentMonth = isSameMonth(date, visibleMonth);

              const isInSelectedRange =
                range?.from &&
                range?.to &&
                isWithinInterval(date, {
                  start: range.from,
                  end: range.to,
                });

              return (
                <button
                  key={format(date, "yyyy-MM-dd")}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  aria-label={`Select ${format(date, "EEEE, d MMMM yyyy")}`}
                  aria-pressed={isActive}
                  className={cn(
                    "min-h-28 min-w-0 border-r border-t border-border/60 p-2 text-left align-top transition-colors hover:bg-primary/5",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isInSelectedRange && "bg-primary/5",
                    isActive && "ring-2 ring-inset ring-primary",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-primary text-white"
                        : "text-foreground",
                    )}
                  >
                    {format(date, "d")}
                  </span>

                  <div className="mt-1 space-y-1">
                    {holiday && (
                      <span className="block truncate rounded bg-violet-100 px-1.5 py-1 text-[10px] font-medium text-violet-800">
                        {holiday.name}
                      </span>
                    )}

                    {dayRequests.slice(0, 2).map((request) => {
                      const status = getStatus(request);

                      return (
                        <span
                          key={request.id}
                          className={cn(
                            "block truncate rounded px-1.5 py-1 text-[10px] font-medium",
                            status.className,
                          )}
                          title={`${request.typeLabel} — ${status.label}`}
                        >
                          {request.typeLabel} · {status.label}
                        </span>
                      );
                    })}

                    {dayRequests.length > 2 && (
                      <span className="block px-1 text-[10px] text-muted-foreground">
                        +{dayRequests.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>🟣 UAE public holiday</span>
        <span>🟢 Approved</span>
        <span>🟠 In process</span>
        <span>🔴 Denied</span>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Notes for {format(activeDate, "d MMMM yyyy")}
        </h3>

        {!activeHoliday && activeRequests.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            No holiday or leave request recorded for this date.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {activeHoliday && (
              <div className="rounded-lg bg-violet-100 px-3 py-2 text-xs text-violet-900">
                <span className="font-semibold">Public holiday:</span>{" "}
                {activeHoliday.name}
              </div>
            )}

            {activeRequests.map((request) => {
              const status = getStatus(request);

              return (
                <div
                  key={request.id}
                  className="rounded-lg border border-border/70 bg-card p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {request.typeLabel}
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-semibold",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {request.id} · {format(request.startDate, "d MMM")} –{" "}
                    {format(request.endDate, "d MMM yyyy")}
                  </p>

                  {request.reason && (
                    <p className="mt-2 text-xs text-foreground-secondary">
                      <span className="font-medium">Note:</span>{" "}
                      {request.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}