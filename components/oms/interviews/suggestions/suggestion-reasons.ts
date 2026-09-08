/**
 * Reason Codes Localization & Formatting per INTERVIEW-PLANNING-UX.md §4.2 & Part 9
 *
 * Requirement 2: reasons are codes, not hardcoded sentences.
 * The client owns the wording so it can be localized and formatted responsively.
 */

import {
  InterviewSuggestionReasonCode,
  CandidateLocalTimeInfo,
} from "@/src/types/interview-planning";
import { getTimezoneAbbr } from "../calendar/calendar-utils";

/**
 * Maps standard reason codes to human-readable strings.
 */
export function formatReasonCode(
  code: InterviewSuggestionReasonCode | string,
  interviewerCount: number = 3
): string {
  switch (code) {
    case "ALL_INTERVIEWERS_FREE":
      return interviewerCount === 3 ? "All three free" : `All ${interviewerCount} free`;
    case "MORNING":
      return "Morning";
    case "AFTERNOON":
      return "Afternoon";
    case "TWO_DAYS_OUT":
      return "2 days out";
    case "THREE_DAYS_OUT":
      return "3 days out";
    case "FOUR_DAYS_OUT":
      return "4 days out";
    case "FIVE_DAYS_OUT":
      return "5 days out";
    case "WITHIN_CANDIDATE_HOURS":
      return "Within candidate hours";
    case "BACK_TO_BACK":
      return "Back-to-back with next interview";
    case "PREFERRED_METHOD":
      return "Matches candidate preference";
    case "PARTIAL_AVAILABILITY":
      return "Partial panel availability";
    default:
      // Graceful fallback for custom or unforeseen reason codes
      return code
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

/**
 * Builds the complete reason line from reason codes and optional candidate local time.
 * Example output: "All three free · Morning · 4 days out · 11:30 IST for candidate"
 */
export function buildReasonLine(
  reasons: (InterviewSuggestionReasonCode | string)[],
  interviewerCount: number = 3,
  candidateLocalTime?: CandidateLocalTimeInfo
): string[] {
  const parts: string[] = [];

  for (const reason of reasons) {
    // Avoid redundant mention if candidateLocalTime already provides local hour
    if (reason === "WITHIN_CANDIDATE_HOURS" && candidateLocalTime) {
      continue;
    }
    const label = formatReasonCode(reason, interviewerCount);
    if (label && !parts.includes(label)) {
      parts.push(label);
    }
  }

  if (candidateLocalTime) {
    const tzAbbr = getTimezoneAbbr(candidateLocalTime.timezone);
    parts.push(`${candidateLocalTime.start} ${tzAbbr} for candidate`);
  }

  return parts;
}
