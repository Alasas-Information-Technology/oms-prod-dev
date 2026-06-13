import { ColumnDef } from "@/components/oms/DataTable";
import { format } from "date-fns";

export type DashboardSummary = {
  activeSessions: number;
  failedLogins24Hours: number;
  lockedUsers: number;
  securityEvents24Hours: number;

  successfulLogins24Hours: number;
  rateLimitEvents24Hours: number;
  activeUsersToday: number;
  revokedSessions24Hours: number;
  refreshTokenReplayEvents24Hours: number;
};

export type RawFailedLogin = {
  FailedLoginAttemptID: string;
  Username: string;
  IPAddress: string;
  FailureReason: string;
  AttemptedAt: string;
};

export type RawSecurityEvent = {
  SecurityEventID: string;
  EventType: string;
  EventDescription: string;
  IPAddress: string;
  CreatedAt: string;
};

export type RawActiveSession = {
  LoginSessionID: string;
  Username: string;
  IPAddress: string;
  LoginAt: string;
  ExpiresAt: string;
};

export type RawDashboardResponse = {
  summary?: DashboardSummary;
  events?: RawSecurityEvent[];
  failedLogins?: RawFailedLogin[];
  activeSessions?: RawActiveSession[];
};

export const failedLoginsColumns: ColumnDef<RawFailedLogin>[] = [
  { key: "Username", header: "User", sortable: true },
  { key: "IPAddress", header: "IP Address", sortable: true },
  { key: "FailureReason", header: "Reason", sortable: true },
  {
    key: "AttemptedAt",
    header: "Time",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  }
];

export const eventsColumns: ColumnDef<RawSecurityEvent>[] = [
  { key: "EventType", header: "Event Type", sortable: true },
  {
    key: "EventDescription",
    header: "Description",
    sortable: true,
    render: (val) => <div className="max-w-[300px] truncate" title={val as string || ""}>{val as string}</div>
  },
  { key: "IPAddress", header: "IP Address", sortable: true },
  {
    key: "CreatedAt",
    header: "Time",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  }
];

export const sessionsColumns: ColumnDef<RawActiveSession>[] = [
  {
    key: "LoginSessionID",
    header: "Session ID",
    sortable: true,
    render: (val) => <span className="font-mono text-xs">{val as string}</span>
  },
  { key: "Username", header: "User", sortable: true },
  { key: "IPAddress", header: "IP Address", sortable: true },
  {
    key: "LoginAt",
    header: "Created",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  },
  {
    key: "ExpiresAt",
    header: "Expires",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  }
];
