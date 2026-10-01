"use client";

import * as React from "react";
import { Link2, AlertCircle } from "lucide-react";
import { formatTime, getSlotDateLabel, REQUISITION_TIMEZONE } from "../calendar/calendar-utils";

export interface CollisionNoticeItem {
  slotStart: string;
  candidates: string[];
}

export interface CollisionNoticeProps {
  collisions: CollisionNoticeItem[];
  className?: string;
}

export function CollisionNotice({ collisions, className }: CollisionNoticeProps) {
  if (collisions.length === 0) return null;

  return (
    <div className="space-y-2">
      {collisions.map((item) => {
        const d = new Date(item.slotStart);
        const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: REQUISITION_TIMEZONE }).format(d);
        const timeLabel = formatTime(item.slotStart, REQUISITION_TIMEZONE);
        const timePhrase = `${dayLabel} ${timeLabel}`;

        return (
          <div
            key={item.slotStart}
            className="p-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs shadow-2xs flex items-start gap-2.5"
            role="alert"
          >
            <Link2 className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold block text-foreground">
                Shared time offer ({item.candidates.join(" & ")})
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                <strong className="font-semibold">{timePhrase}</strong> is in both plans. Whoever confirms first takes it; the other offer is withdrawn automatically.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
