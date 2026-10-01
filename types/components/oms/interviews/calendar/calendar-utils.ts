/**
 * Interview Calendar Timezone & Geometry Utilities
 *
 * Uses native Intl.DateTimeFormat for timezone conversions.
 * Guaranteeing exact conversions between UTC and regional timezones (Asia/Dubai, Asia/Kolkata).
 */

export const REQUISITION_TIMEZONE = "Asia/Dubai";
export const CALENDAR_START_HOUR = 8; // 08:00
export const CALENDAR_END_HOUR = 20; // 20:00 (12 hours total = 720 minutes)
export const TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60; // 720

/**
 * Format a UTC ISO date string into a local time string (e.g. "10:00")
 */
export function formatTime(utcIso: string, timeZone: string): string {
  const d = new Date(utcIso);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(d);
}

/**
 * Format short timezone abbreviation (e.g. "GST", "IST")
 */
export function getTimezoneAbbr(timeZone: string): string {
  if (timeZone === "Asia/Dubai") return "GST";
  if (timeZone === "Asia/Kolkata") return "IST";
  if (timeZone === "Europe/London") return "BST";
  if (timeZone === "America/New_York") return "EDT";
  return timeZone.split("/").pop() || timeZone;
}

/**
 * Format a slot's time range: "10:00 – 10:45 GST"
 */
export function formatSlotTimeRange(
  startUtcIso: string,
  durationMinutes: number,
  timeZone: string
): string {
  const start = new Date(startUtcIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const startTimeStr = formatTime(start.toISOString(), timeZone);
  const endTimeStr = formatTime(end.toISOString(), timeZone);
  const abbr = getTimezoneAbbr(timeZone);
  return `${startTimeStr} – ${endTimeStr} ${abbr}`;
}

/**
 * Format date label: "Mon 10 Aug"
 */
export function getSlotDateLabel(utcIso: string, timeZone: string = REQUISITION_TIMEZONE): string {
  const d = new Date(utcIso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(d);
}

/**
 * Check if a slot falls outside candidate's working/reasonable hours (08:00 to 20:00 local)
 */
export function isOutsideCandidateHours(
  startUtcIso: string,
  durationMinutes: number,
  candidateTimezone: string
): { isOutside: boolean; candidateLocalTime: string } {
  const start = new Date(startUtcIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  // Extract hours in candidate's timezone
  const startParts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: candidateTimezone,
  }).formatToParts(start);

  const endParts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: candidateTimezone,
  }).formatToParts(end);

  const startHour = parseInt(startParts.find((p) => p.type === "hour")?.value || "0", 10);
  const endHour = parseInt(endParts.find((p) => p.type === "hour")?.value || "0", 10);
  const endMinute = parseInt(endParts.find((p) => p.type === "minute")?.value || "0", 10);

  const startLocalFormatted = formatTime(start.toISOString(), candidateTimezone);
  const abbr = getTimezoneAbbr(candidateTimezone);

  // Outside if starts before 08:00 or finishes after 20:00
  const isOutside = startHour < 8 || endHour > 20 || (endHour === 20 && endMinute > 0);

  return {
    isOutside,
    candidateLocalTime: `${startLocalFormatted} ${abbr}`,
  };
}

/**
 * Given any reference date, calculate the Monday–Friday dates of that week
 */
export function getWorkingWeekDays(referenceDate: Date): Date[] {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance to Monday (if Sunday (0), distance is -6; else 1 - day)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

/**
 * Format week header range: e.g. "10 – 14 August 2026"
 */
export function formatWeekRangeHeader(weekDays: Date[]): string {
  if (!weekDays || weekDays.length === 0) return "";
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];

  const firstDay = first.getDate();
  const lastDay = last.getDate();
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(last);
  const year = last.getFullYear();

  return `${firstDay} – ${lastDay} ${month} ${year}`;
}

/**
 * Check if the week is strictly in the past
 */
export function isWeekInPast(weekDays: Date[]): boolean {
  if (!weekDays || weekDays.length === 0) return false;
  const lastDay = new Date(weekDays[weekDays.length - 1]);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay.getTime() < Date.now();
}

/**
 * Convert minutes from 08:00 GST on a specific date to a UTC ISO string
 */
export function minutesToUtcIso(day: Date, minutesFrom8am: number): string {
  // Day represents 00:00 in local timezone.
  // 08:00 GST is 04:00 UTC (Dubai is UTC+4).
  // Construct Year, Month, Day string
  const year = day.getFullYear();
  const totalMinutesFromMidnight = 8 * 60 + minutesFrom8am;
  const hours = Math.floor(totalMinutesFromMidnight / 60);
  const minutes = totalMinutesFromMidnight % 60;

  // Convert GST time (UTC+4) to UTC
  // UTC hour = hours - 4
  const utcDate = new Date(
    Date.UTC(
      year,
      day.getMonth(),
      day.getDate(),
      hours - 4, // Shift Dubai GST (UTC+4) to UTC
      minutes,
      0,
      0
    )
  );

  return utcDate.toISOString();
}

/**
 * Convert UTC ISO string to minutes from 08:00 GST
 */
export function utcIsoToMinutesFrom8am(utcIso: string): number {
  const d = new Date(utcIso);
  // Get hours and minutes in Asia/Dubai
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Asia/Dubai",
  }).formatToParts(d);

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  return (hour - CALENDAR_START_HOUR) * 60 + minute;
}

/**
 * Add N working days (skipping Saturday and Sunday)
 */
export function addWorkingDays(startDate: Date, daysToAdd: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < daysToAdd) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return result;
}

/**
 * Count working days between two dates
 */
export function countWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);
  const target = new Date(endDate);
  target.setHours(0, 0, 0, 0);

  while (cur < target) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return count;
}

/**
 * Format reply-by date display: "Reply by Thu 14 Aug (3 working days)"
 */
export function formatReplyByDateDisplay(
  dateStr: string,
  referenceDate: Date = new Date("2026-08-10T00:00:00Z")
): string {
  if (!dateStr) return "";
  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(targetDate);
  const dayNum = targetDate.getUTCDate();
  const month = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  }).format(targetDate);
  const workingDays = Math.max(1, countWorkingDaysBetween(referenceDate, targetDate));

  const daysLabel = workingDays === 1 ? "1 working day" : `${workingDays} working days`;
  return `Reply by ${weekday} ${dayNum} ${month} (${daysLabel})`;
}
