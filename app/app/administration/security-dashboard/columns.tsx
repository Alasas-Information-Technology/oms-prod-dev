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
  DeviceInfo?: string;
  BrowserName?: string;
  DeviceType?: string;
  LastActivityAt?: string;
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
  {
    key: "DeviceType",
    header: "Device",
    sortable: false,
    render: (_, row) => {
      const browser = row.BrowserName || "Unknown Browser";
      const device = row.DeviceType || row.DeviceInfo || "Unknown Device";
      return <span>{browser} on {device}</span>;
    }
  },
  { key: "IPAddress", header: "IP Address", sortable: true },
  {
    key: "LoginAt",
    header: "Signed In",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  },
  {
    key: "LastActivityAt",
    header: "Last Active",
    sortable: true,
    render: (val) => val ? format(new Date(val as string), 'MMM d, HH:mm') : '-'
  },
  {
    key: "IsActive",
    header: "Status",
    sortable: false,
    render: () => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
  }
];
